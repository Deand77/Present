"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getApiKey,
  getProfiles,
  getProtocol,
  setProtocol,
} from "@/lib/storage";
import Markdown from "@/components/Markdown";

export default function ProtocolPage() {
  const [hasKey, setHasKey] = useState(false);
  const [hasBothProfiles, setHasBothProfiles] = useState(false);
  const [content, setContent] = useState<string>("");
  const [generatedAt, setGeneratedAt] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setHasKey(!!getApiKey());
    const p = getProfiles();
    setHasBothProfiles(!!p.you && !!p.partner);
    const proto = getProtocol();
    if (proto) {
      setContent(proto.content);
      setGeneratedAt(new Date(proto.generatedAt).toLocaleString());
    }
  }, []);

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate-protocol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: getApiKey(), profiles: getProfiles() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");
      setContent(data.content);
      const now = new Date();
      setGeneratedAt(now.toLocaleString());
      setProtocol({
        generatedAt: now.toISOString(),
        model: data.model,
        content: data.content,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-2">Your protocol</h1>
      <p className="text-muted text-sm mb-6">
        A personalized operating manual for being a more present partner.
      </p>

      {!hasKey && (
        <div className="border border-line bg-white/50 rounded p-4 mb-6">
          You'll need to{" "}
          <Link href="/settings" className="underline">
            add your Anthropic API key
          </Link>{" "}
          first.
        </div>
      )}

      {hasKey && !hasBothProfiles && (
        <div className="border border-line bg-white/50 rounded p-4 mb-6">
          Both <Link href="/profile/you" className="underline">your profile</Link>{" "}
          and{" "}
          <Link href="/profile/partner" className="underline">
            your partner's profile
          </Link>{" "}
          need to be completed before generating a protocol.
        </div>
      )}

      {hasKey && hasBothProfiles && (
        <div className="mb-6 flex items-center gap-4 flex-wrap">
          <button
            onClick={generate}
            disabled={loading}
            className="bg-ink text-bg px-4 py-2 rounded hover:bg-accent transition-colors disabled:opacity-50"
          >
            {loading ? "Generating…" : content ? "Regenerate" : "Generate protocol"}
          </button>
          {generatedAt && (
            <span className="text-sm text-muted">
              Last generated {generatedAt}
            </span>
          )}
        </div>
      )}

      {loading && (
        <div className="text-muted italic">
          Thinking carefully about your two profiles. This usually takes 30–90 seconds…
        </div>
      )}

      {error && (
        <div className="border border-red-300 bg-red-50 text-red-900 rounded p-4 mb-4">
          {error}
        </div>
      )}

      {content && !loading && (
        <article className="bg-white/60 border border-line rounded-lg p-8">
          <Markdown content={content} />
        </article>
      )}
    </div>
  );
}
