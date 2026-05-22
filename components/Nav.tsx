"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/profile/you", label: "You" },
  { href: "/profile/partner", label: "Partner" },
  { href: "/protocol", label: "Protocol" },
  { href: "/daily", label: "Daily" },
  { href: "/settings", label: "Settings" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <header className="border-b border-line mb-8">
      <div className="max-w-3xl mx-auto px-6 py-5 flex flex-wrap items-baseline gap-x-6 gap-y-2">
        <Link href="/" className="text-2xl font-semibold tracking-tight">
          <span className="italic">Present</span>
        </Link>
        <nav className="flex flex-wrap gap-x-5 gap-y-1 text-sm ml-auto">
          {links.map((l) => {
            const active =
              l.href === "/" ? path === "/" : path?.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={
                  active
                    ? "text-accent border-b border-accent pb-0.5"
                    : "text-muted hover:text-ink"
                }
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
