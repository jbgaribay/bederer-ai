// lib/ffmpeg.ts

import ffmpeg from "fluent-ffmpeg";
import { mkdir, readdir, readFile } from "fs/promises";
import path from "path";

const MAX_FRAME_WIDTH = 960;

// Frames go in a "frames" folder next to the video. The caller gives each scan its own
// folder (and deletes it afterwards), so concurrent scans never see each other's frames.
export async function extractFrames(
  videoPath: string,
  numberOfFrames: number = 6
): Promise<string[]> {
  const outputDir = path.join(path.dirname(videoPath), "frames");
  await mkdir(outputDir, { recursive: true });

  // Cap frames at 960px wide (smaller to store and to send to the AI); never upscale
  const width = await new Promise<number | undefined>((resolve, reject) =>
    ffmpeg.ffprobe(videoPath, (error, data) => {
      if (error) return reject(error);
      resolve(data.streams.find((stream) => stream.codec_type === "video")?.width);
    })
  );
  const size = width && width > MAX_FRAME_WIDTH ? `${MAX_FRAME_WIDTH}x?` : undefined;

  await new Promise<void>((resolve, reject) => {
    ffmpeg(videoPath)
      .on("end", () => resolve())
      .on("error", reject)
      .screenshots({
        count: numberOfFrames,
        folder: outputDir,
        filename: "frame-%i.jpg",
        ...(size && { size }),
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
