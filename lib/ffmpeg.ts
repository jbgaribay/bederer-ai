// lib/ffmpeg.ts

import ffmpeg from "fluent-ffmpeg";
import { mkdir, readdir, readFile } from "fs/promises";
import path from "path";

// Frames go in a "frames" folder next to the video. The caller gives each scan its own
// folder (and deletes it afterwards), so concurrent scans never see each other's frames.
export async function extractFrames(
  videoPath: string,
  numberOfFrames: number = 6
): Promise<string[]> {
  const outputDir = path.join(path.dirname(videoPath), "frames");
  await mkdir(outputDir, { recursive: true });

  await new Promise<void>((resolve, reject) => {
    ffmpeg(videoPath)
      .on("end", () => resolve())
      .on("error", reject)
      .screenshots({
        count: numberOfFrames,
        folder: outputDir,
        filename: "frame-%i.jpg",
      });
  });

  // Numeric sort so frame-10 comes after frame-9
  const frameNumber = (file: string) => Number(file.match(/\d+/)?.[0] ?? 0);
  const frameFiles = (await readdir(outputDir))
    .filter((file) => file.startsWith("frame-"))
    .sort((a, b) => frameNumber(a) - frameNumber(b))
    .slice(0, numberOfFrames);

  return Promise.all(
    frameFiles.map(async (file) => (await readFile(path.join(outputDir, file))).toString("base64"))
  );
}
