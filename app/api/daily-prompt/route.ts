import { NextRequest, NextResponse } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";
import { client, DAILY_MODEL, buildProfilesContext, resolveApiKey } from "@/lib/claude";
import type { Profiles, Protocol, DailyEntry } from "@/lib/types";

export const runtime = "nodejs";
// Vercel: Hobby caps at 60s, Pro at 300s. Daily prompts are short — 60 is plenty.
export const maxDuration = 60;

const SYSTEM = `You are a relationship coach generating a single, specific check-in prompt for the user — Person A — to help them be more present with their partner today.

You have access to:
- Both partners' profiles
- The personalized protocol you designed for them
- Recent daily prompts they've already received (avoid repeating)

Output ONE check-in for today. It should include:

1. **A noticing prompt** (1–2 sentences): something specific to watch for in their partner today, drawn from the profiles. Not generic — tied to a real pattern.

2. **A small action** (1–2 sentences): one concrete, doable thing for today — under 5 minutes. Tied to their partner's actual love language and support needs.

3. **A reflection question** (1 sentence): something for them to sit with for 30 seconds.

Tone: warm, direct, like a trusted friend who knows them well. Use the partner's name. Speak in second person to Person A.

Keep the whole thing under 150 words. Format as Markdown with the three sections labeled **Notice**, **Do**, **Reflect**.`;

export async function POST(req: NextRequest) {
  try {
    const { apiKey, profiles, protocol, recentDaily } = (await req.json()) as {
      apiKey?: string;
      profiles: Profiles;
      protocol?: Protocol;
      recentDaily?: DailyEntry[];
    };

    const resolvedKey = resolveApiKey(apiKey);
    if (!resolvedKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 400 });
    }
    if (!profiles.you || !profiles.partner) {
      return NextResponse.json(
        { error: "Both profiles must be completed first" },
        { status: 400 },
      );
    }

    const profileContext = buildProfilesContext(profiles);
    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

    const recentSummary =
      recentDaily && recentDaily.length > 0
        ? recentDaily
            .slice(0, 7)
            .map((d) => `- ${d.date}: ${d.prompt.slice(0, 200)}`)
            .join("\n")
        : "(none yet)";

    const userMsg = `Today is ${today}.

Recent prompts already given (don't repeat themes):
${recentSummary}

${protocol ? `Protocol summary you previously designed:\n\n${protocol.content.slice(0, 4000)}\n\n` : ""}

Give me today's check-in.`;

    const anthropic = client(resolvedKey);
    // Haiku 4.5: cheap, fast, no thinking needed for a short Markdown reply.
    const response = await anthropic.messages.create({
      model: DAILY_MODEL,
      max_tokens: 1500,
      system: [
        { type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } },
        { type: "text", text: `Profiles:\n\n${profileContext}`, cache_control: { type: "ephemeral" } },
      ],
      messages: [{ role: "user", content: userMsg }],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    return NextResponse.json({ content: text, model: response.model, usage: response.usage });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
