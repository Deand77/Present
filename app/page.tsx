"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getProfiles, getProtocol, getApiKey } from "@/lib/storage";

export default function Home() {
  const [state, setState] = useState({
    hasKey: false,
    you: false,
    partner: false,
    protocol: false,
  });

  useEffect(() => {
    const p = getProfiles();
    setState({
      hasKey: !!getApiKey(),
      you: !!p.you,
      partner: !!p.partner,
      protocol: !!getProtocol(),
    });
  }, []);

  const Step = ({
    n,
    title,
    desc,
    done,
    href,
    cta,
  }: {
    n: number;
    title: string;
    desc: string;
    done: boolean;
    href: string;
    cta: string;
  }) => (
    <li className="flex gap-4 py-5 border-b border-line last:border-0">
      <div
        className={
          "shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm " +
          (done ? "bg-accent text-bg" : "bg-line text-muted")
        }
      >
        {done ? "✓" : n}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-muted text-sm mt-1">{desc}</p>
      </div>
      <Link
        href={href}
        className="self-center text-sm border border-ink px-3 py-1.5 rounded hover:bg-ink hover:text-bg transition-colors whitespace-nowrap"
      >
        {done ? "Edit" : cta}
      </Link>
    </li>
  );

  return (
    <div>
      <section className="pt-4 pb-8">
        <h1 className="text-4xl font-semibold tracking-tight mb-3">
          Be more <span className="italic text-accent">present</span>.
        </h1>
        <p className="text-muted max-w-xl leading-relaxed">
          Present helps you understand yourself and your partner deeply, then
          designs a personalized protocol — daily practices, repair playbooks,
          and check-ins — for being a better custodian of your relationship.
        </p>
      </section>

      <section className="bg-white/50 border border-line rounded-lg p-6">
        <h2 className="text-sm uppercase tracking-wider text-muted mb-2">
          Get started
        </h2>
        <ol className="divide-y divide-line">
          <Step
            n={1}
            title="Add your Anthropic API key"
            desc="Stored locally in your browser. Used to generate your protocol and daily check-ins."
            done={state.hasKey}
            href="/settings"
            cta="Add key"
          />
          <Step
            n={2}
            title="Profile yourself"
            desc="About 20 questions on attachment, support, triggers, and what helps you feel seen."
            done={state.you}
            href="/profile/you"
            cta="Start"
          />
          <Step
            n={3}
            title="Profile your partner"
            desc="The same questions, from their perspective. Best done together, honestly."
            done={state.partner}
            href="/profile/partner"
            cta="Start"
          />
          <Step
            n={4}
            title="Generate your protocol"
            desc="Claude designs a tailored operating manual from both profiles."
            done={state.protocol}
            href="/protocol"
            cta="Generate"
          />
          <Step
            n={5}
            title="Daily check-ins"
            desc="A short, contextual prompt each day. One thing to notice. One thing to do."
            done={false}
            href="/daily"
            cta="Today's prompt"
          />
        </ol>
      </section>

      <section className="mt-10 text-sm text-muted">
        <p>
          All data stays on this device. Nothing is sent anywhere except
          Anthropic's API, using your own key. You can export or delete
          everything from <Link href="/settings" className="underline">Settings</Link>.
        </p>
      </section>
    </div>
  );
}
