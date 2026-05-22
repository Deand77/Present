"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { QUESTIONS, SECTIONS } from "@/lib/questions";
import { getProfile, setProfile } from "@/lib/storage";
import type { Person } from "@/lib/types";

export default function ProfilePage() {
  const params = useParams<{ person: string }>();
  const router = useRouter();
  const person = (params.person === "you" ? "you" : "partner") as Person;
  const otherLabel = person === "you" ? "your partner" : "yourself";

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    const p = getProfile(person);
    if (p) setAnswers(p.answers);
    setLoaded(true);
  }, [person]);

  const handle = (id: string, value: string) => {
    setAnswers((a) => ({ ...a, [id]: value }));
  };

  const save = () => {
    const name = answers["name"]?.trim() || (person === "you" ? "You" : "Partner");
    setProfile(person, {
      name,
      answers,
      updatedAt: new Date().toISOString(),
    });
    setSavedAt(new Date().toLocaleTimeString());
  };

  const completion = useMemo(() => {
    const done = QUESTIONS.filter((q) => answers[q.id]?.trim()).length;
    return { done, total: QUESTIONS.length };
  }, [answers]);

  if (!loaded) return null;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <h1 className="text-3xl font-semibold">
          {person === "you" ? "Your profile" : "Your partner's profile"}
        </h1>
        <span className="text-sm text-muted">
          {completion.done}/{completion.total}
        </span>
      </div>
      <p className="text-muted text-sm mb-8">
        Answer as honestly as you can — about {otherLabel}. Be specific. Vague
        answers produce generic protocols.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        className="space-y-10"
      >
        {SECTIONS.map((section) => (
          <section key={section}>
            <h2 className="text-sm uppercase tracking-wider text-accent border-b border-line pb-1 mb-4">
              {section}
            </h2>
            <div className="space-y-6">
              {QUESTIONS.filter((q) => q.section === section).map((q) => (
                <div key={q.id}>
                  <label className="block mb-2 leading-snug">{q.prompt}</label>
                  {q.type === "text" && (
                    <input
                      type="text"
                      value={answers[q.id] || ""}
                      onChange={(e) => handle(q.id, e.target.value)}
                      className="w-full bg-white/70 border border-line rounded px-3 py-2 focus:outline-none focus:border-accent"
                    />
                  )}
                  {q.type === "longtext" && (
                    <textarea
                      value={answers[q.id] || ""}
                      onChange={(e) => handle(q.id, e.target.value)}
                      rows={4}
                      className="w-full bg-white/70 border border-line rounded px-3 py-2 focus:outline-none focus:border-accent resize-y"
                    />
                  )}
                  {q.type === "choice" && q.choices && (
                    <div className="space-y-1.5">
                      {q.choices.map((c) => (
                        <label
                          key={c}
                          className="flex items-start gap-2 cursor-pointer text-sm"
                        >
                          <input
                            type="radio"
                            name={q.id}
                            value={c}
                            checked={answers[q.id] === c}
                            onChange={(e) => handle(q.id, e.target.value)}
                            className="mt-1 accent-accent"
                          />
                          <span>{c}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}

        <div className="sticky bottom-4 bg-bg/95 backdrop-blur border border-line rounded-lg p-4 flex items-center gap-4 shadow-sm">
          <button
            type="submit"
            className="bg-ink text-bg px-4 py-2 rounded hover:bg-accent transition-colors"
          >
            Save profile
          </button>
          {savedAt && (
            <span className="text-sm text-muted">Saved at {savedAt}</span>
          )}
          <Link
            href={person === "you" ? "/profile/partner" : "/protocol"}
            className="ml-auto text-sm underline"
          >
            {person === "you" ? "Next: partner profile →" : "Next: generate protocol →"}
          </Link>
        </div>
      </form>
    </div>
  );
}
