"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { QUESTIONS, SECTIONS } from "@/lib/questions";
import { getProfile, setProfile } from "@/lib/storage";
import type { Person } from "@/lib/types";

const DRAFT_KEY = (person: Person) => `present:draft:${person}`;

export default function ProfilePage() {
  const params = useParams<{ person: string }>();

  if (params.person !== "you" && params.person !== "partner") notFound();
  const person = params.person as Person;
  const otherLabel = person === "you" ? "your partner" : "yourself";

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null);
  const [acknowledged, setAcknowledged] = useState(person === "you");

  useEffect(() => {
    const saved = getProfile(person);
    let initial: Record<string, string> = saved?.answers || {};
    try {
      const raw = localStorage.getItem(DRAFT_KEY(person));
      if (raw) {
        const draft = JSON.parse(raw) as Record<string, string>;
        initial = { ...initial, ...draft };
      }
    } catch {
      /* ignore */
    }
    setAnswers(initial);
    setLoaded(true);
  }, [person]);

  useEffect(() => {
    if (!loaded) return;
    const handle = window.setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY(person), JSON.stringify(answers));
        setDraftSavedAt(Date.now());
      } catch {
        /* ignore quota */
      }
    }, 300);
    return () => window.clearTimeout(handle);
  }, [answers, loaded, person]);

  useEffect(() => {
    if (!loaded) return;
    const saved = getProfile(person);
    const dirty = JSON.stringify(answers) !== JSON.stringify(saved?.answers || {});
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [answers, loaded, person]);

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
    try {
      localStorage.removeItem(DRAFT_KEY(person));
    } catch {
      /* ignore */
    }
    setSavedAt(new Date().toLocaleTimeString());
  };

  const completion = useMemo(() => {
    const done = QUESTIONS.filter((q) => answers[q.id]?.trim()).length;
    return { done, total: QUESTIONS.length };
  }, [answers]);

  const sectionCompletion = useMemo(() => {
    const map = new Map<string, { done: number; total: number }>();
    for (const section of SECTIONS) {
      const inSection = QUESTIONS.filter((q) => q.section === section);
      const done = inSection.filter((q) => answers[q.id]?.trim()).length;
      map.set(section, { done, total: inSection.length });
    }
    return map;
  }, [answers]);

  if (!loaded) {
    return (
      <div className="text-muted italic py-10">Loading your profile…</div>
    );
  }

  if (person === "partner" && !acknowledged) {
    return (
      <div>
        <h1 className="text-3xl font-semibold mb-2">Your partner's profile</h1>
        <p className="text-muted text-sm mb-6">Before you start.</p>
        <article className="bg-white/60 border border-line rounded-lg p-8 mb-6 leading-relaxed">
          <p className="mb-4">
            These should be <strong>your partner's actual answers</strong> — not
            your guesses about them.
          </p>
          <p className="mb-4">
            The protocol Claude designs is only as good as the inputs. If you
            fill this out from your own assumptions, you'll get a thoughtful
            manual for an imagined person — not the one you live with.
          </p>
          <p className="mb-4">
            The best way: sit with them and fill it in together, or hand them
            the device. The second best way: answer only the questions you're
            confident about, and leave the rest blank.
          </p>
          <p className="text-sm text-muted">
            Either way, mark the answers as theirs in your head before you
            write them down.
          </p>
        </article>
        <div className="flex gap-3">
          <button
            onClick={() => setAcknowledged(true)}
            className="bg-ink text-bg px-4 py-2 rounded hover:bg-accent transition-colors"
          >
            Got it — continue
          </button>
          <Link
            href="/"
            className="self-center text-sm underline text-muted"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const currentSection = SECTIONS[stepIndex];
  const questionsInStep = QUESTIONS.filter((q) => q.section === currentSection);
  const isLast = stepIndex === SECTIONS.length - 1;
  const isFirst = stepIndex === 0;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <h1 className="text-3xl font-semibold">
          {person === "you" ? "Your profile" : "Your partner's profile"}
        </h1>
        <span className="text-sm text-muted">
          {completion.done}/{completion.total} answered
        </span>
      </div>
      <p className="text-muted text-sm mb-6">
        Answer as honestly as you can — about {otherLabel}.{" "}
        <strong>Vague answers produce generic protocols.</strong>
      </p>

      <ol className="flex flex-wrap gap-1.5 mb-8">
        {SECTIONS.map((section, i) => {
          const c = sectionCompletion.get(section)!;
          const active = i === stepIndex;
          const done = c.done === c.total;
          return (
            <li key={section}>
              <button
                onClick={() => setStepIndex(i)}
                className={
                  "text-xs px-3 py-1.5 rounded-full border transition-colors " +
                  (active
                    ? "bg-ink text-bg border-ink"
                    : done
                      ? "border-accent text-accent hover:bg-accent/10"
                      : "border-line text-muted hover:border-ink hover:text-ink")
                }
                aria-current={active ? "step" : undefined}
              >
                <span>{section}</span>
                <span className="ml-2 opacity-70">
                  {c.done}/{c.total}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
          if (!isLast) setStepIndex(stepIndex + 1);
        }}
        className="space-y-10"
      >
        <section>
          <h2 className="text-sm uppercase tracking-wider text-accent border-b border-line pb-1 mb-4">
            {currentSection}
          </h2>
          <div className="space-y-6">
            {questionsInStep.map((q) => (
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

        <div className="sticky bottom-4 bg-bg/95 backdrop-blur border border-line rounded-lg p-4 flex items-center gap-3 flex-wrap shadow-sm">
          <button
            type="button"
            onClick={() => setStepIndex(Math.max(0, stepIndex - 1))}
            disabled={isFirst}
            className="border border-ink px-3 py-2 rounded hover:bg-ink hover:text-bg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink"
          >
            ← Back
          </button>
          <button
            type="submit"
            className="bg-ink text-bg px-4 py-2 rounded hover:bg-accent transition-colors"
          >
            {isLast ? "Save profile" : "Save & continue →"}
          </button>
          <div className="text-xs text-muted flex flex-col">
            {savedAt && <span>Saved at {savedAt}</span>}
            {!savedAt && draftSavedAt && <span>Draft auto-saved</span>}
          </div>
          {isLast && (
            <Link
              href={person === "you" ? "/profile/partner" : "/protocol"}
              onClick={save}
              className="ml-auto text-sm underline"
            >
              {person === "you"
                ? "Next: partner profile →"
                : "Next: generate protocol →"}
            </Link>
          )}
        </div>
      </form>
    </div>
  );
}
