import { test, expect, type Page } from "@playwright/test";
import { createDefaultResume, templates } from "../src/data";
import { designFor } from "../src/designs";
import { themedSurfaces } from "../src/ThemeScenery";
import { readFileSync } from "node:fs";

const newThemes = templates.filter(t => themedSurfaces.has(designFor(t.id).surface));
const saved = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem("birchify-resume-v1")!));
const settled = (page: Page) => expect(page.locator(".save-status")).toContainText("所有更改已保存到本机");
const selectTemplate = (page: Page, id: string) => {
  const t = templates.find(t => t.id === id)!;
  return page.getByRole("button", { name: `${t.name} ${t.english} 模板`, exact: true }).click();
};

test("24 additions have distinct species, vector scenery and non-colour layout treatments", async ({ page }) => {
  expect(newThemes).toHaveLength(24);
  expect(new Set(newThemes.map(t => t.motif)).size).toBe(24);
  expect(new Set(newThemes.map(t => designFor(t.id).surface)).size).toBe(24);
  await page.goto("/");
  await page.getByRole("tab", { name: "模板", exact: true }).click();
  const scenes: string[] = [], layouts: string[] = [];
  const remote: string[] = [];
  page.on("request", r => { if (!r.url().startsWith("http://localhost:5173") && !r.url().startsWith("data:")) remote.push(r.url()); });
  for (const theme of newThemes) {
    await selectTemplate(page, theme.id);
    const sheet = page.locator(".resume-page").first();
    await expect(sheet).toHaveClass(new RegExp(`design-${theme.id} `));
    await expect(sheet.locator("[data-theme-decoration]")).toHaveAttribute("data-theme-decoration", designFor(theme.id).surface);
    await expect(sheet.locator(".identity-mascot [data-animal-drawing]")).toHaveAttribute("data-animal-drawing", theme.motif!);
    scenes.push(await sheet.locator("[data-theme-decoration]").evaluate(node => JSON.stringify([...node.querySelectorAll("path,rect,circle,ellipse,line")].map(n => [n.tagName, ...["d","x","y","cx","cy","rx","ry","r","width","height","transform"].map(a => n.getAttribute(a))]))));
    layouts.push(await sheet.evaluate(node => JSON.stringify([
      ...[".resume-columns", ".resume-identity", ".resume-section-fragment", ".resume-section-heading"].map(selector => {
        const style = getComputedStyle(node.querySelector(selector)!);
        return ["display", "grid-template-columns", "border-radius", "border-top-width", "border-left-width", "border-style", "padding", "box-shadow"].map(p => style.getPropertyValue(p).replace(/rgba?\([^)]+\)/g, "COLOR"));
      }),
    ])));
  }
  expect(new Set(scenes).size).toBe(24);
  expect(new Set(layouts).size).toBe(24);
  expect(remote).toEqual([]);
});

test("switching templates follows their paper, with explicit overrides, undo and persistence", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "样式", exact: true }).click();
  await page.getByRole("button", { name: "背景：玫瑰粉", exact: true }).click();
  await expect(page.locator(".resume-page").first()).toHaveCSS("background-color", "rgb(252, 243, 242)");
  await page.getByRole("tab", { name: "模板", exact: true }).click();
  await selectTemplate(page, "panda-bamboo");
  await expect(page.locator(".resume-page").first()).toHaveCSS("background-color", "rgb(241, 247, 234)");
  await selectTemplate(page, "pig-studio");
  await expect(page.locator(".resume-page").first()).toHaveCSS("background-color", "rgb(255, 240, 244)");
  await page.getByRole("button", { name: "撤销 (Ctrl / ⌘ Z)", exact: true }).click();
  await expect(page.locator(".resume-page").first()).toHaveClass(/design-panda-bamboo/);
  await expect(page.locator(".resume-page").first()).toHaveCSS("background-color", "rgb(241, 247, 234)");
  await page.getByRole("tab", { name: "样式", exact: true }).click();
  await expect(page.getByRole("button", { name: "背景：跟随模板", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "背景：纯净白", exact: true }).click();
  await expect(page.locator(".resume-page").first()).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await settled(page);
  await page.reload();
  await expect(page.locator(".resume-page").first()).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await page.getByRole("tab", { name: "样式", exact: true }).click();
  await page.getByRole("button", { name: "背景：跟随模板", exact: true }).click();
  await expect(page.locator(".resume-page").first()).toHaveCSS("background-color", "rgb(241, 247, 234)");
  await settled(page);
  await page.reload();
  expect((await saved(page)).background).toBe("template");
});

test("example content confirms, restores all original fields, keeps design and undoes as one step", async ({ page }) => {
  const initial = createDefaultResume();
  const original = { ...initial, name: "我的内容", role: "自定义职位", email: "me@local.test", phone: "12345", location: "自定义城市", website: "local.test", photo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+y/2sAAAAASUVORK5CYII=", photoShape: "circle", template: "frog-pond", background: "rose", accent: "#123456", font: "serif", fontSize: 16, pagePadding: 40, sections: [{ ...initial.sections[0], title: "我自己的栏目", visible: false }], exportSettings: { ...initial.exportSettings, watermark: false, quality: 1.5, fileName: "我的文件" } };
  await page.addInitScript(data => { if (!localStorage.getItem("birchify-resume-v1")) localStorage.setItem("birchify-resume-v1", JSON.stringify(data)); }, original);
  await page.goto("/");
  await settled(page);
  const before = await saved(page);
  await page.getByRole("button", { name: "填入示例内容", exact: true }).click();
  await page.getByRole("button", { name: "取消", exact: true }).click();
  expect(await saved(page)).toEqual(before);
  await page.getByRole("button", { name: "填入示例内容", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("保留当前模板、背景和排版设置");
  await page.getByRole("button", { name: "确认填入示例", exact: true }).click();
  await expect(page.getByLabel("姓名", { exact: true })).toHaveValue("林予安");
  await expect(page.locator(".resume-page").first()).toHaveClass(/design-frog-pond/);
  await settled(page);
  const after = await saved(page);
  for (const key of ["name", "role", "email", "phone", "location", "website", "photo", "photoShape"] as const) expect(after[key]).toEqual(initial[key]);
  const withoutIds = (sections: typeof initial.sections) => sections.map(s => ({ ...s, components: s.components.map(({ id: _id, ...component }) => component) }));
  expect(withoutIds(after.sections)).toEqual(withoutIds(initial.sections));
  for (const key of ["template", "background", "accent", "font", "fontSize", "lineHeight", "pagePadding", "exportSettings"]) expect(after[key]).toEqual(before[key]);
  await page.getByRole("button", { name: "撤销 (Ctrl / ⌘ Z)", exact: true }).click();
  await settled(page);
  expect(await saved(page)).toEqual(before);
  await expect(page.getByRole("button", { name: "撤销 (Ctrl / ⌘ Z)", exact: true })).toBeDisabled();
});

test("new animal theme exports a real PDF without either watermark", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "模板", exact: true }).click();
  await selectTemplate(page, "raccoon-night");
  await page.getByRole("button", { name: "导出 PDF / Word", exact: true }).click();
  await page.getByRole("switch", { name: "Birchify 品牌水印", exact: true }).click();
  await page.getByLabel("导出清晰度", { exact: true }).selectOption("1.5");
  await expect(page.locator(".resume-page .paper-brand")).toHaveCount(0);
  await expect(page.locator(".resume-page .paper-watermark").first()).toBeEmpty();
  const downloadPromise = page.waitForEvent("download", {timeout: 30000});
  await page.getByRole("button", { name: /开始导出/ }).click();
  const download = await downloadPromise;
  const buffer = readFileSync((await download.path())!);
  expect(buffer.subarray(0,5).toString()).toBe("%PDF-");
  expect(buffer.length).toBeGreaterThan(50000);
});

test.describe("small mobile screens", () => {
  test.use({ viewport: { width: 320, height: 740 }, hasTouch: true, isMobile: true });
  test("example content and undo are accessible, template grid fits and grips stay 44px", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("姓名", { exact: true }).fill("手机用户");
    const actions = page.locator(".canvas-actions button");
    for (const action of await actions.all()) expect((await action.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await page.getByRole("button", { name: "更多简历操作", exact: true }).click();
    await page.getByRole("button", { name: "填入示例内容", exact: true }).last().click();
    await page.getByRole("button", { name: "确认填入示例", exact: true }).click();
    await expect(page.getByLabel("姓名", { exact: true })).toHaveValue("林予安");
    await page.getByRole("button", { name: "更多简历操作", exact: true }).click();
    await page.getByRole("button", { name: "撤销上一步", exact: true }).click();
    await expect(page.getByLabel("姓名", { exact: true })).toHaveValue("手机用户");
    await page.locator(".mobile-nav").getByRole("button", { name: "模板", exact: true }).click();
    await selectTemplate(page, "frog-pond");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator(".mobile-nav").getByRole("button", { name: "预览", exact: true }).click();
    await page.getByRole("button", { name: "排版", exact: true }).click();
    await page.locator(".resume-page .component-edit-target").first().click();
    const grip = page.locator(".resume-page .preview-drag-handle").first();
    const box = (await grip.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(43);
    expect(box.height).toBeGreaterThanOrEqual(43);
    expect(await grip.evaluate(el => getComputedStyle(el).touchAction)).toBe("none");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
});
