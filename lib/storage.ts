"use client";

import type { AppData, Profile, Person, Protocol, DailyEntry } from "./types";

const KEY = "present:v1";
const CURRENT_VERSION = 1;

function defaults(): AppData {
  return { version: CURRENT_VERSION, profiles: {}, daily: [] };
}

function read(): AppData {
  if (typeof window === "undefined") return defaults();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return {
      ...defaults(),
      ...parsed,
      profiles: parsed.profiles || {},
      daily: parsed.daily || [],
    };
  } catch {
    return defaults();
  }
}

function write(data: AppData) {
  data.version = CURRENT_VERSION;
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function getApiKey(): string | undefined {
  return read().apiKey;
}

export function setApiKey(key: string) {
  const data = read();
  data.apiKey = key.trim() || undefined;
  write(data);
}

export function getProfile(person: Person): Profile | undefined {
  return read().profiles[person];
}

export function getProfiles() {
  return read().profiles;
}

export function setProfile(person: Person, profile: Profile) {
  const data = read();
  data.profiles[person] = profile;
  write(data);
}

export function getProtocol(): Protocol | undefined {
  return read().protocol;
}

export function setProtocol(protocol: Protocol) {
  const data = read();
  data.protocol = protocol;
  write(data);
}

export function getDaily(): DailyEntry[] {
  return read().daily || [];
}

export function addDaily(entry: DailyEntry) {
  const data = read();
  const without = (data.daily || []).filter((d) => d.date !== entry.date);
  data.daily = [entry, ...without].slice(0, 60);
  write(data);
}

export function updateDailyReflection(date: string, reflection: string) {
  const data = read();
  data.daily = (data.daily || []).map((d) =>
    d.date === date ? { ...d, reflection } : d,
  );
  write(data);
}

export function resetAll() {
  localStorage.removeItem(KEY);
}

export function exportJson(): string {
  const data = read();
  const safe = { ...data, apiKey: data.apiKey ? "(redacted)" : undefined };
  return JSON.stringify(safe, null, 2);
}
