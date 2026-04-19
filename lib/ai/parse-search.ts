import { getAnthropicClient } from "./client";
import type { SearchFilters } from "@/lib/types/search";

const SYSTEM_PROMPT = `You are a photo search query parser. Parse the user's natural language query into structured search filters.
Return a JSON object with these optional fields:
- dateFrom: ISO date string (YYYY-MM-DD) if the user specifies a start date/period
- dateTo: ISO date string (YYYY-MM-DD) if the user specifies an end date/period
- tags: array of keyword tags to filter by
- scene: scene classification string
- location: location name if specified
- personName: person's name if searching by person
- freeText: remaining free-text description to search against photo descriptions

Examples:
- "photos of John at the beach" -> { personName: "John", scene: "beach", tags: ["beach"] }
- "sunset photos from last summer" -> { tags: ["sunset"], dateFrom: "2023-06-01", dateTo: "2023-08-31", scene: "landscape" }
- "birthday party 2022" -> { tags: ["birthday", "party"], dateFrom: "2022-01-01", dateTo: "2022-12-31" }
- "dog photos" -> { tags: ["dog", "pet"] }

Return ONLY valid JSON. No markdown, no explanation. Only include fields you have clear evidence for.`;

export async function parseSearchQuery(query: string): Promise<SearchFilters> {
  const client = getAnthropicClient();

  const response = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: query,
      },
    ],
  });

  const text = response.content.find((c) => c.type === "text")?.text ?? "{}";

  try {
    const parsed = JSON.parse(text) as Partial<SearchFilters>;
    return {
      dateFrom: parsed.dateFrom,
      dateTo: parsed.dateTo,
      tags: Array.isArray(parsed.tags) ? parsed.tags : undefined,
      scene: parsed.scene,
      location: parsed.location,
      personName: parsed.personName,
      freeText: parsed.freeText ?? (Object.keys(parsed).length === 0 ? query : undefined),
    };
  } catch {
    return { freeText: query };
  }
}
