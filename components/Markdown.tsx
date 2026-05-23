import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

marked.setOptions({ gfm: true, breaks: false });

function render(content: string): string {
  const html = marked.parse(content, { async: false }) as string;
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
