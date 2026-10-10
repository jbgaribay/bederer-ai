// lib/ai.ts

import Anthropic from "@anthropic-ai/sdk";
import { SwingAnalysis } from "@/types/analysis";

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

const analysisSchema = {
  type: "object",
  properties: {
    overall_score: { type: "number" },
    shot_type: { type: "string" },
    categories: { type: "array", items: categorySchema },
    top_priority: { type: "string" },
    drill_recommendation: { type: "string" },
  },
  required: ["overall_score", "shot_type", "categories", "top_priority", "drill_recommendation"],
  additionalProperties: false,
};

export async function analyzeSwing(
  frameBase64Images: string[],
  shotType: string = "forehand"
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
- A specific drill recommendation based on their weaknesses

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
  "drill_recommendation": "<string>"
}

Be specific and avoid generic advice like "practice more" or "watch your form."`;

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

const analysis: SwingAnalysis = JSON.parse(jsonText);
return analysis;
  } catch (error) {
    console.error("Error analyzing swing:", error);
    throw new Error("Failed to analyze swing. Please try again.");
  }
}