// lib/ai.ts

import Anthropic from "@anthropic-ai/sdk";
import { CATEGORY_NAMES, type Drill, type SwingAnalysis } from "@/types/analysis";
import { buildPlayerContextBlock, type PlayerContext } from "@/lib/player-context";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Structured output schema so the response is always parseable JSON
const categorySchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    score: { type: "number" },
    severity: { type: "string", enum: ["good", "needs_work", "critical"] },
    observation: { type: "string" },
    tip: { type: "string" },
  },
  required: ["name", "score", "severity", "observation", "tip"],
  additionalProperties: false,
};

const drillSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    focus: { type: "string", enum: [...CATEGORY_NAMES] },
    steps: { type: "array", items: { type: "string" } },
    reps: { type: "string" },
    equipment: { type: "string" },
  },
  required: ["name", "focus", "steps", "reps", "equipment"],
  additionalProperties: false,
};

const analysisSchema = {
  type: "object",
  properties: {
    overall_score: { type: "number" },
    shot_type: { type: "string" },
    categories: { type: "array", items: categorySchema },
    top_priority: { type: "string" },
    drill: drillSchema,
  },
  required: ["overall_score", "shot_type", "categories", "top_priority", "drill"],
  additionalProperties: false,
};

// Plain-text version kept in swings.drill_recommendation
export function drillToText(drill: Drill): string {
  return `${drill.name}: ${drill.steps.join(" ")} (${drill.reps})`;
}

export async function analyzeSwing(
  frameBase64Images: string[],
  shotType: string = "forehand",
  // Signed-in players: their level and recent swings, so feedback fits them
  context?: PlayerContext
): Promise<SwingAnalysis> {
  const systemPrompt = `You are an expert tennis coach with 20 years of experience coaching players from beginners to professionals. You specialize in biomechanical analysis of tennis strokes and provide clear, actionable feedback.`;

  const userPrompt = `I will provide you with ${frameBase64Images.length} frames from a video showing a tennis ${shotType} swing. The frames show the progression from preparation through follow-through.

Analyze this player's technique across these key categories:
1. Stance & Preparation
2. Backswing & Unit Turn
3. Contact Point
4. Follow-Through
5. Footwork & Balance

For each category, provide:
- A score out of 10
- A severity indicator: "good" (7-10), "needs_work" (4-6), or "critical" (1-3)
- A one-sentence observation about what you see
- One specific, actionable tip for improvement

Also provide:
- An overall score (average of categories)
- The single most important thing this player should work on (top_priority)
- One drill that targets the top priority (their weakest area), with:
  - name: a short, specific name (e.g. "Cone contact-point drill")
  - focus: the category it works on, exactly one of the five names above
  - steps: 2 to 5 short, imperative steps
  - reps: how much to do (e.g. "3 sets of 10" or "5 minutes")
  - equipment: what's needed (e.g. "None" or "Cones, a partner to feed")

Return your response as a JSON object with this exact structure:

{
  "overall_score": <number>,
  "shot_type": "${shotType}",
  "categories": [
    {
      "name": "Stance & Preparation",
      "score": <number>,
      "severity": <"good" | "needs_work" | "critical">,
      "observation": "<string>",
      "tip": "<string>"
    },
    {
      "name": "Backswing & Unit Turn",
      "score": <number>,
      "severity": <"good" | "needs_work" | "critical">,
      "observation": "<string>",
      "tip": "<string>"
    },
    {
      "name": "Contact Point",
      "score": <number>,
      "severity": <"good" | "needs_work" | "critical">,
      "observation": "<string>",
      "tip": "<string>"
    },
    {
      "name": "Follow-Through",
      "score": <number>,
      "severity": <"good" | "needs_work" | "critical">,
      "observation": "<string>",
      "tip": "<string>"
    },
    {
      "name": "Footwork & Balance",
      "score": <number>,
      "severity": <"good" | "needs_work" | "critical">,
      "observation": "<string>",
      "tip": "<string>"
    }
  ],
  "top_priority": "<string>",
  "drill": {
    "name": "<string>",
    "focus": <one of the five category names>,
    "steps": ["<string>", "..."],
    "reps": "<string>",
    "equipment": "<string>"
  }
}

Be specific and avoid generic advice like "practice more" or "watch your form."${buildPlayerContextBlock(context, shotType)}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-5-5",
      max_tokens: 16000,
      output_config: { format: { type: "json_schema", schema: analysisSchema } },
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: userPrompt,
            },
            ...frameBase64Images.map((base64Image) => ({
              type: "image" as const,
              source: {
                type: "base64" as const,
                media_type: "image/jpeg" as const,
                data: base64Image,
              },
            })),
          ],
        },
      ],
    });

    // Extract text from response
    const textContent = response.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from Claude");
    }

    // Parse JSON response
// Parse JSON response - strip markdown code fences if present
let jsonText = textContent.text.trim();

// Remove ```json and ``` if Claude wrapped the response
if (jsonText.startsWith("```json")) {
  jsonText = jsonText.replace(/^```json\s*/, "").replace(/```\s*$/, "");
} else if (jsonText.startsWith("```")) {
  jsonText = jsonText.replace(/^```\s*/, "").replace(/```\s*$/, "");
}

const parsed = JSON.parse(jsonText) as Omit<SwingAnalysis, "drill_recommendation"> & { drill: Drill };
return { ...parsed, drill_recommendation: drillToText(parsed.drill) };
  } catch (error) {
    console.error("Error analyzing swing:", error);
    throw new Error("Failed to analyze swing. Please try again.");
  }
}