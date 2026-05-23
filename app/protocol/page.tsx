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
    try {
      const res = await fetch("/api/generate-protocol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: getApiKey(), profiles: getProfiles() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");
      const now = new Date();
      const next: Protocol = {
        generatedAt: now.toISOString(),
        model: data.model,
        content: data.content,
        basedOn: {
          you: profiles.you?.updatedAt,
          partner: profiles.partner?.updatedAt,
        },
      };
      setProtocol(next);
      setProtocolState(next);
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
          {stale && (
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
            {protocol && (
              <span className="text-sm text-muted">
                Last generated {new Date(protocol.generatedAt).toLocaleString()}
              </span>
            )}
          </div>
        </>
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

      {protocol?.content && !loading && (
        <article className="bg-white/60 border border-line rounded-lg p-8">
          <Markdown content={protocol.content} />
        </article>
      )}
    </div>
  );
}
