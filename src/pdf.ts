import { jsPDF } from "jspdf";
import { captureResumePage, withExportPages } from "./exportCapture";
import { exportFileName } from "./exportFile";
import type { ResumeData } from "./types";

export async function buildPDF(
  data: ResumeData,
  onProgress: (progress: number) => void = () => {},
  currentPage = 1,
) {
  return withExportPages(data, async allPages => {
    const settings = data.exportSettings;
    const pages = settings.pages === "current" ? allPages.slice(currentPage - 1, currentPage) : allPages;
    if (!pages.length) throw new Error("所选页面不存在，请重新选择导出范围。");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
    pdf.setProperties({ title: data.name ? `${data.name}的简历` : "个人简历", subject: "Personal résumé", creator: "Birchify" });
    for (let i = 0; i < pages.length; i++) {
      onProgress(Math.round(i / pages.length * 90) + 5);
      const canvas = await captureResumePage(pages[i], settings.quality);
      try {
        if (i > 0) pdf.addPage();
        pdf.addImage(canvas.toDataURL("image/jpeg", .98), "JPEG", 0, 0, 210, 297, undefined, "FAST");
      } finally {
        canvas.width = canvas.height = 1;
      }
    }
    onProgress(100);
    return pdf;
  });
}

export async function exportPDF(data: ResumeData, onProgress: (progress: number) => void, currentPage = 1) {
  const pdf = await buildPDF(data, onProgress, currentPage);
  pdf.save(exportFileName(data));
}
