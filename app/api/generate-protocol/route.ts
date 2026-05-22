import { NextRequest, NextResponse } from "next/server";
import { client, MODEL, buildProfilesContext } from "@/lib/claude";
import type { Profiles } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

const SYSTEM = `You are a thoughtful relationship coach drawing on attachment theory, the Gottman Method, Nonviolent Communication, and contemporary research on emotional attunement.

You are being given detailed profiles of two partners. Your task is to design a concrete, personalized PROTOCOL — a practical operating manual — that helps Person A be a more present, attuned partner to Person B (and, where relevant, vice versa).

Tone: warm, direct, specific. No generic advice. No platitudes. Speak plainly to Person A in second person ("you"). Refer to the partner by name.

Structure your output as Markdown with these sections:

# Protocol for [Person A's name] & [Partner's name]

## What I see in the two of you
Two or three paragraphs synthesizing the dynamic — what each of them needs, where the misattunements likely happen, and what's working.

## How [Partner's name] actually feels supported
A bulleted list of 5–8 specific behaviors, drawn from their answers. Each item should be concrete enough to do tomorrow. Avoid "be more present" — say what that means for *this* person.

## When [Partner's name] is stressed or shut down
A clear playbook: how to recognize it, what they need, what NOT to do. Use their own language where you can.

## Daily presence practices
3–5 small daily rituals tailored to both profiles. Each should take under 5 minutes. Be specific about timing and form.

## Repair when you mess up
What a good repair looks like for *this* partner. What they need first. What a real apology sounds like to them.

## Things to stop doing
3–5 specific behaviors to drop, based on what their partner has said hurts or doesn't help.

## A note for [Partner's name] too
A short section addressed to the partner, on how they can help Person A show up — since this is a two-way street.

Length: thorough but not bloated. Aim for 1200–1800 words total. Quote phrases from their answers when it makes the advice land harder.`;

export async function POST(req: NextRequest) {
  try {
    const { apiKey, profiles } = (await req.json()) as {
      apiKey: string;
      profiles: Profiles;
    };

    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 400 });
    }
    if (!profiles.you || !profiles.partner) {
      return NextResponse.json(
        { error: "Both profiles must be completed first" },
        { status: 400 }
      );
    }

    const profileContext = buildProfilesContext(profiles);

    const anthropic = client(apiKey);
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      system: [
        { type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } },
        { type: "text", text: `Profiles:\n\n${profileContext}` },
      ],
      messages: [
        {
          role: "user",
          content:
            "Design the protocol now. Be specific, warm, and concrete. Use their names throughout.",
        },
      ],
    });

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("\n");

    return NextResponse.json({
      content: text,
      model: response.model,
      usage: response.usage,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
