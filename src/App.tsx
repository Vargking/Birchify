import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Check,
  CheckCheck,
  ChevronDown,
  CircleHelp,
  Command,
  Download,
  Ellipsis,
  Eye,
  FileCheck2,
  FileText,
  LayoutTemplate,
  Leaf,
  LoaderCircle,
  Maximize2,
  Minimize2,
  Minus,
  Palette,
  Plus,
  Redo2,
  RotateCcw,
  Trash2,
  ShieldCheck,
  Sparkles,
  Undo2,
  X,
} from "lucide-react";
import Editor, { type EditorTab } from "./Editor";
import ResumePreview, { PAGE_HEIGHT, PAGE_WIDTH } from "./ResumePreview";
import {
  componentCatalog,
  createComponent,
  createDefaultResume,
  createBlankResume,
  backgrounds,
  templates,
} from "./data";
import { BirchLogo, ComponentIcon } from "./icons";
import { IconButton, Modal } from "./ui";
import ExportDialog from "./ExportDialog";
import PreviewEditorDialog, { type EditingTarget } from "./PreviewEditorDialog";
import { iconLibrary } from "./IconLibrary";
import { uid, type ResumeData, type UpdateResume } from "./types";
import { usePreviewZoom } from "./usePreviewZoom";
import Onboarding, { needsTour, TOUR_KEY } from "./Onboarding";
import { fontOptions, loadFont } from "./fonts";

const STORAGE_KEY = "birchify-resume-v1";

function validateResume(input: unknown): ResumeData {
  if (!input || typeof input !== "object")
    throw new Error("这不是有效的 Birchify 简历文件");
  const raw = input as Record<string, unknown>;
  if (
    raw.version !== 1 ||
    !Array.isArray(raw.sections) ||
    raw.sections.length > 100 ||
    typeof raw.name !== "string"
  )
    throw new Error("文件格式不正确，请导入 Birchify 导出的 JSON 备份");
  const base = createDefaultResume();
  const text = (v: unknown, fallback = "", max = 160) =>
    typeof v === "string" ? v.slice(0, max) : fallback;
  const number = (v: unknown, fallback: number, min: number, max: number) =>
    typeof v === "number" && Number.isFinite(v)
      ? Math.max(min, Math.min(max, v))
      : fallback;
  const color = (v: unknown, fallback = "") =>
    typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v) ? v : fallback;
  const image = (v: unknown) =>
    typeof v === "string" &&
    /^data:image\/(png|jpeg|webp|gif);base64,/i.test(v) &&
    v.length < 7_000_000
      ? v
      : "";
  const settings =
    raw.exportSettings && typeof raw.exportSettings === "object"
      ? (raw.exportSettings as Record<string, unknown>)
      : {};
  return {
    ...base,
    name: text(raw.name),
    role: text(raw.role),
    email: text(raw.email),
    phone: text(raw.phone),
    location: text(raw.location),
    website: text(raw.website),
    photo: image(raw.photo),
    photoShape: ["rounded", "circle", "square"].includes(String(raw.photoShape))
      ? (raw.photoShape as ResumeData["photoShape"])
      : "rounded",
    template: templates.some((t) => t.id === raw.template)
      ? String(raw.template)
      : base.template,
    background: raw.background === "template" || backgrounds.some((b) => b.id === raw.background)
      ? String(raw.background)
      : base.background,
    accent: color(raw.accent, base.accent),
    font: fontOptions.some(f => f.value === raw.font)
      ? (raw.font as ResumeData["font"])
      : "sans",
    fontSize: number(raw.fontSize, 14, 10, 20),
    lineHeight: number(raw.lineHeight, 1.65, 1.3, 2.3),
    pagePadding: number(raw.pagePadding, 48, 32, 80),
    exportSettings: {
      format: settings.format === "ats" ? "ats" : "pdf",
      watermark: settings.watermark !== false,
      pageNumbers: settings.pageNumbers !== false,
      background: settings.background !== false,
      quality: [1.5, 2, 3].includes(Number(settings.quality))
        ? (Number(settings.quality) as 1.5 | 2 | 3)
        : 2,
      fileName: text(settings.fileName, "", 100),
      pages: settings.pages === "current" ? "current" : "all",
    },
    sections: raw.sections.map((s: unknown) => {
      if (!s || typeof s !== "object") throw new Error("栏目数据不完整");
      const section = s as Record<string, unknown>;
      if (!Array.isArray(section.components) || section.components.length > 200)
        throw new Error("栏目组件格式不正确或数量过多");
      return {
        id: uid(),
        title: text(section.title, "未命名栏目"),
        subtitle: text(section.subtitle),
        visible: section.visible !== false,
        components: section.components.map((c: unknown) => {
          if (!c || typeof c !== "object") throw new Error("组件数据不完整");
          const item = c as Record<string, unknown>;
          const catalog = componentCatalog.find((t) => t.type === item.type);
          if (!catalog) throw new Error("文件包含不支持的组件类型");
          return {
            ...createComponent(catalog.type),
            title: text(item.title, "", 160),
            subtitle: text(item.subtitle),
            description: text(item.description, "", 20000),
            date: text(item.date),
            value: number(
              item.value,
              85,
              0,
              catalog.type === "spacer" ? 300 : 100,
            ),
            style: catalog.styles.some((s) => s.value === item.style)
              ? String(item.style)
              : catalog.styles[0].value,
            color: color(item.color),
            fontSize: number(item.fontSize, 14, 10, 24),
            spacing: number(item.spacing, 14, 0, 48),
            align: ["left", "center", "right"].includes(String(item.align))
              ? (item.align as "left" | "center" | "right")
              : "left",
            bold: item.bold === true,
            image: image(item.image),
            icon: iconLibrary.some((i) => i.id === item.icon)
              ? String(item.icon)
              : "",
            iconStyle: ["line", "soft", "badge"].includes(
              String(item.iconStyle),
            )
              ? (item.iconStyle as "line" | "soft" | "badge")
              : "line",
            width: number(item.width, 100, 40, 100),
            indent: number(item.indent, 0, 0, 120),
          };
        }),
      };
    }),
  };
}

function loadResume() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return validateResume(JSON.parse(saved));
  } catch {
    /* A damaged backup never prevents opening the editor. */
  }
  return createDefaultResume();
}

export default function App() {
  const [history, setHistory] = useState(() => ({
    past: [] as ResumeData[],
    present: loadResume(),
    future: [] as ResumeData[],
  }));
  const data = history.present;
  const [editorDraft, setEditorDraft] = useState<ResumeData | null>(null);
  const [tab, setTab] = useState<EditorTab>("content");
  const [mobilePage, setMobilePage] = useState("edit");
  const [pageCount, setPageCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [saved, setSaved] = useState<"saving" | "saved" | "error">("saved");
  const [toastMessage, setToastMessage] = useState("");
  const [componentTarget, setComponentTarget] = useState<string | null>(null);
  const [modal, setModal] = useState<"help" | "reset" | "export" | "clear" | "blank" | "example" | null>(null);
  const [editingTarget, setEditingTarget] = useState<EditingTarget | null>(
    null,
  );
  const [previewEditable, setPreviewEditable] = useState(true);
  const [layoutMode, setLayoutMode] = useState(false);
  const [showTour, setShowTour] = useState(needsTour);
  const [menuOpen, setMenuOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [focused, setFocused] = useState(false);
  const [zoom, setZoom] = useState<number | null>(null);
  const [fitScale, setFitScale] = useState(0.72);
  const previewRef = useRef<HTMLDivElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const exportingRef = useRef(false);
  const toast = useCallback((message: string) => {
    clearTimeout(toastTimer.current);
    setToastMessage(message);
    toastTimer.current = setTimeout(() => setToastMessage(""), 3800);
  }, []);
  const update: UpdateResume = useCallback(
    (fn) =>
      setHistory((h) => ({
        past: [...h.past.slice(-59), h.present],
        present: fn(h.present),
        future: [],
      })),
    [],
  );

  useEffect(() => {
    let active = true;
    loadFont(data.font, [data.name, data.role, ...data.sections.flatMap(s => [s.title, ...s.components.flatMap(c => [c.title,c.subtitle,c.description])])].join(" ")).catch(() => { if (active) toast("字体载入失败，请重试或选择系统字体"); });
    return () => { active = false; };
  }, [data.font, data.name, data.role, data.sections, toast]);
  const undo = useCallback(
    () =>
      setHistory((h) =>
        h.past.length
          ? {
              past: h.past.slice(0, -1),
              present: h.past[h.past.length - 1],
              future: [h.present, ...h.future],
            }
          : h,
      ),
    [],
  );
  const redo = useCallback(
    () =>
      setHistory((h) =>
        h.future.length
          ? {
              past: [...h.past, h.present],
              present: h.future[0],
              future: h.future.slice(1),
            }
          : h,
      ),
    [],
  );

  useEffect(() => {
    setSaved("saving");
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setSaved("saved");
      } catch {
        setSaved("error");
        toast("本机存储空间不足，请下载 JSON 备份，或减少图片大小。");
      }
    }, 550);
    return () => clearTimeout(timeout);
  }, [data, toast]);

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      if (width > 0)
        setFitScale(
          Math.min(0.86, (width - (width < 600 ? 30 : 108)) / PAGE_WIDTH),
        );
    });
    observer.observe(preview);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const keyHandler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isTyping =
        ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) ||
        target.isContentEditable;
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "z" &&
        !isTyping
      ) {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          setSaved("saved");
          toast("已保存到本机，安心继续创作");
        } catch {
          setSaved("error");
          toast("保存失败：存储空间不足，请下载 JSON 备份");
        }
      }
      if (event.key === "Escape") {
        setFocused(false);
        setMenuOpen(false);
      }
    };
    const clickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    document.addEventListener("mousedown", clickOutside);
    return () => {
      document.removeEventListener("keydown", keyHandler);
      document.removeEventListener("mousedown", clickOutside);
    };
  }, [data, undo, redo, toast]);

  const handleExport = async () => {
    if (exportingRef.current) return;
    exportingRef.current = true;
    setModal(null);
    setEditingTarget(null);
    setExporting(true);
    setProgress(0);
    // Keep the completed resume visible while the independent exporter runs.
    setMobilePage("preview");
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
    try {
      if (data.exportSettings.format === "ats") {
        const { exportATS } = await import("./ats");
        await exportATS(data, setProgress);
        toast("ATS 友好 PDF 已导出，文字可选取、搜索与复制");
      } else {
        const { exportPDF } = await import("./pdf");
        await exportPDF(data, setProgress, currentPage);
        toast("PDF 已导出。愿每一份经历，都被看见。");
      }
    } catch (error) {
      toast(error instanceof Error ? error.message : "导出失败，请重试");
    } finally {
      setExporting(false);
      exportingRef.current = false;
    }
  };

  const backup = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.name || "我的简历"}_Birchify.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMenuOpen(false);
    toast("备份已下载，可随时导入继续编辑");
  };

  const scale = zoom ?? fitScale;
  usePreviewZoom(previewRef, scale, setZoom);
  const closeTour = () => { setShowTour(false); try { localStorage.setItem(TOUR_KEY, "seen"); } catch { /* Storage may be unavailable. */ } };
  const pageChanged = useCallback((count: number) => {
    setPageCount(count);
    setCurrentPage((current) => Math.min(current, count));
  }, []);
  const activeTemplate =
    templates.find((t) => t.id === data.template) || templates[0];
  const commitLayout = useCallback((next: ResumeData) => {
    update(current => ({ ...current, sections: next.sections }));
    toast("排版已更新，可撤销恢复");
  }, [update, toast]);
  const addSection = () => {
    const section = { id: uid(), title: "新的栏目", subtitle: "MY STORY", visible: true, components: [] };
    update(current => ({ ...current, sections: [...current.sections, section] }));
    setEditingTarget({ section: section.id });
  };
  return (
    <div
      className={`app ${focused ? "preview-focused" : ""} mobile-${mobilePage}`}
    >
      <header className="topbar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setTab("content");
            setMobilePage("edit");
            setFocused(false);
          }}
          aria-label="Birchify 首页"
        >
          <BirchLogo size={35} />
          <span>
            Birchify<span className="brand-dot">.</span>
          </span>
        </a>
        <span className="topbar-divider" />
        <span className="workspace-title">
          简历工作室 <span>WORKSPACE</span>
        </span>
        <div className={`save-status status-${saved}`} role="status">
          {saved === "saving" ? (
            <LoaderCircle size={13} className="spin" />
          ) : saved === "error" ? (
            <CircleHelp size={14} />
          ) : (
            <CheckCheck size={15} />
          )}
          <span>
            {saved === "saving"
              ? "正在保存"
              : saved === "error"
                ? "存储空间不足"
                : "所有更改已保存到本机"}
          </span>
        </div>
        <div className="topbar-actions">
          <div className="history-actions">
            <IconButton
              label="撤销 (Ctrl / ⌘ Z)"
              onClick={undo}
              disabled={!history.past.length}
            >
              <Undo2 size={17} />
            </IconButton>
            <IconButton
              label="重做 (Ctrl / ⌘ Shift Z)"
              onClick={redo}
              disabled={!history.future.length}
            >
              <Redo2 size={17} />
            </IconButton>
          </div>
          <span className="action-divider" />
          <button
            className="preview-button"
            onClick={() => {
              setFocused(!focused);
              setMobilePage("preview");
            }}
          >
            <Eye size={16} />
            <span>{focused ? "返回编辑" : "预览"}</span>
          </button>
          <button
            className="export-button"
            onClick={() => setModal("export")}
            disabled={exporting}
          >
            {exporting ? (
              <LoaderCircle size={16} className="spin" />
            ) : (
              <ArrowDownToLine size={16} />
            )}
            <span>导出 PDF / ATS</span>
            <span className="export-arrow">
              <ChevronDown size={13} />
            </span>
          </button>
          <div className="document-menu" ref={menuRef}>
            <IconButton
              label="更多简历操作"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Ellipsis size={20} />
            </IconButton>
            {menuOpen && (
              <div className="popover-menu">
                <small>我的简历</small>
                <button onClick={() => { undo(); setMenuOpen(false); }} disabled={!history.past.length}><Undo2 size={15}/>撤销上一步</button>
                <button onClick={() => { redo(); setMenuOpen(false); }} disabled={!history.future.length}><Redo2 size={15}/>重做上一步</button>
                <div />
                <button onClick={backup}>
                  <ArrowDownToLine size={15} />
                  下载 JSON 备份
                </button>
                <button
                  onClick={() => {
                    importRef.current?.click();
                    setMenuOpen(false);
                  }}
                >
                  <ArrowUpFromLine size={15} />
                  导入简历备份
                </button>
                <div />
                <button onClick={() => { setShowTour(true); setMenuOpen(false); }}><CircleHelp size={15}/>重新查看教程</button>
                <button onClick={() => { setModal("blank"); setMenuOpen(false); }}><Plus size={15}/>从空白开始</button>
                <button onClick={() => { setModal("example"); setMenuOpen(false); }}><Sparkles size={15}/>填入示例内容</button>
                <button className="danger" onClick={() => { setModal("clear"); setMenuOpen(false); }}><Trash2 size={15}/>清空当前简历</button>
                <button
                  onClick={() => {
                    setModal("help");
                    setMenuOpen(false);
                  }}
                >
                  <CircleHelp size={15} />
                  使用与隐私说明
                </button>
                <button
                  className="danger"
                  onClick={() => {
                    setModal("reset");
                    setMenuOpen(false);
                  }}
                >
                  <RotateCcw size={15} />
                  恢复示例简历
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <input
        ref={importRef}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          if (file.size > 25 * 1024 * 1024) {
            toast("备份文件不能超过 25 MB");
            return;
          }
          try {
            const imported = validateResume(JSON.parse(await file.text()));
            update(() => imported);
            toast("简历已导入，继续你的创作吧");
          } catch (error) {
            toast(error instanceof Error ? error.message : "无法读取该文件");
          }
        }}
      />
      <main className="app-layout">
        <Editor
          data={data}
          update={update}
          tab={tab}
          setTab={setTab}
          onAddComponent={setComponentTarget}
          toast={toast}
          onHelp={() => setModal("help")}
          onClear={() => setModal("clear")}
          onBlank={() => setModal("blank")}
          onExample={() => setModal("example")}
          onDraftLayout={setEditorDraft}
        />
        <section className="preview-pane" aria-label="实时简历预览">
          <div className="preview-toolbar">
            <div className="preview-title">
              <span className="live-dot" />
              <h2>实时预览</h2>
              <span className="preview-title-divider" />
              <span className="preview-template">
                {activeTemplate.name} <span>/ {activeTemplate.english}</span>
              </span>
            </div>
            <div className="preview-toolbar-right">
              <button className={`arrange-button ${layoutMode ? "active" : ""}`} aria-pressed={layoutMode} onClick={() => { setLayoutMode(!layoutMode); setPreviewEditable(true); }}>{layoutMode ? "完成排版" : "排版"}</button>
              <button
                className={`preview-mode-button ${previewEditable ? "active" : ""}`}
                aria-pressed={previewEditable}
                onClick={() => setPreviewEditable(!previewEditable)}
              >
                {previewEditable ? "可编辑" : "只读"}
              </button>
              <span className="a4-badge">A4</span>
              <span className="page-count">{pageCount} 页</span>
              <IconButton
                label={focused ? "退出专注预览" : "专注预览"}
                onClick={() => setFocused(!focused)}
              >
                {focused ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </IconButton>
            </div>
          </div>
          <div
            ref={previewRef}
            className="preview-scroll"
            onScroll={(e) => {
              const height = PAGE_HEIGHT * scale + 28;
              setCurrentPage(
                Math.min(
                  pageCount,
                  Math.max(
                    1,
                    Math.floor(e.currentTarget.scrollTop / height) + 1,
                  ),
                ),
              );
            }}
          >
            <div className="preview-intro">
              <span>{layoutMode ? "选中栏目或组件，再拖动手柄 · 双指缩放" : "点按内容编辑 · 双指缩放 · 开启排版以拖动"}</span>
              <span>
                <Leaf size={13} />
                YOUR NEXT CHAPTER
              </span>
            </div>
            <div
              className="pages-viewport"
              style={{
                width: PAGE_WIDTH * scale,
                height:
                  (PAGE_HEIGHT * pageCount + 28 * (pageCount - 1)) * scale,
              }}
            >
              <div
                className="pages-stage"
                style={
                  {
                    transform: `scale(${scale})`,
                    "--preview-scale": scale,
                  } as CSSProperties
                }
              >
                <ResumePreview
                  data={editorDraft || data}
                  onPageCount={pageChanged}
                  editable={previewEditable && !exporting}
                  layoutMode={layoutMode}
                  onEdit={setEditingTarget}
                  onCommit={commitLayout}
                  onAddSection={addSection}
                  onAddComponent={setComponentTarget}
                />
              </div>
            </div>
            <div className="preview-end">
              <span />
              <BirchLogo size={18} />
              <span />
            </div>
          </div>
          <div className="preview-bottom">
            <span className="preview-bottom-caption">
              <ShieldCheck size={13} />
              本地创作，安心表达
            </span>
            <div className="zoom-toolbar">
              <IconButton
                label="缩小预览"
                disabled={scale <= 0.25}
                onClick={() =>
                  setZoom(Math.max(0.25, Math.round((scale - 0.1) * 100) / 100))
                }
              >
                <Minus size={15} />
              </IconButton>
              <button
                className="zoom-percent"
                onClick={() => setZoom(null)}
                title="点击恢复适应宽度"
              >
                {Math.round(scale * 100)}
                <span>%</span>
              </button>
              <IconButton
                label="放大预览"
                disabled={scale >= 2}
                onClick={() =>
                  setZoom(Math.min(2, Math.round((scale + 0.1) * 100) / 100))
                }
              >
                <Plus size={15} />
              </IconButton>
              <span className="zoom-divider" />
              <IconButton label="适应宽度" onClick={() => setZoom(null)}>
                <Maximize2 size={14} />
              </IconButton>
            </div>
            <span className="page-indicator">
              {String(currentPage).padStart(2, "0")}{" "}
              <span>/ {String(pageCount).padStart(2, "0")}</span>
            </span>
          </div>
        </section>
      </main>
      <nav className="mobile-nav" aria-label="主导航">
        {[
          {
            id: "edit",
            label: "编辑",
            icon: <FileText size={21} />,
            tab: "content",
          },
          {
            id: "templates",
            label: "模板",
            icon: <LayoutTemplate size={21} />,
            tab: "templates",
          },
          { id: "preview", label: "预览", icon: <Eye size={21} />, tab: null },
          {
            id: "style",
            label: "样式",
            icon: <Palette size={21} />,
            tab: "style",
          },
        ].map((item) => (
          <button
            className={mobilePage === item.id ? "active" : ""}
            key={item.id}
            onClick={() => {
              setMobilePage(item.id);
              setFocused(false);
              if (item.tab) setTab(item.tab as EditorTab);
            }}
          >
            {item.icon}
            <span>{item.label}</span>
            <i />
          </button>
        ))}
      </nav>
      {showTour && <Onboarding onClose={closeTour}/>}
      {componentTarget && (
        <Modal
          title="给简历，加一点可能"
          subtitle={`选择一个组件，添加到「${data.sections.find((s) => s.id === componentTarget)?.title || "栏目"}」`}
          onClose={() => setComponentTarget(null)}
          wide
        >
          <div className="component-catalog">
            {componentCatalog.map((component) => (
              <button
                key={component.type}
                onClick={() => {
                  update((current) => ({
                    ...current,
                    sections: current.sections.map((s) =>
                      s.id === componentTarget
                        ? {
                            ...s,
                            components: [
                              ...s.components,
                              createComponent(component.type),
                            ],
                          }
                        : s,
                    ),
                  }));
                  setComponentTarget(null);
                  toast(`已添加${component.name}，展开组件即可自由编辑`);
                }}
              >
                <span className={`catalog-icon catalog-${component.type}`}>
                  <ComponentIcon type={component.type} size={22} />
                </span>
                <div>
                  <h3>
                    {component.name}
                    <span>{component.styles.length} 种风格</span>
                  </h3>
                  <p>{component.description}</p>
                </div>
                <Plus size={16} />
              </button>
            ))}
          </div>
          <div className="modal-footnote">
            <SlidersIllustration />
            每一个组件，都可以单独调整颜色、风格与间距。
          </div>
        </Modal>
      )}
      {modal === "help" && (
        <Modal
          title="你的故事，只属于你。"
          subtitle="一个安静、私密的本地简历工作室。"
          onClose={() => setModal(null)}
        >
          <div className="help-content">
            <div className="help-hero">
              <BirchLogo size={52} />
              <div>
                <h3>
                  Birchify<span>让每一份经历，恰如其分。</span>
                </h3>
                <span className="version-label">LOCAL-FIRST · VERSION 1.0</span>
                <p className="author-credit">
                  作者 <strong>Vargking</strong>
                </p>
              </div>
            </div>
            <div className="help-item">
              <ShieldCheck size={21} />
              <div>
                <h3>不上传，不追踪</h3>
                <p>
                  内容和照片仅保存在此浏览器的本地存储中，没有账号、服务器或在线
                  AI。清除浏览器数据会移除简历，建议定期下载 JSON 备份。
                </p>
              </div>
            </div>
            <div className="help-item">
              <Sparkles size={21} />
              <div>
                <h3>模板是起点，组件是可能</h3>
                <p>
                  {templates.length - 1} 款设计模板（含 {templates.filter(t => t.motif).length} 款整页原创卡通）和空白画布、{backgrounds.length} 种纸张背景、103
                  款组件图标；每栏可自由添加文本、时间线、技能进度、图片等 10
                  类组件。手机预览支持双指缩放，进入“排版”后点选内容即可显示拖动工具。预览和编辑栏均可拖动栏目；组件跟随鼠标或手指实时排序、跨栏目移动或横向缩进。拖动按 Escape 可取消，松手后可一次撤销。清空和从空白开始前均会确认，也可撤销恢复。
                </p>
              </div>
            </div>
            <div className="help-item">
              <FileCheck2 size={21} />
              <div>
                <h3>多页，依然从容</h3>
                <p>
                  内容会自动分页，并在页底标注页码。PDF 按 A4
                  尺寸导出，可设置品牌水印、页码、背景、清晰度和导出范围。
                  设计版 PDF 使用高清图像保留整页外观，文字不可选取。ATS 友好 PDF 则按栏目顺序重新排为单栏，使用可选取、搜索与复制的真实文字，技能进度转为百分比；不含照片、图标、装饰背景、水印和页脚，导出全部可见内容并独立分页。不同招聘系统解析规则不同，不能保证所有 ATS 的识别结果。需要继续编辑，请下载 JSON 备份。
                </p>
              </div>
            </div>
            <div className="keyboard-tips">
              <span>
                <Command size={13} /> / Ctrl + Z <b>撤销</b>
              </span>
              <span>
                <Command size={13} /> / Ctrl + S <b>保存</b>
              </span>
            </div>
          </div>
        </Modal>
      )}
      {modal === "reset" && (
        <Modal
          title="开启一份新的简历？"
          subtitle="当前内容将恢复为示例。建议先下载一份备份。"
          onClose={() => setModal(null)}
        >
          <div className="reset-actions">
            <button
              className="secondary-button"
              onClick={() => {
                backup();
                setModal(null);
              }}
            >
              <Download size={15} />
              先下载备份
            </button>
            <button
              className="primary-button"
              onClick={() => {
                update(() => createDefaultResume());
                setModal(null);
                toast("已恢复初始示例，可通过顶部撤销找回");
              }}
            >
              恢复示例
            </button>
          </div>
        </Modal>
      )}
      {(modal === "clear" || modal === "blank") && <Modal title={modal === "clear" ? "清空当前简历？" : "从空白画布开始？"} subtitle={modal === "clear" ? "移除个人信息、照片和全部栏目，保留当前模板与样式。可通过撤销恢复。" : "移除当前内容，切换为纯白无装饰画布。可通过撤销恢复，建议先下载备份。"} onClose={() => setModal(null)}>
        <div className="reset-actions"><button className="secondary-button" onClick={backup}><Download size={15}/>先下载备份</button><button className="secondary-button" onClick={() => setModal(null)}>取消</button><button className="primary-button" onClick={() => {
          const blank = modal === "blank";
          update(current => ({ ...createBlankResume(blank ? undefined : current), ...(blank ? { template: "blank", background: "paper", accent: "#335e4c", font: "sans" as const } : {}) }));
          setEditingTarget(null); setComponentTarget(null); setModal(null); setTab("content"); setZoom(null);
          toast(blank ? "已创建空白简历，可撤销恢复原内容" : "简历已清空，模板已保留，可撤销恢复");
        }}>{modal === "clear" ? "确认清空" : "创建空白简历"}</button></div>
      </Modal>}
      {modal === "example" && <Modal title="填入示例内容？" subtitle="将个人资料、照片与所有栏目替换成最初的示例内容，保留当前模板、背景和排版设置。此操作可以撤销。" onClose={() => setModal(null)}>
        <div className="reset-actions"><button className="secondary-button" onClick={backup}><Download size={15}/>先下载备份</button><button className="secondary-button" onClick={() => setModal(null)}>取消</button><button className="primary-button" onClick={() => {
          const example = createDefaultResume();
          update(current => ({ ...current, name: example.name, role: example.role, email: example.email, phone: example.phone, location: example.location, website: example.website, photo: example.photo, photoShape: example.photoShape, sections: example.sections }));
          setEditingTarget(null); setComponentTarget(null); setModal(null); setTab("content");
          toast("已填入初始示例内容，当前设计已保留，可撤销恢复");
        }}>确认填入示例</button></div>
      </Modal>}
      {editingTarget && (
        <PreviewEditorDialog
          target={editingTarget}
          data={data}
          update={update}
          onClose={() => setEditingTarget(null)}
          toast={toast}
        />
      )}
      {modal === "export" && (
        <ExportDialog
          settings={data.exportSettings}
          onChange={(patch) =>
            update((current) => ({
              ...current,
              exportSettings: { ...current.exportSettings, ...patch },
            }))
          }
          onClose={() => setModal(null)}
          onExport={handleExport}
          pageCount={pageCount}
          currentPage={currentPage}
          name={data.name}
        />
      )}
      {exporting && (
        <div className="modal-backdrop export-backdrop">
          <div className="export-dialog" role="status" aria-live="polite">
            <div className="export-logo">
              <BirchLogo size={54} />
              <span className="export-orbit" />
            </div>
            <h2>为你的下一站，准备就绪。</h2>
            <p>{data.exportSettings.format === "ats" ? "正在生成 ATS 友好 PDF · 全部可见内容，单栏重新分页" : `正在生成高清 A4 简历 · ${data.exportSettings.pages === "current" ? "当前页" : `${pageCount} 页`}`}</p>
            <div className="export-progress">
              <span style={{ width: `${progress}%` }} />
            </div>
            <small>
              {progress}% <span>所有处理均在本机完成</span>
            </small>
          </div>
        </div>
      )}
      {toastMessage && (
        <div className="toast" role="status">
          <span>
            <Check size={14} />
          </span>
          {toastMessage}
          <button onClick={() => setToastMessage("")} aria-label="关闭提示">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

function SlidersIllustration() {
  return <Palette size={13} />;
}
