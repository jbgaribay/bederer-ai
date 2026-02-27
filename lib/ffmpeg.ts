// lib/ffmpeg.ts

import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import { promisify } from "util";

const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

export async function extractFrames(
  videoPath: string,
  numberOfFrames: number = 6
): Promise<string[]> {
  const outputDir = path.join(process.cwd(), "tmp", "frames");
  
  // Create tmp directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPattern = path.join(outputDir, "frame-%d.jpg");

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .on("end", async () => {
        try {
          // Read all generated frames
          const frameFiles = fs
            .readdirSync(outputDir)
            .filter((file) => file.startsWith("frame-"))
            .sort()
            .slice(0, numberOfFrames);

          // Convert frames to base64
          const base64Frames: string[] = [];
          for (const file of frameFiles) {
            const filePath = path.join(outputDir, file);
            const buffer = await readFile(filePath);
            const base64 = buffer.toString("base64");
            base64Frames.push(base64);

            // Clean up frame file
            await unlink(filePath);
          }

          resolve(base64Frames);
        } catch (error) {
          reject(error);
        }
      })
      .on("error", (error) => {
        reject(error);
      })
      .screenshots({
        count: numberOfFrames,
        folder: outputDir,
        filename: "frame-%i.jpg",
      });
  });
}

export async function cleanupVideo(videoPath: string): Promise<void> {
  try {
    await unlink(videoPath);
  } catch (error) {
    console.error("Error cleaning up video:", error);
  }
}