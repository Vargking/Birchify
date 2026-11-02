import { jsPDF } from "jspdf";
import { exportFileName } from "./exportFile";
import type { ResumeComponent, ResumeData } from "./types";

interface Block {
  text: string;
  size: number;
  before: number;
  after: number;
  keepNext?: boolean;
  url?: string;
}
interface Line {
  text: string;
  size: number;
  height: number;
  before: number;
  after: number;
  keepNext: boolean;
  url?: string;
}

const FONT = "BirchifyATS";
const MARGIN = 48;
const BODY_SIZE = 10.5;
const normalize = (text: string) => text.normalize("NFC").replace(/\r\n?/g, "\n")
  .replace(/\t/g, "    ").replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "");

// The font is served by this site (including GitHub Pages subpaths), not a CDN.
let fontPromise: Promise<string> | undefined;
function loadATSFont() {
  if (!fontPromise) {
    fontPromise = fetch(`${import.meta.env.BASE_URL}fonts/BirchifyATS-Regular.ttf`).then(async response => {
      if (!response.ok) throw new Error("ATS 中文字体加载失败，请确认站点已完整部署后重试。");
      const bytes = new Uint8Array(await response.arrayBuffer());
      let binary = "";
      for (let start = 0; start < bytes.length; start += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(start, start + 0x8000));
      }
      return btoa(binary);
    }).catch(error => {
      fontPromise = undefined;
      throw error;
    });
  }
  return fontPromise;
}

function webLink(value: string) {
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`);
    return ["https:", "http:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

function componentBlocks(item: ResumeComponent): Block[] {
  if (item.type === "divider" || item.type === "spacer") return [];
  const title = item.type === "progress"
    ? `${item.title || "技能"}: ${item.value}%`
    : item.type === "tags"
      ? item.title.split(/[,，\n]/).map(tag => tag.trim()).filter(Boolean).join(", ")
      : item.title;
  const blocks: Block[] = [];
  if (title) blocks.push({ text: title, size: 11.5, before: 6, after: 2, keepNext: true });
  if (item.date) blocks.push({ text: item.date, size: BODY_SIZE, before: 0, after: 2, keepNext: true });
  if (item.subtitle) blocks.push({ text: item.subtitle, size: BODY_SIZE, before: 0, after: 2, keepNext: true });
  if (item.description) blocks.push({ text: item.description, size: BODY_SIZE, before: 0, after: 4,
    url: item.type === "links" ? webLink(item.description.trim()) : undefined });
  if (blocks.length) blocks[blocks.length - 1].keepNext = false;
  return blocks;
}

function resumeBlocks(data: ResumeData): Block[] {
  const blocks: Block[] = [];
  const add = (text: string, size = BODY_SIZE, url?: string) => {
    if (text.trim()) blocks.push({ text, size, before: 0, after: size > BODY_SIZE ? 6 : 3, url });
  };
  add(data.name, 25);
  add(data.role, 13);
  add(data.email ? `邮箱 / Email: ${data.email}` : "", BODY_SIZE, data.email ? `mailto:${data.email}` : undefined);
  add(data.phone ? `电话 / Phone: ${data.phone}` : "");
  add(data.location ? `所在地 / Location: ${data.location}` : "");
  add(data.website ? `网站 / Website: ${data.website}` : "", BODY_SIZE, webLink(data.website.trim()));
  for (const section of data.sections.filter(section => section.visible)) {
    const content = section.components.flatMap(componentBlocks);
    if (section.title.trim()) blocks.push({ text: section.title, size: 14, before: 15, after: 5, keepNext: true });
    if (section.subtitle.trim()) blocks.push({ text: section.subtitle, size: 10, before: 0, after: 4, keepNext: true });
    blocks.push(...content);
    // An empty section must not be kept with an unrelated following section.
    if (blocks.length) blocks[blocks.length - 1].keepNext = false;
  }
  return blocks.map(block => ({ ...block, text: normalize(block.text) }));
}

// Wrap in logical Unicode order, at word boundaries where possible. Long URLs,
// words, Chinese, manual line breaks and empty paragraphs all remain intact.
function wrapText(pdf: jsPDF, text: string, width: number) {
  const result: string[] = [];
  for (const paragraph of text.split("\n")) {
    if (!paragraph) { result.push(""); continue; }
    const characters = Array.from(paragraph);
    const widths = pdf.getCharWidthsArray(paragraph).map(value => value * pdf.getFontSize());
    let start = 0;
    while (start < characters.length) {
      let end = start, used = 0, boundary = -1;
      while (end < characters.length && used + widths[end] <= width) {
        used += widths[end];
        if (/\s/.test(characters[end])) boundary = end + 1;
        end++;
      }
      if (end === start) end++;
      if (end < characters.length && boundary > start &&
          /[\x21-\x7e]/.test(characters[end - 1]) && /[\x21-\x7e]/.test(characters[end])) end = boundary;
      result.push(characters.slice(start, end).join(""));
      start = end;
    }
  }
  return result;
}

export async function buildATSPDF(data: ResumeData, onProgress: (progress: number) => void = () => {}) {
  onProgress(5);
  const font = await loadATSFont();
  onProgress(25);
  const pdf = new jsPDF({ unit: "pt", format: "a4", compress: true, putOnlyUsedFonts: true });
  pdf.addFileToVFS("BirchifyATS-Regular.ttf", font);
  pdf.addFont("BirchifyATS-Regular.ttf", FONT, "normal");
  pdf.setFont(FONT, "normal");
  pdf.setTextColor(24, 30, 28);
  pdf.setLanguage("zh-CN");
  pdf.setProperties({ title: data.name ? `${data.name}的简历` : "个人简历", subject: "ATS-friendly résumé", creator: "Birchify" });

  const blocks = resumeBlocks(data);
  const metadata = pdf.getFont().metadata as unknown as { characterToGlyph?: (code: number) => number };
  if (!metadata.characterToGlyph) throw new Error("ATS 字体文件无效，请确认站点的字体文件已完整部署。");
  const missing = Array.from(new Set(blocks.flatMap(block => Array.from(block.text))))
    .filter(character => !/\s/.test(character) &&
      (character.codePointAt(0)! > 0xffff || !metadata.characterToGlyph!(character.codePointAt(0)!)));
  if (missing.length) {
    throw new Error(`ATS 字体暂不支持这些字符：${missing.slice(0, 8).join(" ")}。请替换生僻字或表情后重试，或使用设计版 PDF；不会静默丢失内容。`);
  }

  const width = pdf.internal.pageSize.getWidth() - MARGIN * 2;
  const bottom = pdf.internal.pageSize.getHeight() - MARGIN;
  const lines: Line[] = blocks.flatMap(block => {
    pdf.setFontSize(block.size);
    const wrapped = wrapText(pdf, block.text, width);
    return wrapped.map((text, index) => ({ text, size: block.size, height: block.size * 1.52,
      before: index === 0 ? block.before : 0, after: index === wrapped.length - 1 ? block.after : 0,
      keepNext: index < wrapped.length - 1 ? true : !!block.keepNext, url: block.url }));
  });
  let y = MARGIN;
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index], next = lines[index + 1];
    const following = line.keepNext && next ? next.height + next.before : 0;
    if (y > MARGIN && y + line.before + line.height + line.after + following > bottom) {
      pdf.addPage(); y = MARGIN;
    }
    if (y > MARGIN) y += line.before;
    pdf.setFontSize(line.size);
    // Native PDF text with an embedded font and ToUnicode mapping, not OCR,
    // hidden text behind a screenshot, floating text boxes or vector outlines.
    if (line.text) pdf.text(line.text, MARGIN, y + line.size);
    if (line.url && line.text.trim()) pdf.link(MARGIN, y, Math.min(width, pdf.getTextWidth(line.text)), line.height, { url: line.url });
    y += line.height + line.after;
    if (index % 80 === 0) {
      onProgress(30 + Math.round((index + 1) / lines.length * 65));
      await new Promise<void>(resolve => setTimeout(resolve, 0));
    }
  }
  onProgress(100);
  return pdf;
}

export async function exportATS(data: ResumeData, onProgress: (progress: number) => void) {
  const pdf = await buildATSPDF(data, onProgress);
  pdf.save(exportFileName(data));
}
