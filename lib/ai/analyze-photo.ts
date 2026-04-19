import { getAnthropicClient } from "./client";
import type { AiAnalysisResult } from "@/lib/types/pipeline";

const SYSTEM_PROMPT = `You are an AI photo analyst. Analyze the provided image and return a JSON object with the following fields:
- description: A clear, concise description of the image (1-3 sentences)
- tags: An array of relevant keyword tags (5-15 tags covering subjects, activities, settings, colors, mood)
- scene: A brief scene classification (e.g., "outdoor portrait", "street photography", "landscape", "indoor gathering", "food", "architecture")
- location: If the location is visually identifiable (famous landmark, distinctive geography), return a string. Otherwise return null.
- faces: An array of detected faces. Each face object must have:
  - bbox: { x, y, w, h } as fractions of image dimensions (0.0 to 1.0)
  - estimated_age: optional integer estimate
  - gender_hint: optional string ("male", "female", "nonbinary") — omit if uncertain

Return ONLY valid JSON. No markdown, no explanation.`;

export async function analyzePhoto(imageBuffer: Buffer): Promise<AiAnalysisResult> {
  const client = getAnthropicClient();
  const base64 = imageBuffer.toString("base64");

  const response = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: base64,
            },
          },
          {
            type: "text",
            text: "Analyze this photo and return the JSON response.",
          },
        ],
      },
    ],
  });

  const text = response.content.find((c) => c.type === "text")?.text ?? "{}";

  try {
    const parsed = JSON.parse(text) as Partial<AiAnalysisResult>;
    return {
      description: parsed.description ?? "",
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      scene: parsed.scene ?? "unknown",
      location: parsed.location ?? null,
      faces: Array.isArray(parsed.faces) ? parsed.faces : [],
    };
  } catch {
    return {
      description: text.slice(0, 500),
      tags: [],
      scene: "unknown",
      location: null,
      faces: [],
    };
  }
}
