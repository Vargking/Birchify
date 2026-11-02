import { test, expect } from "@playwright/test";
import { fontOptions } from "../src/fonts";

for (const size of [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 844, height: 390 },
  { width: 1440, height: 900 },
]) {
  test(`font cards and tutorial keep their insets at ${size.width}x${size.height}`, async ({ page }) => {
    await page.setViewportSize(size);
    await page.goto("/");
    if (size.width <= 760) {
      await page.locator(".mobile-nav").getByRole("button", { name: "样式", exact: true }).click();
    } else {
      await page.getByRole("tab", { name: "样式", exact: true }).click();
    }
    const cards = page.locator(".font-options > button");
    await expect(cards).toHaveCount(fontOptions.length);
    const geometry = await page.locator(".font-options").evaluate(el => {
      const bounds = el.getBoundingClientRect();
      const cards = [...el.querySelectorAll<HTMLButtonElement>("button")];
      return {
        rows: new Set(cards.map(button => Math.round(button.getBoundingClientRect().top))).size,
        fits: cards.every(button => {
          const rect = button.getBoundingClientRect(), label = button.querySelector("span")!;
          return rect.left >= bounds.left - 1 && rect.right <= bounds.right + 1 &&
            button.scrollWidth <= button.clientWidth + 1 && label.scrollWidth <= label.clientWidth + 1 &&
            rect.width >= 100 && rect.height >= 100;
        }),
      };
    });
    expect(geometry.rows).toBeGreaterThan(1);
    expect(geometry.fits).toBe(true);
    await expect(cards.first().locator("span")).toHaveCSS("font-size", "14px");
    await expect(cards.first()).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("link", { name: "查看字体许可" })).toHaveAttribute("href", "/font-licenses.txt");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

    await page.getByRole("button", { name: "更多简历操作", exact: true }).click();
    await page.getByRole("button", { name: "重新查看教程", exact: true }).click();
    const dialog = page.getByRole("dialog");
    for (let step = 0; step < 4; step++) {
      // Inspect the finished layout rather than an intermediate spring-animation frame.
      await expect(dialog).toBeVisible();
      await page.emulateMedia({ reducedMotion: "reduce" });
      await dialog.evaluate(el => { el.scrollTop = el.scrollHeight; });
      const metrics = await dialog.evaluate(el => {
        const box = el.getBoundingClientRect(), actions = el.querySelector(".tour-actions")!.getBoundingClientRect();
        const buttons = [...el.querySelectorAll<HTMLButtonElement>(".tour-actions button")];
        return {
          horizontal: actions.left - box.left >= 18 && box.right - actions.right >= 18,
          bottom: box.bottom - actions.bottom,
          contained: box.top >= -1 && box.bottom <= innerHeight + 1 && box.left >= 0 && box.right <= innerWidth,
          overflow: el.scrollWidth > el.clientWidth + 1,
          buttonsFit: buttons.every(button => button.scrollWidth <= button.clientWidth + 1 && button.offsetHeight >= 44),
        };
      });
      expect(metrics.horizontal).toBe(true);
      expect(metrics.bottom).toBeGreaterThanOrEqual(20);
      expect(metrics.contained).toBe(true);
      expect(metrics.overflow).toBe(false);
      expect(metrics.buttonsFit).toBe(true);
      if (step < 3) await dialog.getByRole("button", { name: "下一步", exact: true }).click();
    }
    await dialog.getByRole("button", { name: "开始创作", exact: true }).click();
    await page.getByRole("button", { name: "导出 PDF / ATS", exact: true }).click();
    const exporting = page.getByRole("dialog");
    await expect(exporting.getByRole("button", { name: /开始导出/ })).toBeAttached();
    expect(await exporting.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    await exporting.getByRole("button", { name: "关闭弹窗", exact: true }).click();
  });
}
