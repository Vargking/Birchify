/** Rebuild the nine 1080px Moments posters, without any external resources. */
import { chromium } from "@playwright/test";
import { createServer } from "vite";
import { mkdir, writeFile, rename, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const source = dirname(fileURLToPath(import.meta.url));
const project = resolve(source, "../..");
const output = resolve(source, "..");
const browserPath = process.env.BIRCHIFY_BROWSER;
const edge = process.platform === "win32" ? "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" : undefined;
const server = await createServer({ root: project, server: { host: "127.0.0.1", port: 0, open: false } });
let browser;

// Atomic replacement also avoids transient Windows file-scanner write locks.
async function saveGenerated(path, data) {
  const temporary = `${path}.${process.pid}.tmp`;
  try {
    await writeFile(temporary, data);
    for (let attempt = 0; ; attempt++) {
      try {
        await rename(temporary, path);
        break;
      } catch (error) {
        if (attempt >= 4 || !["EPERM", "EACCES", "EBUSY", "UNKNOWN"].includes(error.code)) throw error;
        await new Promise(resolve => setTimeout(resolve, 250 * (attempt + 1)));
      }
    }
  } finally {
    await rm(temporary, { force: true });
  }
}

try {
  await mkdir(output, { recursive: true });
  await server.listen();
  const address = server.httpServer.address();
  const origin = `http://127.0.0.1:${address.port}`;
  browser = await chromium.launch({ headless: true, ...(browserPath || edge ? { executablePath: browserPath || edge } : {}) });
  const page = await browser.newPage({ viewport: { width: 1200, height: 1250 }, deviceScaleFactor: 1 });
  const errors = [];
  const network = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("requestfailed", r => errors.push(`Request failed: ${r.url()} ${r.failure()?.errorText}`));
  await page.route("**/*", route => {
    const url = route.request().url();
    if (url.startsWith(origin) || url.startsWith("data:") || url.startsWith("blob:")) return route.continue();
    network.push(url);
    return route.abort();
  });
  const posters = [];
  const images = [];
  for (let i = 1; i <= 9; i++) {
    await page.goto(`${origin}/img/source/index.html?poster=${i}`, { waitUntil: "networkidle" });
    await page.locator(".poster").waitFor();
    await page.evaluate(async () => {
      const text = document.querySelector(".poster").textContent;
      await Promise.all([
        document.fonts.load('400 80px "ZCOOL KuaiLe"', text),
        document.fonts.load('400 24px "Noto Sans SC"', text),
        document.fonts.load('700 24px "Noto Sans SC"', text),
        document.fonts.load('500 34px "LXGW WenKai"', text),
      ]);
      await document.fonts.ready;
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    });
    const poster = page.locator(".poster");
    const file = await poster.getAttribute("data-file");
    const bounds = await poster.evaluate(el => {
      const root = el.getBoundingClientRect();
      return [...el.querySelectorAll("[data-safe]")].flatMap(child => {
        const r = child.getBoundingClientRect();
        if (r.left < root.left + 24 || r.right > root.right - 24 || r.top < root.top + 24 || r.bottom > root.bottom - 20) return [`${child.getAttribute("data-safe")} exceeds safe canvas bounds`];
        if (child.scrollWidth > child.clientWidth + 2) return [`${child.getAttribute("data-safe")} has horizontal overflow`];
        return [];
      });
    });
    if (bounds.length) throw new Error(`${file}: ${bounds.join(", ")}`);
    const buffer = await poster.screenshot({ animations: "disabled", type: "png", scale: "css" });
    const dimensions = { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
    if (dimensions.width !== 1080 || dimensions.height !== 1080) throw new Error(`Incorrect dimensions: ${file}`);
    await saveGenerated(resolve(output, file), buffer);
    const displayedResumePages = await poster.locator(".sheet-shell").evaluateAll(sheets => sheets.map(sheet => sheet.querySelectorAll("[data-pdf-page]").length));
    if (displayedResumePages.some(count => count !== 1)) throw new Error(`${file}: marketing sample must fit one complete resume page`);
    const sha256 = createHash("sha256").update(buffer).digest("hex");
    posters.push({ file, ...dimensions, bytes: buffer.length, sha256, safeBounds: "passed", displayedResumePages });
    images.push(buffer.toString("base64"));
    console.log(`Created ${file} — 1080 × 1080 (${Math.round(buffer.length / 1024)} KB)`);
  }
  if (errors.length || network.length) throw new Error(JSON.stringify({ errors, blockedExternalResources: network }, null, 2));
  if (new Set(posters.map(p => p.sha256)).size !== 9) throw new Error("Duplicate poster output");
  const contact = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 1 });
  await contact.setContent(`<html><head><style>*{box-sizing:border-box}body{margin:0;display:grid;grid-template-columns:repeat(3,360px);background:#fff;gap:0}img{width:360px;height:360px;display:block}</style></head><body>${images.map((data, i) => `<img alt="Poster ${i + 1}" src="data:image/png;base64,${data}">`).join("")}</body></html>`);
  await contact.evaluate(() => Promise.all([...document.images].map(img => img.decode())));
  await saveGenerated(resolve(source, "contact-sheet.png"), await contact.screenshot({ type: "png", animations: "disabled" }));
  await saveGenerated(resolve(source, "render-report.json"), JSON.stringify({ size: "1080×1080", count: 9, externalResources: network, runtimeErrors: errors, posters }, null, 2) + "\n");
  console.log("Saved img/source/contact-sheet.png and render-report.json. All checks passed.");
} finally {
  await browser?.close();
  await server.close();
}
