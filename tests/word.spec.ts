import { test, expect, type Page } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { unzipSync, strFromU8 } from "fflate";
import { componentCatalog, createComponent, createDefaultResume, templates } from "../src/data";
import type { ResumeData } from "../src/types";

const unpack = (path: string) => unzipSync(readFileSync(path));
const media = (files: ReturnType<typeof unpack>) => Object.keys(files).filter(k => /^word\/media\/.*\.png$/.test(k));
const hash = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");

async function expectMatchingPages(page: Page, files: ReturnType<typeof unpack>, expected: string[]) {
  const images = media(files);
  expect(images).toHaveLength(expected.length);
  for (let i = 0; i < images.length; i++) {
    const difference = await page.evaluate(async ({ actual, expected }) => {
      const pixels = async (png: string) => {
        const img = new Image(); img.src = `data:image/png;base64,${png}`; await img.decode();
        const canvas = document.createElement("canvas"); canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext("2d")!; ctx.drawImage(img, 0, 0);
        return ctx.getImageData(0, 0, canvas.width, canvas.height);
      };
      const a = await pixels(actual), b = await pixels(expected);
      if (a.width !== b.width || a.height !== b.height) return 1;
      let changed = 0;
      for (let p = 0; p < a.data.length; p += 4) {
        if ([0, 1, 2, 3].some(c => Math.abs(a.data[p + c] - b.data[p + c]) > 16)) changed++;
      }
      return changed / (a.width * a.height);
    }, { actual: Buffer.from(files[images[i]]).toString("base64"), expected: expected[i] });
    // Chromium may rasterize rounded photo edges slightly differently between
    // canvases. Allow <0.1% of pixels, not missing regions or different layouts.
    expect(difference, `page ${i + 1} must match the complete preview capture`).toBeLessThan(.001);
  }
}

async function openResume(page: Page, data: ResumeData) {
  await page.addInitScript(data => localStorage.setItem("birchify-resume-v1", JSON.stringify(data)), data);
  await page.goto("/");
  // A real, visibly colored image exercises photo + component decoding/capture.
  await page.evaluate(() => {
    const canvas = document.createElement("canvas"); canvas.width = 80; canvas.height = 100;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ed65a6"; ctx.fillRect(0, 0, 80, 100);
    ctx.fillStyle = "#2849c7"; ctx.fillRect(0, 50, 80, 50);
    (window as any).__wordPicture = canvas.toDataURL("image/png");
  });
}

async function downloadWord(page: Page, data: ResumeData, currentPage = 1) {
  const pending = page.waitForEvent("download", { timeout: 60000 });
  await page.evaluate(async ({ data, currentPage }) => {
    const { exportWord } = await import(/* @vite-ignore */ "/src/word.ts");
    if (data.photo === "fixture") data.photo = (window as any).__wordPicture;
    data.sections.forEach(s => s.components.forEach(c => { if (c.image === "fixture") c.image = (window as any).__wordPicture; }));
    await exportWord(data, () => {}, currentPage);
  }, { data, currentPage });
  const download = await pending;
  const path = (await download.path())!;
  await expect(page.locator("[data-export-host]")).toHaveCount(0);
  return { files: unpack(path), path };
}

test("faithful Word contains complete matching page PNGs for every component style", async ({ page }) => {
  const data = createDefaultResume();
  data.template = "panda"; data.background = "template"; data.photo = "fixture";
  data.exportSettings.quality = 1.5;
  data.sections = componentCatalog.map((catalog, index) => ({
    id: `section-${catalog.type}`, visible: true, title: catalog.name, subtitle: `SECTION ${index + 1}`,
    components: catalog.styles.map((style, i) => ({
      ...createComponent(catalog.type), style: style.value,
      title: catalog.type === "tags" ? "设计, 开发, 协作" : `${catalog.name} · ${style.label}`,
      icon: i % 2 ? "original-cat" : "star", iconStyle: (["badge", "soft", "line"] as const)[i % 3],
      color: "#ae3972", width: 95, indent: 5, value: catalog.type === "spacer" ? 24 : 70,
      ...(catalog.type === "image" ? { image: "fixture" } : {}),
    })),
  }));
  await openResume(page, data);
  const reference = await page.evaluate(async data => {
    const { withExportPages, captureResumePage } = await import(/* @vite-ignore */ "/src/exportCapture.tsx");
    data.photo = (window as any).__wordPicture;
    data.sections.forEach(s => s.components.forEach(c => { if (c.image === "fixture") c.image = data.photo; }));
    return withExportPages(data, async pages => {
      const pngs: string[] = [];
      const styles = pages.flatMap(p => Array.from(p.querySelectorAll(".resume-component"), el => el.className));
      const icons = pages.reduce((n, p) => n + p.querySelectorAll(".component-decoration svg").length, 0);
      const photos = pages.reduce((n, p) => n + p.querySelectorAll("img").length, 0);
      for (const page of pages) {
        const canvas = await captureResumePage(page, data.exportSettings.quality);
        pngs.push(canvas.toDataURL("image/png").split(",")[1]);
        canvas.width = canvas.height = 1;
      }
      return { pngs, styles, icons, photos };
    });
  }, data);
  const { files, path } = await downloadWord(page, data);
  const xml = strFromU8(files["word/document.xml"]);
  expect(reference.styles).toHaveLength(componentCatalog.reduce((n, c) => n + c.styles.length, 0));
  expect(reference.icons).toBeGreaterThan(20);
  expect(reference.photos).toBe(4);
  expect(reference.pngs.length).toBeGreaterThan(1);
  expect(media(files)).toHaveLength(reference.pngs.length);
  await expectMatchingPages(page, files, reference.pngs);
  expect(xml).not.toContain("w:txbxContent");
  expect(xml).toContain('w:w="11906" w:h="16838"');
  expect((xml.match(/<w:pageBreakBefore\//g) || []).length).toBe(reference.pngs.length - 1);
  for (const key of media(files)) {
    const png = Buffer.from(files[key]);
    expect(png.readUInt32BE(16)).toBe(1191);
    expect(png.readUInt32BE(20)).toBe(1684);
  }
  writeFileSync("test-results/faithful-components.docx", readFileSync(path));
  writeFileSync("test-results/faithful-components-page.png", files[media(files)[0]]);
});

test("editable Word preserves graphics, line positions, links and multicolumn text without changing layout", async ({ page }) => {
  const data = createDefaultResume();
  data.template = "cat-nap"; data.background = "template";
  data.exportSettings.wordMode = "editable"; data.exportSettings.quality = 1.5;
  for (const style of ["bar", "circle", "dots", "blocks"]) {
    const c = createComponent("progress"); c.style = style; c.title = `图形测试 ${style}`;
    c.icon = "original-dog"; c.iconStyle = "soft"; c.color = "#c7388a";
    data.sections[0].components.push(c);
  }
  const link = createComponent("links"); link.title = "独立作品集"; link.description = "https://example.com/portfolio";
  data.sections[0].components.push(link);
  await openResume(page, data);
  const result = await page.evaluate(async data => {
    const { withExportPages, captureResumePage } = await import(/* @vite-ignore */ "/src/exportCapture.tsx");
    const { measureWordText } = await import(/* @vite-ignore */ "/src/word.ts");
    return withExportPages(data, async pages => {
      let maxDrift = 0, lines = 0;
      const pngs: string[] = [];
      const textPages: unknown[] = [];
      for (const page of pages) {
        const nodes = Array.from(page.querySelectorAll(".resume-component,.resume-contact,.identity-main,.resume-section-heading"));
        const before = nodes.map(el => el.getBoundingClientRect());
        const measured = measureWordText(page, data);
        textPages.push(measured); lines += measured.length;
        nodes.forEach((el, i) => {
          const after = el.getBoundingClientRect();
          for (const p of ["x", "y", "width", "height"] as const) maxDrift = Math.max(maxDrift, Math.abs(after[p] - before[i][p]));
        });
        const canvas = await captureResumePage(page, data.exportSettings.quality, true);
        pngs.push(canvas.toDataURL("image/png").split(",")[1]); canvas.width = canvas.height = 1;
      }
      return { maxDrift, lines, pngs, textPages };
    });
  }, data);
  expect(result.maxDrift).toBeLessThan(.5);
  const { files, path } = await downloadWord(page, data);
  const xml = strFromU8(files["word/document.xml"]);
  expect((xml.match(/<w:txbxContent>/g) || []).length).toBe(result.lines);
  expect(xml).toContain("独立作品集");
  expect(xml).toContain("图形测试 circle");
  expect(xml).toContain('relativeFrom="page"');
  expect(strFromU8(files["word/_rels/document.xml.rels"])).toContain("https://example.com/portfolio");
  await expectMatchingPages(page, files, result.pngs);
  writeFileSync("test-results/editable-graphics.docx", readFileSync(path));
  writeFileSync("test-results/editable-graphics-page.png", files[media(files)[0]]);
  writeFileSync("test-results/editable-positions.json", JSON.stringify(result.textPages));
});

test("Word applies watermark, page number, background and current-page settings on desktop and phone", async ({ page }) => {
  const data = createDefaultResume(); data.template = "midnight"; data.background = "template";
  // Keep more than one page even after disabling the first-page brand block.
  data.sections[0].components[0].description = Array.from({ length: 60 }, (_, i) => `第 ${i + 1} 条经历：用户研究、设计与开发协作。`).join("\n");
  data.exportSettings.quality = 1.5;
  await openResume(page, data);
  const branded = await downloadWord(page, data);
  const firstImages = media(branded.files).map(k => hash(branded.files[k]));
  await page.setViewportSize({ width: 390, height: 844 });
  data.exportSettings.watermark = false; data.exportSettings.pageNumbers = false; data.exportSettings.background = false;
  const clean = await downloadWord(page, data);
  expect(media(clean.files).map(k => hash(clean.files[k]))).not.toEqual(firstImages);
  const settings = await page.evaluate(async data => {
    const { withExportPages } = await import(/* @vite-ignore */ "/src/exportCapture.tsx");
    return withExportPages(data, async pages => pages.map(p => ({
      brands: p.querySelectorAll(".paper-brand").length,
      footer: p.querySelector(".paper-watermark")!.textContent,
      number: p.querySelector(".paper-page-number")!.textContent,
      background: getComputedStyle(p).backgroundColor,
      graphic: !!p.querySelector(".design-scene"),
    })));
  }, data);
  expect(settings.every(p => !p.brands && !p.footer && !p.number && p.background === "rgb(255, 255, 255)" && p.graphic)).toBe(true);
  data.exportSettings.pages = "current";
  const one = await downloadWord(page, data, 2);
  expect(media(one.files)).toHaveLength(1);
  const xml = strFromU8(one.files["word/document.xml"]);
  expect(xml).toContain('name="Resume page 2"');
  expect(xml).not.toContain("w:pageBreakBefore");
  expect(xml).not.toContain("w:txbxContent");
});

test("Word does not silently omit broken photos and always cleans its temporary renderer", async ({ page }) => {
  const data = createDefaultResume(); data.photo = "data:image/png;base64,broken";
  await page.goto("/");
  const error = await page.evaluate(async data => {
    const { buildWordBlob } = await import(/* @vite-ignore */ "/src/word.ts");
    try { await buildWordBlob(data); return ""; } catch (error) { return (error as Error).message; }
  }, data);
  expect(error).toContain("图片载入失败");
  await expect(page.locator("[data-export-host]")).toHaveCount(0);
});

test("all original cartoon themes keep their page decoration in Word rendering", async ({ page }) => {
  await page.goto("/");
  const data = createDefaultResume(); data.sections = []; data.exportSettings.quality = 1.5;
  const cartoons = templates.filter(t => t.motif);
  const results = await page.evaluate(async ({ data, cartoons }) => {
    const { withExportPages, captureResumePage } = await import(/* @vite-ignore */ "/src/exportCapture.tsx");
    const results: { id: string; png: string; drawings: number }[] = [];
    for (const template of cartoons) {
      data.template = template.id; data.background = "template"; data.accent = template.color;
      await withExportPages(data, async pages => {
        const canvas = await captureResumePage(pages[0], 1.5);
        results.push({ id: template.id, png: canvas.toDataURL(), drawings: pages[0].querySelectorAll("svg").length });
        canvas.width = canvas.height = 1;
      });
    }
    return results;
  }, { data, cartoons });
  expect(results).toHaveLength(cartoons.length);
  expect(results.every(r => r.drawings >= 5)).toBe(true);
  expect(new Set(results.map(r => r.png)).size).toBe(cartoons.length);
  await expect(page.locator("[data-export-host]")).toHaveCount(0);
});
