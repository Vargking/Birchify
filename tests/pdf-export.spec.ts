import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { getDocument, OPS } from "pdfjs-dist/legacy/build/pdf.mjs";
import { componentCatalog, createComponent, createDefaultResume, templates } from "../src/data";
import type { ResumeData } from "../src/types";

async function openResume(page: Page, data: ResumeData) {
  await page.addInitScript(data => localStorage.setItem("birchify-resume-v1", JSON.stringify(data)), data);
  await page.goto("/");
}

async function inspectPDF(path: string) {
  const bytes = readFileSync(path);
  const task = getDocument({ data: new Uint8Array(bytes), useSystemFonts: true, isEvalSupported: false });
  const doc = await task.promise;
  try {
    const pages = [];
    for (let number = 1; number <= doc.numPages; number++) {
      const page = await doc.getPage(number), content = await page.getTextContent();
      const items = content.items.filter(item => "str" in item);
      const operators = await page.getOperatorList();
      pages.push({ text: items.map(item => item.str).join("\n"), items, annotations: await page.getAnnotations(),
        images: operators.fnArray.filter(op => [OPS.paintImageXObject, OPS.paintInlineImageXObject].includes(op)).length,
        width: page.view[2], height: page.view[3] });
    }
    return { pages, text: pages.map(page => page.text).join("\n"), raw: bytes.toString("latin1") };
  } finally {
    await task.destroy();
  }
}

async function exportFromDialog(page: Page, target: string) {
  const pending = page.waitForEvent("download", { timeout: 60000 });
  await page.getByRole("button", { name: /^开始导出/ }).click();
  const download = await pending;
  await download.saveAs(target);
  return { download, pdf: await inspectPDF(target) };
}

test("ATS PDF contains real ordered Chinese text, every semantic component and safe clickable links", async ({ page }) => {
  const data = createDefaultResume();
  data.template = "panda"; data.font = "longcang";
  data.exportSettings.pages = "current";
  data.exportSettings.fileName = "招聘简历.docx";
  data.exportSettings.background = false;
  data.sections = componentCatalog.map(catalog => ({ id: catalog.type, visible: true,
    title: `${catalog.name}栏目`, subtitle: `SECTION ${catalog.type}`,
    components: [{ ...createComponent(catalog.type), title: `${catalog.name}内容`,
      subtitle: `${catalog.name}补充说明`, date: "2022.01 - 2026.10", value: 78,
      description: catalog.type === "links" ? "https://example.com/portfolio" : `${catalog.name}详细经历与成果`,
      // Broken photos must not prevent a text-only export: images are intentionally excluded.
      ...(catalog.type === "image" ? { image: "data:image/png;base64,broken" } : {}) }],
  }));
  data.sections.push({ id: "hidden", title: "隐藏的秘密", subtitle: "", visible: false, components: [createComponent("text")] });
  await openResume(page, data);
  const remote: string[] = [];
  page.on("request", request => { if (!request.url().startsWith("http://localhost:5173") && !request.url().startsWith("data:")) remote.push(request.url()); });
  await page.getByRole("button", { name: "导出 PDF / ATS", exact: true }).click();
  await expect(page.getByRole("dialog")).not.toContainText("Word");
  await page.getByRole("button", { name: /^ATS 友好 PDF/ }).click();
  await expect(page.getByLabel("导出范围", { exact: true })).toHaveCount(0);
  await expect(page.getByLabel("导出清晰度", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("switch", { name: "Birchify 品牌水印", exact: true })).toHaveCount(0);
  await expect(page.locator(".save-status")).toContainText("已保存");
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem("birchify-resume-v1")!));
  const { download, pdf } = await exportFromDialog(page, "test-results/ats-components.pdf");
  expect(download.suggestedFilename()).toBe("招聘简历.pdf");
  for (const text of [data.name, data.email, data.phone, data.website, "78%", "2022.01 - 2026.10"]) expect(pdf.text).toContain(text);
  for (const catalog of componentCatalog.filter(catalog => !["divider", "spacer"].includes(catalog.type))) {
    expect(pdf.text).toContain(`${catalog.name}内容`);
    expect(pdf.text).toContain(`${catalog.name}补充说明`);
  }
  expect(pdf.text).not.toContain("隐藏的秘密");
  expect(pdf.text).not.toContain("Made with Birchify");
  expect(pdf.pages.every(page => page.images === 0)).toBe(true);
  expect(pdf.raw).toContain("/ToUnicode"); expect(pdf.raw).toContain("/FontFile2");
  expect(pdf.pages.flatMap(page => page.annotations).some(annotation => annotation.url === "https://example.com/portfolio")).toBe(true);
  const positions = data.sections.filter(section => section.visible).map(section => pdf.text.indexOf(section.title));
  expect(positions).toEqual([...positions].sort((a, b) => a - b));
  expect(remote).toEqual([]);
  await expect(page.locator("[data-export-host]")).toHaveCount(0);
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem("birchify-resume-v1")!));
  expect(after).toEqual(before);
  await page.getByRole("button", { name: "导出 PDF / ATS", exact: true }).click();
  await page.getByRole("button", { name: /^设计版 PDF/ }).click();
  await expect(page.getByLabel("导出范围", { exact: true })).toHaveValue("current");
  await expect(page.getByRole("switch", { name: "纸张背景", exact: true })).toHaveAttribute("aria-checked", "false");
});

test("phone ATS export dialog fits a narrow screen and produces a downloadable PDF", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/");
  await page.getByRole("button", { name: "导出 PDF / ATS", exact: true }).click();
  await page.getByRole("button", { name: /^ATS 友好 PDF/ }).click();
  const dialog = page.getByRole("dialog");
  expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
  await page.getByRole("button", { name: /^开始导出/ }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: "test-results/ats-mobile-dialog.png" });
  const { download, pdf } = await exportFromDialog(page, "test-results/ats-mobile.pdf");
  expect(download.suggestedFilename()).toBe("林予安_ATS.pdf");
  expect(pdf.text).toContain("林予安");
  await expect(page.locator(".export-overlay")).toHaveCount(0);
  await page.reload();
  await page.getByRole("button", { name: "导出 PDF / ATS", exact: true }).click();
  await expect(page.getByRole("button", { name: /^ATS 友好 PDF/ })).toHaveAttribute("aria-pressed", "true");
});

test("ATS automatic pagination preserves long content and keeps all text inside page margins", async ({ page }) => {
  await page.goto("/");
  const data = createDefaultResume();
  const longURL = `https://example.com/${"portfolio".repeat(35)}`;
  data.sections = [{ id: "long", visible: true, title: "工作经历", subtitle: "WORK EXPERIENCE", components: [{
    ...createComponent("text"), title: "研究项目", description: Array.from({ length: 240 }, (_, i) => `第${i + 1}段：研究与设计经验，保留所有文字与阅读顺序。`).join("\r\n") + `\n\n${longURL}\n最终内容完整保留`,
  }] }];
  const pending = page.waitForEvent("download");
  await page.evaluate(async data => {
    const { buildATSPDF } = await import(/* @vite-ignore */ "/src/ats.ts");
    const pdf = await buildATSPDF(data);
    pdf.save("ats-long.pdf");
  }, data);
  const download = await pending;
  const pdf = await inspectPDF((await download.path())!);
  expect(pdf.pages.length).toBeGreaterThan(4);
  for (let i = 1; i <= 240; i++) expect(pdf.text).toContain(`第${i}段`);
  expect(pdf.text).toContain("最终内容完整保留");
  expect(pdf.text.replace(/\s/g, "")).toContain(longURL);
  const positions = Array.from({ length: 240 }, (_, i) => pdf.text.indexOf(`第${i + 1}段`));
  expect(positions).toEqual([...positions].sort((a, b) => a - b));
  for (const sheet of pdf.pages) for (const item of sheet.items.filter(item => item.str.trim())) {
    expect(item.transform[4]).toBeGreaterThanOrEqual(47);
    expect(item.transform[4] + item.width).toBeLessThanOrEqual(sheet.width - 46);
    expect(item.transform[5]).toBeGreaterThanOrEqual(47);
    expect(item.transform[5]).toBeLessThanOrEqual(sheet.height - 47);
  }
  await download.saveAs("test-results/ats-long.pdf");
});

for (const legacy of [undefined, "docx"]) test(`legacy format ${legacy} safely migrates to PDF and JSON import preserves ATS`, async ({ page }) => {
  const data = createDefaultResume();
  Object.assign(data.exportSettings, { format: legacy, wordMode: "editable" });
  await openResume(page, data);
  await expect(page.locator(".save-status")).toContainText("已保存");
  const settings = await page.evaluate(() => JSON.parse(localStorage.getItem("birchify-resume-v1")!).exportSettings);
  expect(settings.format).toBe("pdf"); expect(settings.wordMode).toBeUndefined();
  data.exportSettings.format = "ats";
  await page.locator('input[accept="application/json,.json"]').setInputFiles({ name: "resume.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(data)) });
  await page.getByRole("button", { name: "导出 PDF / ATS", exact: true }).click();
  await expect(page.getByRole("button", { name: /^ATS 友好 PDF/ })).toHaveAttribute("aria-pressed", "true");
});

test("ATS handles empty content, rejects unsupported glyphs explicitly and retries a failed local font request", async ({ page }) => {
  await page.goto("/");
  const data = createDefaultResume();
  const result = await page.evaluate(async data => {
    const { buildATSPDF } = await import(/* @vite-ignore */ "/src/ats.ts");
    data.name = data.role = data.email = data.phone = data.location = data.website = "";
    data.sections = [];
    const blank = await buildATSPDF(data);
    data.name = "设计师😀";
    let error = "";
    try { await buildATSPDF(data); } catch (caught) { error = (caught as Error).message; }
    return { pages: blank.getNumberOfPages(), error };
  }, data);
  expect(result.pages).toBe(1);
  expect(result.error).toContain("😀"); expect(result.error).toContain("不会静默丢失内容");
  // Fresh page resets the lazy font cache, so this checks the actual failed-load path.
  await page.reload();
  await page.route("**/fonts/BirchifyATS-Regular.ttf", route => route.fulfill({ status: 404, body: "not found" }));
  const failure = await page.evaluate(async data => {
    const { buildATSPDF } = await import(/* @vite-ignore */ "/src/ats.ts");
    try { await buildATSPDF(data); return ""; } catch (error) { return (error as Error).message; }
  }, data);
  expect(failure).toContain("字体加载失败");
  await page.unroute("**/fonts/BirchifyATS-Regular.ttf");
  expect(await page.evaluate(async data => {
    const { buildATSPDF } = await import(/* @vite-ignore */ "/src/ats.ts");
    return (await buildATSPDF(data)).getNumberOfPages();
  }, data)).toBeGreaterThan(0);
});

test("design PDF captures all component styles and cleans up on invalid photos", async ({ page }) => {
  await page.goto("/");
  const data = createDefaultResume(); data.template = "panda"; data.exportSettings.quality = 1.5;
  data.sections = componentCatalog.map(catalog => ({ id: catalog.type, visible: true, title: catalog.name, subtitle: "",
    components: catalog.styles.map(style => ({ ...createComponent(catalog.type), style: style.value, icon: "original-cat", value: 70 })) }));
  const pending = page.waitForEvent("download", { timeout: 60000 });
  const count = await page.evaluate(async data => {
    const { buildPDF } = await import(/* @vite-ignore */ "/src/pdf.ts");
    const pdf = await buildPDF(data); pdf.save("design-components.pdf");
    return pdf.getNumberOfPages();
  }, data);
  const download = await pending;
  const pdf = await inspectPDF((await download.path())!);
  expect(pdf.pages).toHaveLength(count); expect(count).toBeGreaterThan(2);
  expect(pdf.pages.every(page => page.images === 1)).toBe(true);
  await download.saveAs("test-results/design-components.pdf");
  const error = await page.evaluate(async data => {
    const { buildPDF } = await import(/* @vite-ignore */ "/src/pdf.ts");
    data.photo = "data:image/png;base64,broken";
    try { await buildPDF(data); return ""; } catch (error) { return (error as Error).message; }
  }, data);
  expect(error).toContain("图片载入失败");
  await expect(page.locator("[data-export-host]")).toHaveCount(0);
});

test("all original cartoon themes retain their unique design PDF decorations", async ({ page }) => {
  await page.goto("/");
  const data = createDefaultResume(); data.sections = []; data.exportSettings.quality = 1.5;
  const cartoons = templates.filter(template => template.motif);
  const result = await page.evaluate(async ({ data, cartoons }) => {
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
    return { count: results.length, unique: new Set(results.map(result => result.png)).size, drawings: results.every(result => result.drawings >= 5) };
  }, { data, cartoons });
  expect(result.count).toBe(cartoons.length); expect(result.unique).toBe(cartoons.length); expect(result.drawings).toBe(true);
  await expect(page.locator("[data-export-host]")).toHaveCount(0);
});
