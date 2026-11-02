import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import html2canvas from "html2canvas";
import PagedResume from "./PagedResume";
import { loadFont } from "./fonts";
import type { ResumeData } from "./types";

export const PAPER_WIDTH = 794;
export const PAPER_HEIGHT = 1123;
const frame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
const noop = () => {};

// Render the supplied data, not a potentially zoomed, dragged or stale UI preview.
// The host is off screen, not display:none: pagination and font metrics must run.
export async function withExportPages<T>(data: ResumeData, action: (pages: HTMLElement[]) => Promise<T>) {
  const text = [data.name, data.role, data.email, data.phone, data.location, data.website,
    ...data.sections.filter(s => s.visible).flatMap(s => [s.title, s.subtitle,
      ...s.components.flatMap(c => [c.title, c.subtitle, c.description, c.date])])].join(" ");
  await loadFont(data.font, text);
  const host = document.createElement("div");
  host.dataset.exportHost = "true";
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = `position:absolute;left:-16000px;top:0;width:${PAPER_WIDTH}px;pointer-events:none;`;
  document.body.append(host);
  const root = createRoot(host);
  try {
    flushSync(() => root.render(<PagedResume data={data} editable={false} onPageCount={noop}
      onEdit={noop} onCommit={noop} onAddSection={noop} onAddComponent={noop}/>));
    await document.fonts.ready;
    await Promise.all(Array.from(host.querySelectorAll("img"), async img => {
      try { await img.decode(); } catch { throw new Error("简历中有图片载入失败，请重新上传后再导出。"); }
    }));
    // Allow font/image ResizeObserver measurements and React pagination to settle.
    await frame(); await frame(); await frame();
    const pages = Array.from(host.querySelectorAll<HTMLElement>("[data-pdf-page]"));
    if (!pages.length) throw new Error("简历页面尚未准备好，请稍后再试。");
    return await action(pages);
  } finally {
    root.unmount();
    host.remove();
  }
}

export async function captureResumePage(page: HTMLElement, quality: number) {
  return html2canvas(page, {
    scale: quality, width: PAPER_WIDTH, height: PAPER_HEIGHT,
    backgroundColor: "#fff", useCORS: true, logging: false,
    ignoreElements: el => (el.id === "root" && !el.contains(page)) ||
      el.matches(".resume-measure,.editor-pane,.topbar,.mobile-nav,.preview-toolbar,.preview-bottom,.preview-intro,.preview-end,.modal-backdrop,.export-overlay,.toast"),
    onclone: clone => {
      clone.querySelectorAll<HTMLElement>("[data-export-host]").forEach(el => {
        el.style.left = "0"; el.style.top = "0";
      });
      clone.querySelectorAll<HTMLElement>(".pages-stage").forEach(el => {
        el.style.transform = "none"; el.style.zoom = "1";
      });
      clone.querySelectorAll<HTMLElement>(".preview-scroll,.preview-pane,.app-layout,.pages-viewport").forEach(el => {
        el.style.overflow = "visible"; el.style.height = "auto";
      });
      clone.querySelectorAll<HTMLElement>("[data-pdf-page]").forEach(el => {
        el.style.boxShadow = "none"; el.style.borderRadius = "0"; el.style.transform = "none";
      });
      // SVG serialization must not lose CSS variables or inherited currentColor.
      clone.querySelectorAll<SVGElement>("[data-pdf-page] svg, [data-pdf-page] svg *").forEach(el => {
        const css = clone.defaultView!.getComputedStyle(el);
        for (const prop of ["color", "fill", "stroke"] as const) {
          const value = css.getPropertyValue(prop);
          if (value && !value.includes("url(")) el.style.setProperty(prop, value);
        }
      });
      clone.querySelectorAll(".preview-editable,.layout-selected,.preview-drop-before,.preview-drop-after").forEach(el => {
        el.classList.remove("preview-editable", "layout-selected", "preview-drop-before", "preview-drop-after");
      });
    },
  });
}
