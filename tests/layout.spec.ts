import { test, expect, type Page, type CDPSession } from "@playwright/test";
import { designs } from "../src/designs";

const undo = (page: Page) => page.getByRole("button", { name: "撤销 (Ctrl / ⌘ Z)", exact: true });
const mobileUndo = async (page: Page) => {
  await page.getByRole("button", { name: "更多简历操作", exact: true }).click();
  await page.getByRole("button", { name: "撤销上一步", exact: true }).click();
};
const previewOrder = (page: Page) => page.locator(".resume-page [data-drag-section]").evaluateAll(nodes => [...new Set(nodes.map(n => n.getAttribute("data-drag-section")))]);
const editorOrder = (page: Page) => page.locator(".editor-pane [data-drag-section]").evaluateAll(nodes => nodes.map(n => n.getAttribute("data-drag-section")));
const touch = (session: CDPSession, type: "touchStart" | "touchMove" | "touchEnd", x = 0, y = 0) => session.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x, y, id: 1 }] });

test("clear keeps the design, asks for confirmation, and restores everything in one undo", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "模板", exact: true }).click();
  await page.getByRole("button", { name: "栗栗熊的蜂蜜 Honey Bear 模板", exact: true }).click();
  await page.getByRole("tab", { name: "简历内容", exact: true }).click();
  await page.getByRole("button", { name: "清空当前简历", exact: true }).click();
  await page.getByRole("button", { name: "取消", exact: true }).click();
  await expect(page.getByLabel("姓名", { exact: true })).toHaveValue("林予安");
  await page.getByRole("button", { name: "清空当前简历", exact: true }).click();
  await page.getByRole("button", { name: "确认清空", exact: true }).click();
  await expect(page.getByLabel("姓名", { exact: true })).toHaveValue("");
  await expect(page.locator(".resume-page")).toHaveCount(1);
  await expect(page.locator(".resume-page")).toHaveClass(/design-bear-honey/);
  await expect(page.locator(".resume-page [data-drag-section]")).toHaveCount(0);
  await expect(page.locator(".blank-canvas-hint")).toBeVisible();
  await undo(page).click();
  await expect(page.getByLabel("姓名", { exact: true })).toHaveValue("林予安");
  expect(await previewOrder(page)).toEqual(["about", "experience", "education", "projects", "skills"]);
});

test("blank design preserves content; starting from scratch can add sections and components directly", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "模板", exact: true }).click();
  await page.getByRole("button", { name: "空白画布 Blank Canvas 模板", exact: true }).click();
  await expect(page.locator(".resume-page h1")).toContainText("林予安");
  await expect(page.locator(".resume-page .identity-art, .resume-page .identity-mascot")).toHaveCount(0);
  await page.getByRole("tab", { name: "简历内容", exact: true }).click();
  await page.getByRole("button", { name: "从空白开始", exact: true }).click();
  await page.getByRole("button", { name: "创建空白简历", exact: true }).click();
  await expect(page.locator(".resume-page")).toHaveClass(/design-blank/);
  await expect(page.getByLabel("姓名", { exact: true })).toHaveValue("");
  await page.getByRole("button", { name: "添加第一个栏目", exact: true }).click();
  await page.getByRole("dialog").getByLabel("栏目名称", { exact: true }).fill("我的故事");
  await page.getByRole("button", { name: "完成编辑", exact: true }).click();
  await page.getByRole("button", { name: "添加第一个组件", exact: true }).click();
  await page.locator(".component-catalog").getByRole("button", { name: /自由文本/ }).click();
  await expect(page.locator(".resume-page .resume-component")).toHaveCount(1);
  await page.getByRole("button", { name: "编辑栏目标题：我的故事", exact: true }).click();
  await expect(page.getByRole("dialog").getByLabel("栏目名称", { exact: true })).toHaveValue("我的故事");
});

test("drag floats the actual content under the mouse and reorders before release, with one undo", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".save-status")).toContainText("所有更改已保存");
  const units = page.locator('.resume-page [data-edit-section="experience"]');
  const sourceId = await units.first().getAttribute("data-edit-unit");
  const originalSaved = await page.evaluate(() => localStorage.getItem("birchify-resume-v1"));
  const source = page.locator(`.resume-page [data-edit-unit="${sourceId}"]`);
  await source.hover();
  const handle = (await source.locator(".preview-drag-handle").boundingBox())!;
  const visual = (await source.locator(".component-edit-target").boundingBox())!;
  const target = (await units.nth(1).boundingBox())!;
  const from = { x: handle.x + 12, y: handle.y + 12 };
  const to = { x: target.x + 60, y: target.y + target.height - 4 };
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 10 });
  const ghost = page.locator(".drag-content-preview");
  await expect(ghost).toContainText("资深产品设计师");
  await expect(units.first().locator("h3")).toHaveText("产品设计师");
  const floated = (await ghost.boundingBox())!;
  expect(floated.x).toBeCloseTo(visual.x + to.x - from.x, 0);
  expect(floated.y).toBeCloseTo(visual.y + to.y - from.y, 0);
  await page.waitForTimeout(180);
  await expect(units.last()).toHaveAttribute("data-edit-unit", sourceId!);
  expect(await page.evaluate(() => localStorage.getItem("birchify-resume-v1"))).toBe(originalSaved);
  await page.mouse.up();
  await expect(ghost).toHaveCount(0);
  await undo(page).click();
  await expect(units.first()).toHaveAttribute("data-edit-unit", sourceId!);
  await expect(undo(page)).toBeDisabled();
});

test("whole sections reorder live and Escape restores the original without creating history", async ({ page }) => {
  await page.goto("/");
  const source = page.locator('.resume-page [data-drag-section="about"]').first();
  const target = (await page.locator('.resume-page [data-drag-section="experience"]').first().boundingBox())!;
  await source.hover();
  const handle = (await source.locator(".preview-section-handle").boundingBox())!;
  await page.mouse.move(handle.x + 12, handle.y + 12);
  await page.mouse.down();
  await page.mouse.move(target.x + 75, target.y + target.height - 5, { steps: 12 });
  await expect(page.locator(".drag-content-preview")).toContainText("关于我");
  await expect.poll(() => previewOrder(page)).toEqual(["experience", "about", "education", "projects", "skills"]);
  await page.keyboard.press("Escape");
  await page.mouse.up();
  await expect(page.locator(".drag-content-preview")).toHaveCount(0);
  expect(await previewOrder(page)).toEqual(["about", "experience", "education", "projects", "skills"]);
  await expect(undo(page)).toBeDisabled();
});

test("designs have unique structure recipes and real columns and title rails", async ({ page }) => {
  const recipes = Object.entries(designs).filter(([id]) => id !== "blank").map(([,d]) => [d.flow,d.header,d.panel,d.heading,d.surface].join("/"));
  expect(recipes).toHaveLength(74);
  expect(new Set(recipes).size).toBe(74);
  await page.goto("/");
  await page.getByRole("tab", { name: "模板", exact: true }).click();
  await page.getByRole("button", { name: "主编 Editorial 模板", exact: true }).click();
  for (const lane of [0,1]) await expect(page.locator(`.resume-page .column-${lane} [data-drag-section]`).first()).toBeAttached();
  await page.getByRole("button", { name: "工坊 Atelier 模板", exact: true }).click();
  await expect(page.locator(".resume-page .resume-section-fragment").first()).toHaveCSS("display", "grid");
  await expect(page.locator(".resume-page").first()).toHaveClass(/flow-single.*panel-rail/);
});

test.describe("native mobile touch", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("editor sections follow the finger with visible content and live preview", async ({ page }) => {
    await page.goto("/");
    await page.locator(".personal-card .section-toggle").click();
    const source = page.locator('.editor-pane [data-drag-section="about"]');
    await page.locator('.editor-pane [data-drag-section="experience"]').scrollIntoViewIfNeeded();
    const handle = (await source.locator(".editor-section-handle").boundingBox())!;
    const target = (await page.locator('.editor-pane [data-drag-section="experience"]').boundingBox())!;
    const session = await page.context().newCDPSession(page);
    await touch(session, "touchStart", handle.x + 22, handle.y + 22);
    await touch(session, "touchMove", handle.x + 18, handle.y + 30);
    await touch(session, "touchMove", target.x + 65, target.y + target.height - 6);
    await expect(page.locator(".drag-content-preview")).toContainText("关于我");
    await expect.poll(() => editorOrder(page)).toEqual(["experience", "about", "education", "projects", "skills"]);
    await expect.poll(() => previewOrder(page)).toEqual(["experience", "about", "education", "projects", "skills"]);
    await touch(session, "touchEnd");
    await expect(page.locator(".drag-content-preview")).toHaveCount(0);
    await mobileUndo(page);
    expect(await editorOrder(page)).toEqual(["about", "experience", "education", "projects", "skills"]);
  });

  test("preview touch continues after a component moves to another section, and supports section drag", async ({ page }) => {
    await page.goto("/");
    await page.locator(".mobile-nav").getByRole("button", { name: "预览", exact: true }).click();
    const source = page.locator('.resume-page [data-edit-section="experience"]').first();
    const sourceId = await source.getAttribute("data-edit-unit");
    const handle = (await source.locator(".preview-drag-handle").boundingBox())!;
    expect(await page.evaluate(({x,y}) => document.elementFromPoint(x + 18, y + 18)?.closest("button")?.classList.contains("preview-drag-handle"), handle)).toBe(true);
    const target = (await page.locator('.resume-page [data-edit-section="about"]').boundingBox())!;
    const session = await page.context().newCDPSession(page);
    await touch(session, "touchStart", handle.x + 18, handle.y + 18);
    await touch(session, "touchMove", handle.x + 14, handle.y + 26);
    const drop = { x: target.x + 60, y: target.y + target.height - 3 };
    await touch(session, "touchMove", drop.x, drop.y);
    const moved = page.locator(`.resume-page [data-edit-section="about"][data-edit-unit="${sourceId}"]`);
    await expect(moved).toHaveCount(1);
    const before = (await page.locator(".drag-content-preview").boundingBox())!;
    await touch(session, "touchMove", drop.x + 10, drop.y + 7);
    await expect.poll(async () => (await page.locator(".drag-content-preview").boundingBox())!.x - before.x).toBeCloseTo(10, 0);
    const after = (await page.locator(".drag-content-preview").boundingBox())!;
    expect(after.x - before.x).toBeCloseTo(10, 0);
    expect(after.y - before.y).toBeCloseTo(7, 0);
    await touch(session, "touchEnd");
    await expect(moved).toHaveCount(1);
    await expect(page.locator(".drag-content-preview")).toHaveCount(0);
    await mobileUndo(page);
    const about = page.locator('.resume-page [data-drag-section="about"]').first();
    const sectionHandle = (await about.locator(".preview-section-handle").boundingBox())!;
    const experience = (await page.locator('.resume-page [data-drag-section="experience"]').first().boundingBox())!;
    expect(sectionHandle.height).toBeGreaterThanOrEqual(43);
    await touch(session, "touchStart", sectionHandle.x + 18, sectionHandle.y + 18);
    await touch(session, "touchMove", sectionHandle.x + 15, sectionHandle.y + 26);
    await touch(session, "touchMove", experience.x + 70, experience.y + experience.height - 4);
    await expect.poll(() => previewOrder(page)).toEqual(["experience", "about", "education", "projects", "skills"]);
    await touch(session, "touchEnd");
    await page.getByRole("button", { name: "编辑栏目标题：关于我", exact: true }).click();
    await expect(page.getByRole("dialog").getByLabel("栏目名称", { exact: true })).toHaveCSS("font-size", "16px");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: "test-results/mobile-layout-dialog.png" });
  });
});
