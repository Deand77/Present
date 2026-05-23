"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  addDaily,
  getApiKey,
  getDaily,
  getProfiles,
  getProtocol,
  updateDailyReflection,
} from "@/lib/storage";
import Markdown from "@/components/Markdown";
import type { DailyEntry } from "@/lib/types";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(d: string): string {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function ReflectionEditor({
  entry,
  onSaved,
}: {
  entry: DailyEntry;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState(entry.reflection || "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const timer = useRef<number | null>(null);
  const lastSaved = useRef(entry.reflection || "");

  useEffect(() => {
    setDraft(entry.reflection || "");
    lastSaved.current = entry.reflection || "";
  }, [entry.date]);

  useEffect(() => {
    if (draft === lastSaved.current) return;
    setStatus("saving");
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      updateDailyReflection(entry.date, draft);
      lastSaved.current = draft;
      setStatus("saved");
      onSaved();
    }, 600);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [draft, entry.date, onSaved]);

  return (
    <div>
      <label className="block text-sm uppercase tracking-wider text-accent mb-2">
        Reflection
      </label>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={4}
        placeholder="How did it go? What did you notice?"
        className="w-full bg-white/70 border border-line rounded px-3 py-2 focus:outline-none focus:border-accent resize-y"
      />
      <div className="mt-1 text-xs text-muted h-4">
        {status === "saving" && "Saving…"}
        {status === "saved" && "Saved"}
      </div>
    </div>
  );
}

export default function DailyPage() {
  const [hasKey, setHasKey] = useState(false);
  const [hasProfiles, setHasProfiles] = useState(false);
  const [daily, setDaily] = useState<DailyEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHasKey(!!getApiKey());
    const p = getProfiles();
    setHasProfiles(!!p.you && !!p.partner);
    setDaily(getDaily());
    setHydrated(true);
  }, []);

  const today = todayKey();
  const todayEntry = daily.find((d) => d.date === today);

  const generate = async () => {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/daily-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: getApiKey(),
          profiles: getProfiles(),
          protocol: getProtocol(),
          recentDaily: getDaily(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      const entry: DailyEntry = { date: today, prompt: data.content };
      addDaily(entry);
      setDaily(getDaily());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown");
    } finally {
      setLoading(false);
    }
  };

  const refreshDaily = () => setDaily(getDaily());

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-2">Today's check-in</h1>
      <p className="text-muted text-sm mb-6">
        One thing to <strong>notice</strong>. One thing to <strong>do</strong>.
        One thing to <strong>sit with</strong>.
      </p>

      {hydrated && !hasKey && (
        <div className="border border-line bg-white/50 rounded p-4 mb-6">
          <Link href="/settings" className="underline">
            Add your API key
          </Link>{" "}
          first.
        </div>
      )}
      {hydrated && hasKey && !hasProfiles && (
        <div className="border border-line bg-white/50 rounded p-4 mb-6">
          Complete{" "}
          <Link href="/profile/you" className="underline">
            both profiles
          </Link>{" "}
          first.
        </div>
      )}

      {hydrated && hasKey && hasProfiles && (
        <>
          {!todayEntry && (
            <button
              onClick={generate}
              disabled={loading}
              className="bg-ink text-bg px-4 py-2 rounded hover:bg-accent transition-colors disabled:opacity-50 mb-6"
            >
              {loading ? "Generating…" : "Get today's prompt"}
            </button>
          )}

          {error && (
            <div className="border border-red-300 bg-red-50 text-red-900 rounded p-4 mb-4">
              {error}
            </div>
          )}

          {todayEntry && (
            <article className="bg-white/60 border border-line rounded-lg p-8 mb-8">
              <div className="text-xs text-muted uppercase tracking-wider mb-3">
                {formatDate(todayEntry.date)}
              </div>
              <Markdown content={todayEntry.prompt} />

              <div className="mt-8 pt-6 border-t border-line">
                <ReflectionEditor entry={todayEntry} onSaved={refreshDaily} />
              </div>
            </article>
          )}

          {daily.filter((d) => d.date !== today).length > 0 && (
            <section>
              <h2 className="text-sm uppercase tracking-wider text-muted mb-4">
                Previous check-ins
              </h2>
              <div className="space-y-4">
                {daily
                  .filter((d) => d.date !== today)
                  .map((d) => (
                    <details
                      key={d.date}
                      className="bg-white/40 border border-line rounded p-4"
                    >
                      <summary className="cursor-pointer text-sm">
                        {formatDate(d.date)}
                        {d.reflection && (
                          <span className="ml-2 text-xs text-accent">
                            · reflected
                          </span>
                        )}
                      </summary>
                      <div className="mt-3 pt-3 border-t border-line">
                        <Markdown content={d.prompt} />
                        <div className="mt-4 pt-3 border-t border-line">
                          <ReflectionEditor
                            entry={d}
                            onSaved={refreshDaily}
                          />
                        </div>
                      </div>
                    </details>
                  ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
