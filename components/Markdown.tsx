"use client";

import { marked } from "marked";
import DOMPurify from "dompurify";

marked.setOptions({ gfm: true, breaks: false });

function render(content: string): string {
  const html = marked.parse(content, { async: false }) as string;
  // SSR has no DOM; this component only ever renders content client-side
  // (the initial server HTML has nothing to sanitize).
  if (typeof window === "undefined") return "";
  return DOMPurify.sanitize(html, {
    ADD_ATTR: ["target", "rel"],
    FORBID_TAGS: ["style", "script", "iframe", "form"],
  });
}

export default function Markdown({ content }: { content: string }) {
  return (
    <div
      className="prose-app"
      dangerouslySetInnerHTML={{ __html: render(content) }}
    />
  );
}
