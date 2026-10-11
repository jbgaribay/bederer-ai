// app/api/analyze/route.ts

import { NextRequest, NextResponse } from "next/server";
import { analyzeSwing } from "@/lib/ai";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import { weakestCategory, type PlayerContext } from "@/lib/player-context";

// Set after a guest's free scan; guests with this cookie must sign up to keep scanning.
const FREE_SCAN_COOKIE = "bederer_free_scan_used";

// The browser pulls the frames and sends ~300 KB of JPEGs (see lib/extract-frames.ts).
// Stay under Vercel's 4.5 MB request limit.
const FRAME_COUNT = 6;
const MAX_FRAME_BYTES = 1.5 * 1024 * 1024;
const MAX_REQUEST_BYTES = 4 * 1024 * 1024;
const SHOT_TYPES = ["forehand", "backhand", "serve", "volley"];
const SWING_FRAMES_BUCKET = "swing-frames";

// Analysis can take ~10-30s; give the function room on Vercel
export const maxDuration = 60;

// Decodes and checks the uploaded frames; returns null if anything is off
function parseFrames(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length !== FRAME_COUNT) return null;
  const frames: string[] = [];
  for (const frame of value) {
    if (typeof frame !== "string") return null;
    const bytes = Buffer.from(frame, "base64");
    // JPEG files start with FF D8 FF
    if (bytes.length === 0 || bytes.length > MAX_FRAME_BYTES) return null;
    if (bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) return null;
    frames.push(bytes.toString("base64"));
  }
  return frames;
}

// The player's level and last few swings of this shot type. RLS limits both reads to their
// own rows. Any failure just means generic feedback; it never fails the scan.
async function loadPlayerContext(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  shotType: string
): Promise<PlayerContext | undefined> {
  try {
    const [profileResult, swingsResult] = await Promise.all([
      supabase.from("profiles").select("first_name, utr, usta_level").eq("id", userId).maybeSingle(),
      supabase
        .from("swings")
        .select("created_at, overall_score, top_priority, categories")
        .eq("shot_type", shotType)
        .order("created_at", { ascending: false })
        .limit(3),
    ]);
    if (profileResult.error) console.error("Failed to load profile for coaching:", profileResult.error);
    if (swingsResult.error) console.error("Failed to load recent swings for coaching:", swingsResult.error);

    const profile = profileResult.data;
    return {
      firstName: profile?.first_name,
      utr: profile?.utr == null ? null : Number(profile.utr),
      ustaLevel: profile?.usta_level == null ? null : Number(profile.usta_level),
      recent: (swingsResult.data ?? []).map((swing) => ({
        date: new Date(swing.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        overall_score: Number(swing.overall_score),
        top_priority: swing.top_priority,
        weakest: weakestCategory(swing.categories),
      })),
    };
  } catch (error) {
    console.error("Failed to load player context:", error);
    return undefined;
  }
}

// Uploads the frames as the signed-in user (storage RLS limits them to their own folder).
// Returns paths in frame order, null for any that failed, or null if none uploaded.
// A failed upload never fails the scan; the swing is just saved without those frames.
async function uploadFrames(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  swingId: string,
  frames: string[]
): Promise<(string | null)[] | null> {
  const results = await Promise.allSettled(
    frames.map(async (frame, i) => {
      const framePath = `${userId}/${swingId}/frame-${i + 1}.jpg`;
      const { error } = await supabase.storage
        .from(SWING_FRAMES_BUCKET)
        .upload(framePath, Buffer.from(frame, "base64"), { contentType: "image/jpeg" });
      if (error) throw error;
      return framePath;
    })
  );
  const paths = results.map((result) => {
    if (result.status === "fulfilled") return result.value;
    console.error("Failed to upload frame:", result.reason);
    return null;
  });
  return paths.some(Boolean) ? paths : null;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: claimsData } = await supabase.auth.getClaims();
    const userId = claimsData?.claims?.sub ?? null;
    // Admins skip every scan limit (signed-in accounts are currently unlimited anyway)
    const admin = isAdmin(claimsData?.claims);

    if (!userId && !admin && request.cookies.get(FREE_SCAN_COOKIE)) {
      return NextResponse.json(
        { error: "Create a free account to keep analyzing swings.", code: "SIGNUP_REQUIRED" },
        { status: 403 }
      );
    }

    // Reject oversized requests before reading the body
    if (Number(request.headers.get("content-length") ?? 0) > MAX_REQUEST_BYTES) {
      return NextResponse.json({ error: "Upload is too large." }, { status: 413 });
    }

    let body: { frames?: unknown; shotType?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const frames = parseFrames(body.frames);
    const shotType = typeof body.shotType === "string" ? body.shotType : "forehand";
    if (!frames) {
      return NextResponse.json(
        { error: "We couldn't read the frames from that video. Please try another clip." },
        { status: 400 }
      );
    }
    if (!SHOT_TYPES.includes(shotType)) {
      return NextResponse.json({ error: "Unknown shot type." }, { status: 400 });
    }

    const context = userId ? await loadPlayerContext(supabase, userId, shotType) : undefined;

    console.log("Analyzing swing with AI...");
    const analysis = await analyzeSwing(frames, shotType, context);
    console.log("Analysis complete");

    // Add frame index mapping to categories
    const categoriesWithFrames = analysis.categories.map((category, index) => {
      // Map categories to specific frames
      const frameMapping: { [key: string]: number } = {
        "Stance & Preparation": 0,
        "Backswing & Unit Turn": 1,
        "Contact Point": 2,
        "Follow-Through": 3,
        "Footwork & Balance": 5,
      };
      
      return {
        ...category,
        frameIndex: frameMapping[category.name] ?? index,
      };
    });

    // Save to the signed-in user's history, with the frames in their private storage folder
    let swingId: string | undefined;
    let savedFramePaths: (string | null)[] | null = null;
    if (userId) {
      const newSwingId = crypto.randomUUID();
      const framePaths = await uploadFrames(supabase, userId, newSwingId, frames);

      const { error: insertError } = await supabase.from("swings").insert({
        id: newSwingId,
        user_id: userId,
        shot_type: analysis.shot_type,
        overall_score: analysis.overall_score,
        categories: categoriesWithFrames,
        top_priority: analysis.top_priority,
        drill_recommendation: analysis.drill_recommendation,
        frame_paths: framePaths,
      });
      if (insertError) console.error("Failed to save swing:", insertError);
      else {
        swingId = newSwingId;
        savedFramePaths = framePaths;
      }
    }

    // Return analysis with frames; swing_id lets the client delete the saved row
    const response = NextResponse.json({
      ...analysis,
      categories: categoriesWithFrames,
      frames: frames, // Include the base64 frames
      swing_id: swingId,
      frame_paths: savedFramePaths,
    });

    if (!userId) {
      response.cookies.set(FREE_SCAN_COOKIE, "1", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("Error in analyze route:", error);
    return NextResponse.json(
      { error: "Failed to analyze video. Please try again." },
      { status: 500 }
    );
  }
}