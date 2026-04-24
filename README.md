# tianle-chen.com

Personal portfolio for **Tianle (David) Chen** — computational designer + creative ML engineer.

Built with **Astro 5 + Tailwind CSS + MDX + TypeScript**. Deploys to **Cloudflare Pages** from this repo on every `main` push.

## Architecture

- **Source of truth:** `W:\SecondBrain\Portfolio\*.md` (private vault) — one markdown file per project.
- **This repo:** the Astro site. Content in `src/content/projects/` is a *synced-in copy* of the vault's `publish: true` cards; don't edit directly.
- **Sync:** `python scripts/sync_from_vault.py` reads the vault, filters per NDA rules (Rulebook §19), rewrites image paths, and copies binaries into `public/assets/`.

```
vault/Portfolio/*.md
vault/Portfolio/_assets/<slug>/*    ──►   sync_from_vault.py   ──►   src/content/projects/<slug>.md
                                                                      public/assets/<slug>/*
                                                                              │
                                                                              ▼
                                                                      astro build  →  dist/
                                                                              │
                                                                              ▼
                                                                      Cloudflare Pages → tianle-chen.com
```

## Commands

```bash
npm install             # one-time; installs Astro + deps
npm run sync            # pull latest published cards from vault
npm run dev             # local dev server at http://localhost:4321
npm run build           # production build → dist/
npm run preview         # serve the production build locally
```

## Content flow (add a new project)

1. Write a new `Portfolio/YYYY-Semester--<slug>.md` in the vault with `publish: true`
2. Drop images into `Portfolio/_assets/<slug>/`
3. Back in this repo: `npm run sync && npm run build && git push`
4. Cloudflare Pages rebuilds automatically in ~30s

## NDA filter (Rulebook §19)

The sync script **never** copies:
- Cards with `publish: false` or missing the key
- Cards tagged `hilos` / `hilos-studio` / `nda`
- Cards with `company: HILOS Studio`
- Assets under `_assets/hilos-*/`

If the vault has `publish: true` paired with any of those — the sync **fails loudly**. Belt-and-suspenders.

## Deployment

### Cloudflare Pages

1. Push this repo to `github.com/chentianle1117/tianle-chen-site` (public).
2. In Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**.
3. Select this repo. Build settings:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node version: `18.17.0` (set via env var `NODE_VERSION`)
4. Deploy.

### Custom domain (tianle-chen.com)

1. In Cloudflare Pages project → **Custom domains** → **Set up a custom domain** → enter `tianle-chen.com`.
2. Cloudflare auto-provisions Let's Encrypt TLS.
3. At the domain registrar for tianle-chen.com: update DNS to point to Cloudflare's nameservers (they'll give you two NS records).
4. Propagation: usually <1 hour, sometimes up to 24.

### Cost

**$0/month.** Cloudflare Pages free tier: unlimited bandwidth, 500 builds/month, custom domain + TLS included. Way more than this site needs.

## Tech

- [Astro 5](https://astro.build) — zero-JS-by-default SSG with content collections
- [Tailwind CSS](https://tailwindcss.com) — utility styling
- [MDX](https://mdxjs.com) — Markdown + JSX for project pages
- TypeScript strict mode
- Fonts: Fraunces (serif display) + Inter (sans body) + JetBrains Mono (code) via Google Fonts initially; switch to [Fontsource](https://fontsource.org) for self-hosting in Phase 2

## Design tokens

- **Dark default** — `color-scheme: dark`
- **Accent:** `#c5331f` (oxblood)
- **Type:** Fraunces display, Inter body, JetBrains Mono for UI micro-copy
- **Layout:** 12-col grid, generous whitespace, asymmetric compositions

## Related

- Vault strategy doc: `W:\SecondBrain\Portfolio\_Strategy — Portfolio Website (Structure, Visual, Deployment, Career Framing).md`
- Rulebook §19 (NDA rule): `W:\SecondBrain\_RULEBOOK.md`
