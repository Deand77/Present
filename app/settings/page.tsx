"use client";

import { useEffect, useState } from "react";
import {
  exportJson,
  getApiKey,
  resetAll,
  setApiKey,
} from "@/lib/storage";

export default function SettingsPage() {
  const [key, setKey] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    const existing = getApiKey();
    if (existing) setKey(existing);
  }, []);

  const save = () => {
    setApiKey(key);
    setSavedAt(new Date().toLocaleTimeString());
  };

  const exportData = () => {
    const blob = new Blob([exportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `present-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    resetAll();
    setKey("");
    setConfirmReset(false);
    setSavedAt(null);
  };

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Settings</h1>

      <section className="bg-white/50 border border-line rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">Anthropic API key</h2>
        <p className="text-muted text-sm mb-4">
          Get one at{" "}
          <a
            href="https://console.anthropic.com/settings/keys"
            className="underline"
            target="_blank"
            rel="noreferrer"
          >
            console.anthropic.com
          </a>
          . The key is stored in this browser's localStorage. On each request
          it's sent to this app's own backend (which forwards it to Anthropic)
          and goes nowhere else. Self-hosters can instead set{" "}
          <code className="bg-line px-1 rounded text-xs">ANTHROPIC_API_KEY</code>{" "}
          as a server env var and skip this field.
        </p>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="sk-ant-..."
          className="w-full bg-white border border-line rounded px-3 py-2 focus:outline-none focus:border-accent font-mono text-sm"
        />
        <div className="mt-3 flex items-center gap-4">
          <button
            onClick={save}
            className="bg-ink text-bg px-4 py-2 rounded hover:bg-accent transition-colors"
          >
            Save key
          </button>
          {savedAt && (
            <span className="text-sm text-muted">Saved at {savedAt}</span>
          )}
        </div>
      </section>

      <section className="bg-white/50 border border-line rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">Export your data</h2>
        <p className="text-muted text-sm mb-4">
          Download a JSON file with your profiles, protocol, and daily entries.
          Your API key is redacted from the export.
        </p>
        <button
          onClick={exportData}
          className="border border-ink px-4 py-2 rounded hover:bg-ink hover:text-bg transition-colors"
        >
          Export JSON
        </button>
      </section>

      <section className="bg-white/50 border border-line rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-2">Reset everything</h2>
        <p className="text-muted text-sm mb-4">
          Deletes profiles, protocol, daily entries, and your API key from this
          browser. Can't be undone.
        </p>
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="border border-red-700 text-red-700 px-4 py-2 rounded hover:bg-red-700 hover:text-bg transition-colors"
          >
            Reset all data
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={reset}
              className="bg-red-700 text-bg px-4 py-2 rounded"
            >
              Yes, delete everything
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              className="border border-ink px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
