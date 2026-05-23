"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getApiKey,
  getProfiles,
  getProtocol,
  setProtocol,
} from "@/lib/storage";
import Markdown from "@/components/Markdown";
import type { Profiles, Protocol } from "@/lib/types";

export default function ProtocolPage() {
  const [hasKey, setHasKey] = useState(false);
  const [profiles, setProfilesState] = useState<Profiles>({});
  const [protocol, setProtocolState] = useState<Protocol | null>(null);
  const [streaming, setStreaming] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHasKey(!!getApiKey());
    setProfilesState(getProfiles());
    const proto = getProtocol();
    if (proto) setProtocolState(proto);
    setHydrated(true);
  }, []);

  const hasBothProfiles = !!profiles.you && !!profiles.partner;

  const stale = useMemo(() => {
    if (!protocol) return false;
    const youAt = profiles.you?.updatedAt;
    const partnerAt = profiles.partner?.updatedAt;
    const basedYou = protocol.basedOn?.you;
    const basedPartner = protocol.basedOn?.partner;
    const ref = protocol.generatedAt;
    const yChanged = youAt && (basedYou ? youAt > basedYou : youAt > ref);
    const pChanged =
      partnerAt && (basedPartner ? partnerAt > basedPartner : partnerAt > ref);
    return Boolean(yChanged || pChanged);
  }, [protocol, profiles]);

  const generate = async () => {
    setLoading(true);
    setError("");
    setStreaming("");
    try {
      const res = await fetch("/api/generate-protocol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: getApiKey(), profiles: getProfiles() }),
      });
      if (!res.ok) {
        // Errors come back as JSON, not stream.
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const model = res.headers.get("X-Model") || "claude-opus-4-7";
      const reader = res.body?.getReader();
      if (!reader) throw new Error("Streaming not supported by this browser");
      const decoder = new TextDecoder();
      let content = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        content += decoder.decode(value, { stream: true });
        setStreaming(content);
      }
      content += decoder.decode();
      const now = new Date();
      const next: Protocol = {
        generatedAt: now.toISOString(),
        model,
        content,
        basedOn: {
          you: profiles.you?.updatedAt,
          partner: profiles.partner?.updatedAt,
        },
      };
      setProtocol(next);
      setProtocolState(next);
      setStreaming("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setStreaming("");
    } finally {
      setLoading(false);
    }
  };

  // Show whichever has content: the in-flight stream, or the saved protocol.
  const visibleContent = streaming || protocol?.content || "";

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-2">Your protocol</h1>
      <p className="text-muted text-sm mb-6">
        A personalized operating manual for being a more present partner.
      </p>

      {hydrated && !hasKey && (
        <div className="border border-line bg-white/50 rounded p-4 mb-6">
          You'll need to{" "}
          <Link href="/settings" className="underline">
            add your Anthropic API key
          </Link>{" "}
          first.
        </div>
      )}

      {hydrated && hasKey && !hasBothProfiles && (
        <div className="border border-line bg-white/50 rounded p-4 mb-6">
          Both <Link href="/profile/you" className="underline">your profile</Link>{" "}
          and{" "}
          <Link href="/profile/partner" className="underline">
            your partner's profile
          </Link>{" "}
          need to be completed before generating a protocol.
        </div>
      )}

      {hydrated && hasKey && hasBothProfiles && (
        <>
          {stale && !loading && (
            <div className="border border-accent/40 bg-accent/5 text-ink rounded p-4 mb-6">
              <strong className="text-accent">One or both profiles have changed</strong>{" "}
              since this protocol was generated.{" "}
              <button
                onClick={generate}
                disabled={loading}
                className="underline disabled:opacity-50"
              >
                Regenerate
              </button>{" "}
              to incorporate the updates.
            </div>
          )}

          <div className="mb-6 flex items-center gap-4 flex-wrap">
            <button
              onClick={generate}
              disabled={loading}
              className="bg-ink text-bg px-4 py-2 rounded hover:bg-accent transition-colors disabled:opacity-50"
            >
              {loading
                ? "Generating…"
                : protocol
                  ? "Regenerate"
                  : "Generate protocol"}
            </button>
            {protocol && !loading && (
              <span className="text-sm text-muted">
                Last generated {new Date(protocol.generatedAt).toLocaleString()}
              </span>
            )}
            {loading && streaming && (
              <span className="text-sm text-muted italic">
                Streaming… ({streaming.length} chars)
              </span>
            )}
            {loading && !streaming && (
              <span className="text-sm text-muted italic">
                Thinking…
              </span>
            )}
          </div>
        </>
      )}

      {error && (
        <div className="border border-red-300 bg-red-50 text-red-900 rounded p-4 mb-4">
          {error}
        </div>
      )}

      {visibleContent && (
        <article className="bg-white/60 border border-line rounded-lg p-8">
          <Markdown content={visibleContent} />
          {loading && streaming && (
            <span
              className="inline-block w-2 h-5 ml-1 bg-accent animate-pulse align-text-bottom"
              aria-hidden="true"
            />
          )}
        </article>
      )}
    </div>
  );
}
