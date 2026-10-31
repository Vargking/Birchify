import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

test.describe("loading screen", () => {
  test.use({ javaScriptEnabled: false });

  test("shows user-facing copy without local development instructions", async ({
    page,
  }) => {
    await page.goto("/");
    const loadingScreen = page.locator("#root");
    await expect(
      loadingScreen.getByRole("heading", { name: /正在打开 Birchify/ }),
    ).toBeVisible();
    await expect(loadingScreen).toContainText(
      "正在准备你的简历工作室，请稍候…",
    );
    await expect(loadingScreen).not.toContainText(
      /localhost|127\.0\.0\.1|npm\s+run|项目目录|HTML/,
    );
    await expect(loadingScreen.locator("a, code")).toHaveCount(0);
  });
});

test("desktop renders without runtime errors and only uses local resources", async ({
  page,
}) => {
  const errors: string[] = [];
  const remote: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (
      !request.url().startsWith("http://localhost:5173") &&
      !request.url().startsWith("data:")
    )
      remote.push(request.url());
  });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "把故事，慢慢写好" }),
  ).toBeVisible();
  await expect(page.locator(".resume-page").first()).toBeVisible();
  await expect(page.locator(".resume-page h1").first()).toContainText("林予安");
  await page.screenshot({ path: "test-results/desktop.png", fullPage: true });
  expect(errors).toEqual([]);
  expect(remote).toEqual([]);
});

for (const width of [1440, 320]) {
  test(`author credit is visible at ${width}px and stays outside the resume`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width === 320 ? 740 : 1000 });
    await page.goto("/");
    const credit = page.locator(".editor-scroll > .author-credit");
    await expect(credit).toBeVisible();
    await expect(credit).toHaveText("作者 Vargking");
    await expect(credit).toHaveCSS("font-size", "14px");
    await expect(
      page.locator(".resume-document").filter({ hasText: "Vargking" }),
    ).toHaveCount(0);
    await page.getByRole("button", { name: "更多简历操作", exact: true }).click();
    await page.getByRole("button", { name: "使用与隐私说明", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "你的故事，只属于你。" });
    await expect(dialog.locator(".author-credit")).toBeVisible();
    await expect(dialog.locator(".author-credit")).toHaveText("作者 Vargking");
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    ).toBe(true);
  });
}

test("personal details persist, undo/redo work, photo uploads and changes shape", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("姓名", { exact: true }).fill("陈知夏");
  await expect(page.locator(".resume-page h1")).toContainText("陈知夏");
  await expect(page.locator(".save-status")).toContainText(
    "所有更改已保存到本机",
  );
  await page.reload();
  await expect(page.getByLabel("姓名", { exact: true })).toHaveValue("陈知夏");
  await page.getByLabel("所在城市", { exact: true }).fill("杭州，中国");
  await page
    .getByRole("button", { name: "撤销 (Ctrl / ⌘ Z)", exact: true })
    .click();
  await expect(page.getByLabel("所在城市", { exact: true })).toHaveValue(
    "上海，中国",
  );
  await page
    .getByRole("button", { name: "重做 (Ctrl / ⌘ Shift Z)", exact: true })
    .click();
  await expect(page.getByLabel("所在城市", { exact: true })).toHaveValue(
    "杭州，中国",
  );
  await page
    .locator(".photo-row input")
    .setInputFiles({
      name: "portrait.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+y/2sAAAAASUVORK5CYII=",
        "base64",
      ),
    });
  await expect(page.locator(".resume-page .resume-photo")).toBeVisible();
  await page.getByLabel("照片形状").selectOption("circle");
  await expect(page.locator(".resume-page .resume-photo")).toHaveClass(
    /photo-circle/,
  );
});

test("74 designs plus a blank template and template-following backgrounds apply and filter correctly", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "模板", exact: true }).click();
  await expect(page.locator(".template-option")).toHaveCount(75);
  await page
    .getByRole("button", { name: "午夜 Midnight 模板", exact: true })
    .click();
  await expect(page.locator(".resume-page").first()).toHaveClass(
    /design-midnight.*flow-right.*header-banner/,
  );
  await page
    .locator(".filter-tabs")
    .getByRole("button", { name: "创意" })
    .click();
  await expect(page.locator(".template-option")).toHaveCount(10);
  await page.getByRole("tab", { name: "样式", exact: true }).click();
  await expect(page.locator(".background-option")).toHaveCount(21);
  await page.getByRole("button", { name: "背景：晨曦", exact: true }).click();
  await expect(page.locator(".resume-page").first()).toHaveCSS(
    "background-image",
    /linear-gradient/,
  );
  await page.screenshot({ path: "test-results/styles.png", fullPage: true });
});

test("components customize, duplicate, reorder and long content auto-paginates", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator(".section-toggle").filter({ hasText: "关于我" }).click();
  await page.getByRole("button", { name: "添加组件", exact: true }).click();
  await page
    .locator(".component-catalog")
    .getByRole("button", { name: /熟练程度/ })
    .click();
  await page
    .locator(".component-editor-header")
    .filter({ hasText: "新技能" })
    .click();
  await page.getByLabel("标题 / 名称", { exact: true }).fill("TypeScript");
  await page.getByLabel("展示风格", { exact: true }).selectOption("circle");
  await expect(page.locator(".resume-page .progress-circle")).toBeVisible();
  await page.getByRole("button", { name: "复制组件", exact: true }).click();
  await expect(page.locator(".resume-page .progress-circle")).toHaveCount(2);
  await page.getByRole("button", { name: "下移组件", exact: true }).click();
  await page.getByRole("button", { name: "删除组件", exact: true }).click();
  await expect(page.locator(".resume-page .progress-circle")).toHaveCount(1);
  await page.locator(".component-editor-header").first().click();
  await page
    .getByLabel("详细描述", { exact: true })
    .fill(
      "以用户为中心的产品设计，探索每一个细节，连接业务目标与用户需求，构建完整的品牌语言与体验。".repeat(
        100,
      ),
    );
  await expect
    .poll(() => page.locator(".resume-page").count())
    .toBeGreaterThan(2);
  const pageCount = await page.locator(".resume-page").count();
  await expect(page.locator(".paper-footer").last()).toContainText(
    String(pageCount).padStart(2, "0"),
  );
  const overflows = await page.locator(".resume-page").evaluateAll((pages) =>
    pages.map((page) => {
      const content = page
        .querySelector(".page-content")!
        .getBoundingClientRect();
      const footer = page
        .querySelector(".paper-footer")!
        .getBoundingClientRect();
      return content.bottom > footer.top - 5;
    }),
  );
  expect(overflows).not.toContain(true);
  await page.screenshot({ path: "test-results/multipage.png", fullPage: true });
});

test("mobile navigation, no horizontal viewport overflow, and PDF export download", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.screenshot({
    path: "test-results/mobile-edit.png",
    fullPage: true,
  });
  await expect(page.locator(".mobile-nav")).toBeVisible();
  await page
    .locator(".mobile-nav")
    .getByRole("button", { name: "模板", exact: true })
    .click();
  await expect(page.locator(".template-option")).toHaveCount(75);
  await page
    .locator(".mobile-nav")
    .getByRole("button", { name: "样式", exact: true })
    .click();
  await expect(page.locator(".background-option")).toHaveCount(21);
  await page
    .locator(".mobile-nav")
    .getByRole("button", { name: "预览", exact: true })
    .click();
  await expect(page.locator(".resume-page").first()).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/mobile-preview.png",
    fullPage: true,
  });
  const pageCount = await page.locator(".resume-page").count();
  await page.getByRole("button", { name: "导出 PDF", exact: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /^开始导出/ }).click();
  const download = await downloadPromise;
  await download.saveAs("test-results/resume.pdf");
  const pdf = readFileSync("test-results/resume.pdf");
  expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
  expect(pdf.length).toBeGreaterThan(20000);
  expect(pdf.toString("latin1").match(/\/Type \/Page\b/g)?.length).toBe(
    pageCount,
  );
  await expect(page.locator(".export-dialog")).toHaveCount(0);
});

test("JSON backup imports safely and reset is recoverable", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "更多简历操作", exact: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "下载 JSON 备份", exact: true })
    .click();
  const download = await downloadPromise;
  await download.saveAs("test-results/backup.json");
  await page.getByLabel("姓名", { exact: true }).fill("修改后");
  await page
    .locator('input[accept="application/json,.json"]')
    .setInputFiles("test-results/backup.json");
  await expect(page.getByLabel("姓名", { exact: true })).toHaveValue("林予安");
  await page
    .locator('input[accept="application/json,.json"]')
    .setInputFiles({
      name: "broken.json",
      mimeType: "application/json",
      buffer: Buffer.from('{"version":1,"name":"bad","sections":[null]}'),
    });
  await expect(page.locator(".toast")).toContainText("栏目数据不完整");
  await expect(page.getByLabel("姓名", { exact: true })).toHaveValue("林予安");
});
