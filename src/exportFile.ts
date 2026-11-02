import type { ResumeData } from "./types";

export function exportFileName(data: ResumeData) {
  const fallback = `${data.name || "我的简历"}_${data.exportSettings.format === "ats" ? "ATS" : "Birchify"}`;
  // Strip legacy extensions too, so imported backups never produce .docx.pdf.
  const name = (data.exportSettings.fileName.trim().replace(/\.(pdf|docx|txt|json)$/i, "") || fallback)
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "").slice(0, 100).trim() || "我的简历";
  return `${name}.pdf`;
}
