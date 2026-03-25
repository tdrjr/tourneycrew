import Anthropic from "@anthropic-ai/sdk";
import type { TipModerationResult, TipCategory } from "@/types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODERATION_PROMPT = `You are a content moderator for TourneyCrew, a family-friendly platform where parents share tips about youth sports tournaments.

Your job is to evaluate a submitted family tip and determine if it should be approved.

Guidelines for APPROVAL:
- The tip is relevant to attending a tournament (parking, food, WiFi, seating, lodging, general info)
- The content is helpful, specific, and actionable
- The tone is respectful and family-friendly
- No spam, promotional content, or self-promotion

Guidelines for REJECTION:
- Offensive, inappropriate, or harassing content
- Spam or obvious promotional content (unless it's a genuine local business recommendation)
- Completely irrelevant to tournament attendance
- Misinformation or harmful advice
- Personal attacks on venues, staff, or other families

Respond in JSON format:
{
  "approved": boolean,
  "score": number (0.0–1.0, where 1.0 is excellent quality),
  "reason": "brief explanation in 1-2 sentences"
}`;

export async function moderateTip(
  title: string,
  body: string,
  category: TipCategory
): Promise<TipModerationResult> {
  const userContent = `
Category: ${category}
Title: ${title}
Body: ${body}
  `.trim();

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    system: MODERATION_PROMPT,
    messages: [
      {
        role: "user",
        content: userContent,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  try {
    // Extract JSON from the response (Claude sometimes wraps in markdown)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    return JSON.parse(jsonMatch[0]) as TipModerationResult;
  } catch {
    console.error("Failed to parse moderation response:", text);
    // Default to pending review if parsing fails
    return { approved: false, score: 0, reason: "Moderation parsing error — queued for manual review." };
  }
}

export async function generateTournamentSummary(
  tournamentName: string,
  venueName: string,
  city: string,
  state: string,
  sport: string,
  ageGroups: string[]
): Promise<string> {
  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: `Write a 2-3 sentence family-friendly summary for a ${sport} tournament called "${tournamentName}" at ${venueName} in ${city}, ${state}. Age groups: ${ageGroups.join(", ")}. Focus on what families need to know to have a great experience. Keep it warm, informative, and encouraging.`,
      },
    ],
  });

  return message.content[0].type === "text"
    ? message.content[0].text
    : "";
}
