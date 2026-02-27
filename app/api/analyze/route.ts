// app/api/analyze/route.ts

import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { extractFrames, cleanupVideo } from "@/lib/ffmpeg";
import { analyzeSwing } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
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

    // Return analysis with frames
    return NextResponse.json({
      ...analysis,
      categories: categoriesWithFrames,
      frames: frames, // Include the base64 frames
    });
  } catch (error) {
    console.error("Error in analyze route:", error);
    return NextResponse.json(
      { error: "Failed to analyze video. Please try again." },
      { status: 500 }
    );
  }
}