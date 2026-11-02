import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

test("103 icons, original cartoon search, styling and preview dialogs persist", async ({
  page,
}) => {
  await page.goto("/");
  const skill = page.getByRole("button", {
    name: "编辑组件：产品设计 / UI & UX",
    exact: true,
  });
  await skill.click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("标题 / 名称", { exact: true })
    .fill("视觉与交互设计");
  await dialog.getByRole("button", { name: /组件图标/ }).click();
  await expect(dialog.locator(".icon-palette>button")).toHaveCount(103);
  await dialog.getByRole("button", { name: "原创卡通", exact: true }).click();
  await expect(dialog.locator(".icon-palette>button")).toHaveCount(37);
  await dialog.getByLabel("搜索组件图标").fill("栖栖");
  await expect(dialog.locator(".icon-palette>button")).toHaveCount(1);
  await dialog
    .getByRole("button", { name: "图标：栖栖猫", exact: true })
    .click();
  await dialog.getByLabel("图标样式", { exact: true }).selectOption("soft");
  await dialog.getByLabel("组件颜色", { exact: true }).fill("#9465ab");
  await dialog.getByLabel("组件宽度", { exact: true }).fill("78");
  await dialog.getByLabel("左侧缩进", { exact: true }).fill("24");
  await dialog.getByRole("button", { name: "完成编辑", exact: true }).click();
  const component = page.getByRole("button", {
    name: "编辑组件：视觉与交互设计",
    exact: true,
  });
  await expect(component.locator(".art-cat")).toHaveCount(1);
  await expect(component.locator(".component-decoration")).toHaveClass(
    /decoration-soft/,
  );
  await expect(component.locator(".component-decoration")).toHaveCSS(
    "color",
    "rgb(148, 101, 171)",
  );
  await expect(component.locator(".component-layout")).toHaveCSS(
    "margin-left",
    "24px",
  );
  await expect(page.locator(".save-status")).toContainText("已保存");
  await page.reload();
  await page
    .getByRole("button", { name: "编辑组件：视觉与交互设计", exact: true })
    .click();
  await expect(
    page.getByRole("dialog").getByLabel("组件宽度", { exact: true }),
  ).toHaveValue("78");
  await expect(
    page.getByRole("dialog").getByLabel("图标样式", { exact: true }),
  ).toHaveValue("soft");
  await page.getByRole("button", { name: "完成编辑", exact: true }).click();
  await page
    .getByRole("button", { name: "编辑预览中的个人信息", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByLabel("姓名", { exact: true })
    .fill("许星禾");
  await page.getByRole("button", { name: "完成编辑", exact: true }).click();
  await expect(page.locator(".resume-page h1")).toContainText("许星禾");
});

test("104 distinct designs, blank canvas and all 52 cartoons render within page bounds", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.getByRole("tab", { name: "模板", exact: true }).click();
  const names = await page
    .locator(".template-option")
    .evaluateAll((options) =>
      options.map((o) => o.getAttribute("aria-label")!),
    );
  expect(names).toHaveLength(105);
  for (const name of names) {
    await page.getByRole("button", { name, exact: true }).click();
    await expect(page.locator(".preview-template")).toContainText(
      name.split(" ")[0],
    );
    await page.waitForTimeout(35);
    const bounds = await page
      .locator(".resume-page")
      .evaluateAll((pages) =>
        pages.every(
          (page) =>
            page.querySelector(".page-content")!.getBoundingClientRect()
              .bottom <
            page.querySelector(".paper-footer")!.getBoundingClientRect().top,
        ),
      );
    expect(bounds, name).toBe(true);
  }
  await page
    .locator(".filter-tabs")
    .getByRole("button", { name: "原创卡通", exact: true })
    .click();
  await expect(page.locator(".template-option")).toHaveCount(52);
  await page
    .getByRole("button", { name: "栖栖猫来信 A Cat Letter 模板", exact: true })
    .click();
  await expect(page.locator(".resume-page").first()).toHaveClass(
    /design-cat-letter.*panel-tape.*surface-letter.*cartoon-document/,
  );
  await expect(
    page.locator(".resume-page .identity-mascot.art-cat"),
  ).toHaveCount(1);
  await page.screenshot({
    path: "test-results/cartoon-desktop.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test("mouse drag reorders within and across sections and adjusts indentation", async ({
  page,
}) => {
  await page.goto("/");
  const units = page.locator('.resume-page [data-edit-section="experience"]');
  const sourceId = await units.first().getAttribute("data-edit-unit");
  const source = page.locator(`.resume-page [data-edit-unit="${sourceId}"]`);
  await source.hover();
  const handle = await source.locator(".preview-drag-handle").boundingBox();
  const target = await units.nth(1).boundingBox();
  await page.mouse.move(handle!.x + 12, handle!.y + 12);
  await page.mouse.down();
  await page.mouse.move(target!.x + 80, target!.y + target!.height - 5, {
    steps: 12,
  });
  await page.mouse.up();
  await expect(units.first().locator("h3")).toHaveText("产品设计师");
  await source.hover();
  const movedHandle = await source
    .locator(".preview-drag-handle")
    .boundingBox();
  await page.mouse.move(movedHandle!.x + 12, movedHandle!.y + 12);
  await page.mouse.down();
  await page.mouse.move(movedHandle!.x + 42, movedHandle!.y + 12, {
    steps: 10,
  });
  await page.mouse.up();
  expect(
    await source
      .locator(".component-layout")
      .evaluate((el) => parseFloat(getComputedStyle(el).marginLeft)),
  ).toBeGreaterThan(0);
  const about = page.locator('.resume-page [data-edit-section="about"]');
  const aboutBox = await about.boundingBox();
  await source.hover();
  const lastHandle = await source.locator(".preview-drag-handle").boundingBox();
  await page.mouse.move(lastHandle!.x + 12, lastHandle!.y + 12);
  await page.mouse.down();
  await page.mouse.move(aboutBox!.x + 50, aboutBox!.y + aboutBox!.height - 4, {
    steps: 12,
  });
  await page.mouse.up();
  await expect(
    page.locator(
      `.resume-page [data-edit-section="about"][data-edit-unit="${sourceId}"]`,
    ),
  ).toHaveCount(1);
  await page
    .getByRole("button", { name: "撤销 (Ctrl / ⌘ Z)", exact: true })
    .click();
  await expect(source).toHaveAttribute("data-edit-section", "experience");
});

test("mobile touch editing and pointer dragging, readable inputs and no horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByLabel("姓名", { exact: true })).toHaveCSS(
    "font-size",
    "16px",
  );
  await page
    .locator(".mobile-nav")
    .getByRole("button", { name: "预览", exact: true })
    .click();
  const source = page
    .locator('.resume-page [data-edit-section="experience"]')
    .first();
  const sourceId = await source.getAttribute("data-edit-unit");
  await page.getByRole("button", { name: "排版", exact: true }).click();
  await source.locator(".component-edit-target").click();
  const target = page
    .locator('.resume-page [data-edit-section="experience"]')
    .nth(1);
  const targetRect = await target.boundingBox();
  const handle = source.locator(".preview-drag-handle");
  const handleRect = await handle.boundingBox();
  await handle.dispatchEvent("pointerdown", {
    button: 0,
    pointerId: 9,
    pointerType: "touch",
    clientX: handleRect!.x + 12,
    clientY: handleRect!.y + 12,
    bubbles: true,
  });
  await page.evaluate(
    ({ x, y }) => {
      document.dispatchEvent(
        new PointerEvent("pointermove", {
          pointerId: 9,
          pointerType: "touch",
          clientX: x,
          clientY: y,
          bubbles: true,
          cancelable: true,
        }),
      );
      document.dispatchEvent(
        new PointerEvent("pointerup", {
          pointerId: 9,
          pointerType: "touch",
          clientX: x,
          clientY: y,
          bubbles: true,
        }),
      );
    },
    { x: targetRect!.x + 60, y: targetRect!.y + targetRect!.height - 3 },
  );
  await expect(
    page.locator('.resume-page [data-edit-section="experience"]').last(),
  ).toHaveAttribute("data-edit-unit", sourceId!);
  await page.getByRole("button", { name: "完成排版", exact: true }).click();
  await page
    .getByRole("button", { name: "编辑组件：资深产品设计师", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByLabel("标题 / 名称", { exact: true })
    .fill("移动端编辑成功");
  await page.getByRole("button", { name: "完成编辑", exact: true }).click();
  await expect(
    page.locator(".resume-page h3").filter({ hasText: "移动端编辑成功" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/mobile-direct-edit.png",
    fullPage: true,
  });
});

test("PDF preferences remove both watermarks and export chosen page, quality and filename", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "导出 PDF / ATS", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("switch", { name: "Birchify 品牌水印", exact: true })
    .click();
  await dialog.getByRole("switch", { name: "底部页码", exact: true }).click();
  await dialog.getByRole("switch", { name: "纸张背景", exact: true }).click();
  await dialog
    .getByLabel("导出文件名", { exact: true })
    .fill("我的设计简历.pdf");
  await dialog.getByLabel("导出清晰度", { exact: true }).selectOption("1.5");
  await dialog.getByLabel("导出范围", { exact: true }).selectOption("current");
  await expect(page.locator(".resume-page .paper-brand")).toHaveCount(0);
  await expect(
    page.locator(".resume-page .paper-watermark").first(),
  ).toHaveText("");
  await expect(
    page.locator(".resume-page .paper-page-number").first(),
  ).toHaveText("");
  await expect(page.locator(".resume-page").first()).toHaveCSS(
    "background-color",
    "rgb(255, 255, 255)",
  );
  const downloadPromise = page.waitForEvent("download");
  await dialog.getByRole("button", { name: /^开始导出/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("我的设计简历.pdf");
  await download.saveAs("test-results/no-watermarks.pdf");
  const pdf = readFileSync("test-results/no-watermarks.pdf").toString("latin1");
  expect(pdf.startsWith("%PDF")).toBe(true);
  expect(pdf.match(/\/Type \/Page\b/g)?.length).toBe(1);
  expect(pdf).toContain("/Width 1191");
  await expect(page.locator(".save-status")).toContainText("已保存");
  await page.reload();
  await page.getByRole("button", { name: "导出 PDF / ATS", exact: true }).click();
  await expect(
    page.getByRole("switch", { name: "Birchify 品牌水印", exact: true }),
  ).toHaveAttribute("aria-checked", "false");
  await expect(page.getByLabel("导出文件名", { exact: true })).toHaveValue(
    "我的设计简历.pdf",
  );
});
