import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import type { ExportSettings } from "./types";

export async function exportPDF(
  name: string,
  settings: ExportSettings,
  currentPage: number,
  onProgress: (progress: number) => void,
) {
  const allPages = Array.from(
    document.querySelectorAll<HTMLElement>("[data-pdf-page]"),
  );
  const pages =
    settings.pages === "current"
      ? allPages.slice(Math.max(0, currentPage - 1), currentPage)
      : allPages;
  if (!pages.length) throw new Error("简历预览尚未准备好，请稍后再试。");
  await document.fonts.ready;
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });
  pdf.setProperties({
    title: `${name}的简历`,
    subject: "Personal résumé",
    creator: "Birchify",
  });
  for (let i = 0; i < pages.length; i++) {
    onProgress(Math.round((i / pages.length) * 90) + 5);
    const canvas = await html2canvas(pages[i], {
      scale: settings.quality,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
      width: 794,
      height: 1123,
      // Do not clone the entire template gallery or studio chrome for each page.
      ignoreElements: (el) => el.matches(".editor-pane,.topbar,.mobile-nav,.preview-toolbar,.preview-bottom,.preview-intro,.preview-end,.modal-backdrop,.export-overlay,.toast,.resume-measure"),
      onclone: (clone) => {
        const stage = clone.querySelector<HTMLElement>(".pages-stage");
        if (stage) {
          stage.style.transform = "none";
          stage.style.zoom = "1";
        }
        clone
          .querySelectorAll<HTMLElement>(
            ".preview-scroll, .preview-pane, .app-layout, .pages-viewport",
          )
          .forEach((el) => {
            el.style.overflow = "visible";
            el.style.height = "auto";
          });
        clone.querySelectorAll<HTMLElement>("[data-pdf-page]").forEach((el) => {
          el.style.boxShadow = "none";
          el.style.borderRadius = "0";
          el.style.transform = "none";
        });
        // SVGs are serialized as separate images; preserve colors inherited from CSS.
        clone
          .querySelectorAll<SVGElement>("[data-pdf-page] svg")
          .forEach((svg) => {
            const color = clone.defaultView?.getComputedStyle(svg).color;
            if (color) svg.style.color = color;
          });
        clone
          .querySelectorAll(".preview-editable")
          .forEach((el) => el.classList.remove("preview-editable"));
        clone
          .querySelectorAll<HTMLElement>(
            ".identity-edit-target, .component-edit-target",
          )
          .forEach((el) => {
            el.style.outline = "none";
            el.style.background = "none";
          });
        clone
          .querySelectorAll(".preview-drop-before, .preview-drop-after")
          .forEach((el) =>
            el.classList.remove("preview-drop-before", "preview-drop-after"),
          );
        clone.querySelectorAll(".layout-selected").forEach(el => el.classList.remove("layout-selected"));
        if (!settings.watermark) {
          clone.querySelectorAll(".paper-brand").forEach((el) => el.remove());
          clone.querySelectorAll(".paper-watermark").forEach((el) => {
            el.textContent = "";
          });
        }
        if (!settings.pageNumbers)
          clone.querySelectorAll(".paper-page-number").forEach((el) => {
            el.textContent = "";
          });
        if (!settings.background)
          clone
            .querySelectorAll<HTMLElement>("[data-pdf-page]")
            .forEach((el) => {
              el.style.background = "#fff";
            });
      },
    });
    if (i > 0) pdf.addPage();
    pdf.addImage(
      canvas.toDataURL("image/jpeg", 0.98),
      "JPEG",
      0,
      0,
      210,
      297,
      undefined,
      "FAST",
    );
  }
  onProgress(100);
  const filename =
    (
      settings.fileName.trim().replace(/\.(pdf|docx)$/i, "") ||
      `${name || "我的简历"}_Birchify`
    )
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, "")
      .slice(0, 100) || "我的简历";
  pdf.save(`${filename}.pdf`);
}
