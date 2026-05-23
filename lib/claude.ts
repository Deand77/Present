import Anthropic from "@anthropic-ai/sdk";
import { QUESTIONS, SECTIONS } from "./questions";
import type { Profile, Profiles } from "./types";

// Two-model split: Opus 4.7 for the one-shot protocol (where deep synthesis
// is worth the cost), Haiku 4.5 for the daily check-ins (short, frequent,
// cost-sensitive). Both are current GA model IDs.
export const PROTOCOL_MODEL = "claude-opus-4-7";
export const DAILY_MODEL = "claude-haiku-4-5";

// Back-compat alias.
export const MODEL = PROTOCOL_MODEL;

export function buildProfileBlock(label: string, profile: Profile): string {
  const lines: string[] = [`### ${label}: ${profile.name}`];
  const bySection = new Map<string, string[]>();
  for (const q of QUESTIONS) {
    const a = profile.answers[q.id];
    if (!a) continue;
    const arr = bySection.get(q.section) || [];
    arr.push(`- ${q.prompt}\n  ${a}`);
    bySection.set(q.section, arr);
  }
  for (const section of SECTIONS) {
    const items = bySection.get(section);
    if (!items) continue;
    lines.push(`\n**${section}**`);
    lines.push(items.join("\n"));
  }
  return lines.join("\n");
}

export function buildProfilesContext(profiles: Profiles): string {
  const parts: string[] = [];
  if (profiles.you) parts.push(buildProfileBlock("Person A (the user)", profiles.you));
  if (profiles.partner) parts.push(buildProfileBlock("Person B (their partner)", profiles.partner));
  return parts.join("\n\n");
}

export function client(apiKey: string) {
  return new Anthropic({ apiKey });
}

// Prefer the per-request key the user typed into the app; fall back to
// ANTHROPIC_API_KEY for self-hosters who set it server-side once.
export function resolveApiKey(requestKey?: string): string | undefined {
  const k = (requestKey || "").trim();
  if (k) return k;
  const env = (process.env.ANTHROPIC_API_KEY || "").trim();
  return env || undefined;
}
