// app/api/analyze/route.ts

import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { extractFrames, cleanupVideo } from "@/lib/ffmpeg";
import { analyzeSwing } from "@/lib/ai";
import { createClient } from "@/lib/supabase/server";

// Set after a guest's free scan; guests with this cookie must sign up to keep scanning.
const FREE_SCAN_COOKIE = "bederer_free_scan_used";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: claimsData } = await supabase.auth.getClaims();
    const userId = claimsData?.claims?.sub ?? null;

    if (!userId && request.cookies.get(FREE_SCAN_COOKIE)) {
      return NextResponse.json(
        { error: "Create a free account to keep analyzing swings.", code: "SIGNUP_REQUIRED" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("video") as File;
    const shotType = formData.get("shotType") as string || "forehand";

    if (!file) {
      return NextResponse.json(
        { error: "No video file provided" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save video temporarily
    const tmpDir = path.join(process.cwd(), "tmp");
    const videoPath = path.join(tmpDir, `upload-${Date.now()}.mp4`);
    
    // Create tmp directory if it doesn't exist
    const fs = require("fs");
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    await writeFile(videoPath, buffer);

    // Extract frames from video
    console.log("Extracting frames...");
    const frames = await extractFrames(videoPath, 6);
    console.log(`Extracted ${frames.length} frames`);

    // Analyze swing with AI
    console.log("Analyzing swing with AI...");
    const analysis = await analyzeSwing(frames, shotType);
    console.log("Analysis complete");

    // Clean up temporary video file
    await cleanupVideo(videoPath);

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

    // Save to the signed-in user's history (frames are too large to store)
    if (userId) {
      const { error: insertError } = await supabase.from("swings").insert({
        user_id: userId,
        shot_type: analysis.shot_type,
        overall_score: analysis.overall_score,
        categories: categoriesWithFrames,
        top_priority: analysis.top_priority,
        drill_recommendation: analysis.drill_recommendation,
      });
      if (insertError) console.error("Failed to save swing:", insertError);
    }

    // Return analysis with frames
    const response = NextResponse.json({
      ...analysis,
      categories: categoriesWithFrames,
      frames: frames, // Include the base64 frames
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