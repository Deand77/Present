import Anthropic from "@anthropic-ai/sdk";
import { QUESTIONS } from "./questions";
import type { Profile, Profiles } from "./types";

export const MODEL = "claude-opus-4-7";

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
  for (const [section, items] of bySection) {
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
