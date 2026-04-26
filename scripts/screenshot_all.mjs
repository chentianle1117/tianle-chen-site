#!/usr/bin/env node
/**
 * Visual verification harness.
 *
 * Boots the Astro dev server (assumed already running on :4321) and
 * captures screenshots of every route at multiple viewports. Saves to
 * `verification/<route>__<viewport>.png`. Prints a summary table.
 *
 * Usage:
 *   # In one terminal: npm run dev
 *   # In another:       node scripts/screenshot_all.mjs
 *
 * Or auto-boot mode:
 *   node scripts/screenshot_all.mjs --boot
 */
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT = resolve(ROOT, "verification");
mkdirSync(OUT, { recursive: true });

// Discover slugs from src/content/projects/
const PROJECT_DIR = resolve(ROOT, "src/content/projects");
const slugs = readdirSync(PROJECT_DIR)
  .filter((f) => f.endsWith(".md"))
  .map((f) => f.replace(/\.md$/, ""));

const ROUTES = [
  { path: "/", name: "home" },
  { path: "/work", name: "work" },
  { path: "/thesis", name: "thesis" },
  { path: "/architecture", name: "architecture" },
  { path: "/about", name: "about" },
  { path: "/dashboard", name: "dashboard" },
  { path: "/this-route-does-not-exist", name: "404" },
  ...slugs.map((s) => ({ path: `/work/${s}`, name: `work-${s}` })),
];

const VIEWPORTS = [
  { name: "1920", w: 1920, h: 1080 },
  { name: "1440", w: 1440, h: 900 },
  { name: "1024", w: 1024, h: 768 },
  { name: "768", w: 768, h: 1024 },
  { name: "414", w: 414, h: 896 },
  { name: "375", w: 375, h: 667 },
];

const BASE = process.env.BASE_URL || "http://localhost:4321";
const TIMEOUT_MS = 20_000;
const SETTLE_MS = 1500;

async function captureRoute(browser, route, viewport, results) {
  const ctx = await browser.newContext({
    viewport: { width: viewport.w, height: viewport.h },
    deviceScaleFactor: 1,
    reducedMotion: "no-preference",
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`console: ${msg.text()}`);
  });
  let status = "ok";
  let httpStatus = 0;
  try {
    const resp = await page.goto(`${BASE}${route.path}`, {
      timeout: TIMEOUT_MS,
      waitUntil: "domcontentloaded",
    });
    httpStatus = resp?.status() ?? 0;
    await page.waitForTimeout(SETTLE_MS); // Let images, fonts, hero settle
    const fileName = `${route.name}__${viewport.name}.png`;
    await page.screenshot({
      path: resolve(OUT, fileName),
      fullPage: false,
    });
  } catch (e) {
    status = `error: ${e.message}`;
  }
  await ctx.close();
  results.push({
    route: route.path,
    viewport: viewport.name,
    status,
    httpStatus,
    errors: errors.slice(0, 3),
  });
}

async function main() {
  console.log(`[verify] base url: ${BASE}`);
  console.log(`[verify] routes:    ${ROUTES.length}`);
  console.log(`[verify] viewports: ${VIEWPORTS.length}`);
  console.log(`[verify] output:    ${OUT}`);
  console.log();

  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const route of ROUTES) {
    process.stdout.write(`  ${route.path.padEnd(32)} `);
    for (const viewport of VIEWPORTS) {
      await captureRoute(browser, route, viewport, results);
      const last = results[results.length - 1];
      process.stdout.write(last.status === "ok" ? "✓" : "✗");
    }
    process.stdout.write("\n");
  }

  await browser.close();

  const ok = results.filter((r) => r.status === "ok").length;
  const fail = results.length - ok;
  const withErrors = results.filter((r) => r.errors.length > 0);

  console.log();
  console.log(`[verify] captured: ${ok}/${results.length}`);
  console.log(`[verify] failed:   ${fail}`);
  console.log(`[verify] page-err: ${withErrors.length}`);

  if (fail > 0) {
    console.log("\n[verify] failures:");
    for (const r of results.filter((x) => x.status !== "ok")) {
      console.log(`  ${r.route} @ ${r.viewport}: ${r.status}`);
    }
  }
  if (withErrors.length > 0) {
    console.log("\n[verify] routes with console errors:");
    for (const r of withErrors.slice(0, 20)) {
      console.log(`  ${r.route} @ ${r.viewport}:`);
      for (const e of r.errors) console.log(`    ${e}`);
    }
  }

  process.exit(fail > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
