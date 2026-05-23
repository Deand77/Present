# Deploying Present to Cloudflare

Present runs on Cloudflare Workers via [@opennextjs/cloudflare](https://opennext.js.org/cloudflare). The architecture stays the same — all user data lives in the browser's localStorage. The Worker exists only to proxy requests to the Anthropic API.

## Prerequisites

- A Cloudflare account (free tier is fine for personal use)
- Node 18.18+ / 20+
- Wrangler authenticated:
  ```sh
  npx wrangler login
  ```

## Deploy

```sh
npm install
npm run cf:deploy
```

That's it. Wrangler will print the deployed URL (something like `https://present.<your-subdomain>.workers.dev`).

## Local preview of the Cloudflare build

```sh
npm run cf:preview
```

Runs the Worker locally with the same runtime as production, including streaming and `nodejs_compat`. Useful for catching anything that works on `next dev` but breaks on Workers.

## Configuration choices

### API key — who pays?

The app's default flow is **user provides their own key in Settings**. Each visitor pastes their `sk-ant-...` key into the browser; it never leaves their device except to hit your Worker, which forwards it to Anthropic. Your Worker holds no secrets.

If you want to skip the Settings step — e.g. it's only you using the URL, or the site is gated behind auth — set the key as a Worker secret:

```sh
npx wrangler secret put ANTHROPIC_API_KEY
# paste your key when prompted
```

The `resolveApiKey()` helper in `lib/claude.ts` falls back to the env var when no per-request key is sent. **Do not set this if the URL is public** — anyone who finds the site can run protocol/daily generations on your dime.

### Custom domain

In the Cloudflare dashboard → Workers & Pages → Present → Triggers → Custom Domains. Point a subdomain of any zone in your account.

### Long-running protocol generation

The protocol route streams (`app/api/generate-protocol/route.ts`), so wall-clock limits don't apply — bytes flow continuously from Anthropic → Worker → browser, and the request never idles. Works on both Workers Free (30s CPU, unbounded wall-clock for I/O) and Workers Paid.

## Cost

For personal use (a handful of protocol generations + ~daily check-ins):

- **Cloudflare:** $0 (well within Workers Free's 100k requests/day)
- **Anthropic:** depends on usage — a protocol run on Opus 4.7 with adaptive thinking is roughly $0.10–0.30; daily check-ins on Haiku 4.5 are ~$0.001 each

## What's not configured

- **No D1 / KV / R2 bindings** — the app doesn't need them. Everything is in the browser.
- **No auth** — if you need this public, gate it via Cloudflare Access or add Supabase Auth.
- **No rate limiting** — fine for private use; add Cloudflare WAF rules or an Upstash rate-limit middleware if exposed.
