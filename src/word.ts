import {
  AlignmentType, Document, ExternalHyperlink, HorizontalPositionRelativeFrom,
  ImageRun, LineRuleType, Packer, Paragraph, TextRun, TextWrappingType,
  VerticalPositionRelativeFrom, type ParagraphChild,
} from "docx";
import { ShapeRun } from "docx/shapes";
import { fontFor } from "./fonts";
import { captureResumePage, PAPER_HEIGHT, PAPER_WIDTH, withExportPages } from "./exportCapture";
import type { ResumeData } from "./types";

const PAGE_DXA = { width: 11906, height: 16838 };
const xPt = PAGE_DXA.width / PAPER_WIDTH / 20;
const yPt = PAGE_DXA.height / PAPER_HEIGHT / 20;
const emu = (pixels: number, vertical = false) => Math.round(pixels * (vertical ? yPt : xPt) * 12700);
const bytes = (canvas: HTMLCanvasElement) => Uint8Array.from(atob(canvas.toDataURL("image/png").split(",")[1]), c => c.charCodeAt(0));

export interface WordTextLine {
  text: string; x: number; y: number; width: number; height: number;
  font: string; fontSize: number; color: string; bold: boolean; italics: boolean;
  letterSpacing: number; underline: boolean; link?: string;
}

function safeLink(value: string | null): string | undefined {
  if (!value) return;
  try {
    const url = new URL(value);
    if (["https:", "http:", "mailto:", "tel:"].includes(url.protocol)) return url.href;
  } catch { /* Unsupported links remain plain editable text. */ }
}

// A separate native text layer, measured from the real browser layout. This keeps
// columns and custom positions instead of flattening everything into one column.
// Named design override: the user's template is the design authority (A4, fixed
// browser pagination, zero margins, per-line font/color/position, no flowing text).
export function measureWordText(page: HTMLElement, data: ResumeData): WordTextLine[] {
  const pageRect = page.getBoundingClientRect(), scale = pageRect.width / PAPER_WIDTH;
  const walker = document.createTreeWalker(page, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  const lines: WordTextLine[] = [];
  const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  for (const node of nodes) {
    const parent = node.parentElement;
    if (!parent || !node.textContent?.trim() ||
      parent.closest("svg,[data-html2canvas-ignore],.paper-brand,.paper-footer,.identity-art,.resume-eyebrow,.name-dot,.quotation-mark,.paper-image-placeholder")) continue;
    const css = getComputedStyle(parent);
    if (css.visibility !== "visible" || css.display === "none" || Number(css.opacity) === 0) continue;
    const colorParts = css.color.match(/[\d.]+/g)?.map(Number);
    if (!colorParts || (colorParts.length > 3 && colorParts[3] === 0)) continue;
    const color = colorParts.slice(0, 3).map(v => Math.round(v).toString(16).padStart(2, "0")).join("");
    const common = {
      font: data.font === "sans" ? "Microsoft YaHei" : fontFor(data.font).family,
      fontSize: parseFloat(css.fontSize), color, bold: Number(css.fontWeight) >= 600,
      italics: css.fontStyle === "italic", letterSpacing: parseFloat(css.letterSpacing) || 0,
      underline: css.textDecorationLine.includes("underline"),
      link: safeLink(parent.closest("a")?.getAttribute("href") || null),
    };
    const range = document.createRange();
    let current: WordTextLine | undefined;
    for (const { segment, index } of segmenter.segment(node.data)) {
      range.setStart(node, index); range.setEnd(node, index + segment.length);
      const rect = range.getBoundingClientRect();
      if (rect.width < .01 || rect.height < .01) continue;
      const x = (rect.left - pageRect.left) / scale, y = (rect.top - pageRect.top) / scale;
      if (y < 0 || y + rect.height / scale > PAPER_HEIGHT + 1) continue;
      const text = css.textTransform === "uppercase" ? segment.toUpperCase() : css.textTransform === "lowercase" ? segment.toLowerCase() : segment;
      if (current && Math.abs(current.y - y) < 1 && x >= current.x - .5) {
        current.text += text;
        current.width = Math.max(current.width, x + rect.width / scale - current.x);
      } else {
        current = { ...common, text, x, y, width: rect.width / scale, height: rect.height / scale };
        lines.push(current);
      }
    }
    // The wrapper inherits all styles and changes no geometry. It is only used to
    // hide precisely these text nodes in the graphics layer's cloned DOM.
    if (current) {
      const marker = document.createElement("span"); marker.dataset.wordText = "true";
      node.replaceWith(marker); marker.append(node);
    }
  }
  return lines;
}

function editableLine(line: WordTextLine) {
  const text = new TextRun({
    text: line.text, font: line.font, size: Math.max(2, Math.round(line.fontSize * xPt * 2)),
    color: line.color, bold: line.bold, italics: line.italics,
    underline: line.underline ? {} : undefined,
    characterSpacing: Math.round(line.letterSpacing * xPt * 20),
    // Constrain the initial width to the browser line; editing remains possible.
    fitText: { width: Math.max(1, Math.round(line.width * xPt * 20)) },
  });
  return new ShapeRun({
    type: "rectangle", fill: "none", line: "none",
    transformation: { width: Math.max(1, line.width * xPt / .75 + 2), height: (line.height + 3) * yPt / .75 },
    floating: {
      horizontalPosition: { relative: HorizontalPositionRelativeFrom.PAGE, offset: emu(line.x) },
      verticalPosition: { relative: VerticalPositionRelativeFrom.PAGE, offset: emu(line.y, true) },
      allowOverlap: true, layoutInCell: false, lockAnchor: true, zIndex: 2,
      wrap: { type: TextWrappingType.NONE },
    },
    textOptions: { verticalAlignment: "top", margins: { top: 0, right: 0, bottom: 0, left: 0 }, wrap: false },
    children: [new Paragraph({
      children: [line.link ? new ExternalHyperlink({ link: line.link, children: [text] }) : text],
      alignment: AlignmentType.LEFT, spacing: { before: 0, after: 0, line: Math.round(line.height * yPt * 20), lineRule: LineRuleType.EXACT },
      indent: { left: 0, right: 0, firstLine: 0 }, widowControl: false,
    })],
  });
}

// Default = complete visual pages, never a lossy component-by-component rewrite.
// Optional editable mode = the same graphics layer plus native positioned text.
// Textboxes are editable by line, not a reflowing/ATS-oriented Word document.
export async function buildWordBlob(data: ResumeData, onProgress: (n: number) => void = () => {}, currentPage = 1) {
  onProgress(2);
  return withExportPages(data, async allPages => {
    const settings = data.exportSettings, editable = settings.wordMode === "editable";
    const pages = settings.pages === "current" ? allPages.slice(Math.max(0, currentPage - 1), currentPage) : allPages;
    if (!pages.length) throw new Error("所选页面不存在，请重新选择导出范围。");
    const children: Paragraph[] = [];
    for (let index = 0; index < pages.length; index++) {
      const page = pages[index];
      const text = editable ? measureWordText(page, data) : [];
      const canvas = await captureResumePage(page, settings.quality, editable);
      const elements: ParagraphChild[] = [new ImageRun({
        type: "png", data: bytes(canvas),
        transformation: { width: PAGE_DXA.width / 15, height: PAGE_DXA.height / 15 },
        floating: {
          horizontalPosition: { relative: HorizontalPositionRelativeFrom.PAGE, offset: 0 },
          verticalPosition: { relative: VerticalPositionRelativeFrom.PAGE, offset: 0 },
          allowOverlap: true, layoutInCell: false, lockAnchor: true, behindDocument: true, zIndex: 0,
          wrap: { type: TextWrappingType.NONE },
        },
        altText: {
          name: `Resume page ${allPages.indexOf(page) + 1}`,
          title: editable ? "简历图形层" : "完整保真简历页面",
          description: editable ? "保留模板背景、图标、照片、进度条与装饰；文字在可编辑文本框中。" : "包含全部可见组件、图标、照片、进度条、模板装饰及页面文字。",
        },
      }), ...text.map(editableLine)];
      children.push(new Paragraph({
        children: elements, pageBreakBefore: index > 0,
        spacing: { before: 0, after: 0, line: 20, lineRule: LineRuleType.EXACT },
        run: { size: 2 }, widowControl: false,
      }));
      // Release each large capture before processing the next page (mobile RAM).
      canvas.width = 1; canvas.height = 1;
      onProgress(5 + Math.round((index + 1) / pages.length * 85));
    }
    const doc = new Document({
      creator: data.name || "", title: data.name ? `${data.name} · 简历` : "简历",
      description: editable ? "图文分层简历：文字按行可编辑，图形保留页面设计。" : "完整保真简历：页面以高清图像嵌入。",
      styles: { default: { document: {
        run: { font: fontFor(data.font).family, size: 2 },
        paragraph: { spacing: { before: 0, after: 0, line: 20, lineRule: LineRuleType.EXACT } },
      } } },
      sections: [{ properties: { page: {
        size: PAGE_DXA, margin: { top: 0, bottom: 0, left: 0, right: 0, header: 0, footer: 0 },
      } }, children }],
    });
    const blob = await Packer.toBlob(doc); onProgress(100); return blob;
  });
}

export async function exportWord(data: ResumeData, onProgress: (n: number) => void, currentPage = 1) {
  const blob = await buildWordBlob(data, onProgress, currentPage), url = URL.createObjectURL(blob);
  const name = (data.exportSettings.fileName.trim().replace(/\.(pdf|docx)$/i, "") || `${data.name || "我的简历"}_Birchify`)
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "").slice(0, 100) || "我的简历";
  const a = document.createElement("a"); a.href = url; a.download = `${name}.docx`; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
