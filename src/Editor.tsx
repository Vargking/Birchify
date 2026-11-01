import { useEffect, useRef, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowUp,
  Bold,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  ImagePlus,
  LayoutTemplate,
  Leaf,
  Palette,
  Plus,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import { backgrounds, componentCatalog, templates } from "./data";
import { fontOptions, fontFor } from "./fonts";
import { BirchLogo, ComponentIcon } from "./icons";
import { Artwork } from "./Artwork";
import { PageScenery } from "./PageScenery";
import { IconPicker, DecorationIcon } from "./IconLibrary";
import { columnWeights, designFor } from "./designs";
import { usePreviewDrag } from "./PreviewInteraction";
import { Field, IconButton, RangeControl, readImage } from "./ui";
import {
  uid,
  type ResumeComponent,
  type ResumeData,
  type Section,
  type Template,
  type UpdateResume,
} from "./types";

export type EditorTab = "content" | "templates" | "style";

interface EditorProps {
  data: ResumeData;
  update: UpdateResume;
  tab: EditorTab;
  setTab: (tab: EditorTab) => void;
  onAddComponent: (section: string) => void;
  toast: (message: string) => void;
  onHelp: () => void;
  onClear: () => void;
  onBlank: () => void;
  onExample: () => void;
  onDraftLayout: (data: ResumeData | null) => void;
}

function WelcomeCard() {
  return (
    <div className="welcome-card">
      <div className="welcome-top">
        <span>
          <BirchLogo size={23} />
          Birchify
        </span>
        <span className="welcome-label">
          <i />
          为下一站而生
        </span>
      </div>
      <h1>
        你的经历，
        <br />
        值得被看见<span>。</span>
      </h1>
      <p>从一份好简历，开始新的可能。</p>
      <div className="welcome-bottom">
        <span>
          <LayoutTemplate size={14} />
          {templates.length - 1} 款模板
        </span>
        <span>
          <Palette size={14} />
          {backgrounds.length} 种背景
        </span>
        <span className="welcome-spark">✧</span>
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="hero-orbit" />
        <div className="hero-sheet sheet-back">
          <i />
          <i />
          <i />
        </div>
        <div className="hero-sheet sheet-front">
          <div className="tiny-profile">
            <span />
            <b>
              <i />
              <i />
            </b>
          </div>
          <div className="tiny-line wide" />
          <div className="tiny-line" />
          <div className="tiny-line short" />
          <div className="tiny-section">
            <i />
            <i />
            <i />
          </div>
          <div className="tiny-pills">
            <i />
            <i />
            <i />
          </div>
        </div>
        <span className="hero-star star-one">✳</span>
        <span className="hero-star star-two">✦</span>
        <div className="hero-leaf">
          <Leaf size={18} />
        </div>
      </div>
    </div>
  );
}

export default function Editor({
  data: savedData,
  update,
  tab,
  setTab,
  onAddComponent,
  toast,
  onHelp,
  onClear,
  onBlank,
  onExample,
  onDraftLayout,
}: EditorProps) {
  const [openSection, setOpenSection] = useState<string | null>("personal");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const { draft, dragging, beginDrag } = usePreviewDrag({ data: savedData, surface: "editor", onCommit: next => update(current => ({ ...current, sections: next.sections })), onEdit: target => setOpenSection(target.section) });
  const data = draft || savedData;
  useEffect(() => { onDraftLayout(draft); }, [draft, onDraftLayout]);
  const photoInput = useRef<HTMLInputElement>(null);
  const setField = <K extends keyof ResumeData>(key: K, value: ResumeData[K]) =>
    update((current) => ({ ...current, [key]: value }));
  const updateSection = (id: string, fn: (section: Section) => Section) =>
    update((current) => ({
      ...current,
      sections: current.sections.map((s) => (s.id === id ? fn(s) : s)),
    }));
  const updateComponent = (
    sectionId: string,
    id: string,
    patch: Partial<ResumeComponent>,
  ) =>
    updateSection(sectionId, (s) => ({
      ...s,
      components: s.components.map((c) =>
        c.id === id ? { ...c, ...patch } : c,
      ),
    }));
  const moveSection = (index: number, direction: number) =>
    update((current) => {
      const sections = [...current.sections];
      [sections[index], sections[index + direction]] = [
        sections[index + direction],
        sections[index],
      ];
      return { ...current, sections };
    });
  const moveComponent = (section: Section, index: number, direction: number) =>
    updateSection(section.id, (s) => {
      const components = [...s.components];
      [components[index], components[index + direction]] = [
        components[index + direction],
        components[index],
      ];
      return { ...s, components };
    });

  return (
    <aside className="editor-pane" aria-label="简历编辑器" data-drag-surface="editor">
      <div className="editor-scroll">
        <WelcomeCard />
        <p className="author-credit">
          作者 <strong>Vargking</strong>
        </p>
        <div className="editor-tab-wrap">
          <div
            className="segmented-control"
            role="tablist"
            aria-label="编辑面板"
          >
            {(
              [
                {
                  id: "content",
                  label: "简历内容",
                  icon: <AlignLeft size={15} />,
                },
                {
                  id: "templates",
                  label: "模板",
                  icon: <LayoutTemplate size={15} />,
                },
                {
                  id: "style",
                  label: "样式",
                  icon: <SlidersHorizontal size={15} />,
                },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                className={tab === t.id ? "active" : ""}
                onClick={() => setTab(t.id)}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="editor-panel" role="tabpanel" key={tab}>
          {tab === "content" && (
            <>
              <div className="panel-heading">
                <div>
                  <h2>
                    把故事，慢慢写好<span className="small-spark">✳</span>
                  </h2>
                  <p>每一段经历，都是独一无二的你。</p>
                </div>
                <IconButton label="了解组件与本地保存" onClick={onHelp}>
                  <CircleHelp size={17} />
                </IconButton>
              </div>
              <div className="canvas-actions"><button onClick={onBlank}><Plus size={16}/>从空白开始</button><button onClick={onExample}><Sparkles size={16}/>填入示例内容</button><button onClick={onClear}><Trash2 size={15}/>清空当前简历</button></div>
              <div
                className={`section-card personal-card ${openSection === "personal" ? "is-open" : ""}`}
              >
                <button
                  className="section-toggle"
                  onClick={() =>
                    setOpenSection(
                      openSection === "personal" ? null : "personal",
                    )
                  }
                  aria-expanded={openSection === "personal"}
                >
                  <span className="section-icon icon-personal">
                    <UserRound size={17} />
                  </span>
                  <span className="section-label">
                    个人信息<small>让我们先认识你</small>
                  </span>
                  <ChevronDown size={17} className="accordion-chevron" />
                </button>
                {openSection === "personal" && (
                  <div className="section-body personal-body">
                    <div className="photo-row">
                      <button
                        className={`photo-upload photo-${data.photoShape}`}
                        onClick={() => photoInput.current?.click()}
                        aria-label="上传个人照片"
                      >
                        {data.photo ? (
                          <img src={data.photo} alt="个人照片" />
                        ) : (
                          <UserRound size={26} strokeWidth={1.3} />
                        )}
                        <span>
                          <Camera size={11} />
                        </span>
                      </button>
                      <div>
                        <h3>一张照片，更有温度</h3>
                        <p>JPG、PNG / 建议 1:1 / 最大 5 MB</p>
                        <button
                          className="text-button"
                          onClick={() => photoInput.current?.click()}
                        >
                          {data.photo ? "更换照片" : "上传照片"}
                          <ChevronRight size={12} />
                        </button>
                      </div>
                      {data.photo && (
                        <IconButton
                          label="移除个人照片"
                          onClick={() => setField("photo", "")}
                        >
                          <Trash2 size={14} />
                        </IconButton>
                      )}
                      <input
                        ref={photoInput}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className="sr-only"
                        onChange={(e) => {
                          readImage(
                            e.target.files?.[0],
                            (value) => setField("photo", value),
                            toast,
                          );
                          e.target.value = "";
                        }}
                      />
                    </div>
                    {data.photo && (
                      <label className="select-field">
                        照片形状
                        <select
                          value={data.photoShape}
                          onChange={(e) =>
                            setField(
                              "photoShape",
                              e.target.value as ResumeData["photoShape"],
                            )
                          }
                        >
                          <option value="rounded">圆角方形</option>
                          <option value="circle">圆形</option>
                          <option value="square">方形</option>
                        </select>
                      </label>
                    )}
                    <div className="form-grid">
                      <Field
                        label="姓名"
                        value={data.name}
                        onChange={(v) => setField("name", v)}
                        placeholder="你的姓名"
                      />
                      <Field
                        label="所在城市"
                        value={data.location}
                        onChange={(v) => setField("location", v)}
                        placeholder="城市，国家"
                      />
                    </div>
                    <Field
                      label="职业 / 求职意向"
                      value={data.role}
                      onChange={(v) => setField("role", v)}
                      placeholder="你想成为怎样的人？"
                    />
                    <div className="form-grid">
                      <Field
                        label="电子邮箱"
                        value={data.email}
                        onChange={(v) => setField("email", v)}
                        placeholder="hello@example.com"
                      />
                      <Field
                        label="联系电话"
                        value={data.phone}
                        onChange={(v) => setField("phone", v)}
                        placeholder="138 0000 0000"
                      />
                    </div>
                    <Field
                      label="个人网站 / 作品集"
                      value={data.website}
                      onChange={(v) => setField("website", v)}
                      placeholder="yourname.design"
                    />
                  </div>
                )}
              </div>
              <div className="section-list-label">
                <span>
                  内容栏目 <b>{data.sections.length}</b>
                </span>
                <span>随心添加，自由编排</span>
              </div>
              {data.sections.map((section, sectionIndex) => (
                <div
                  className={`section-card draggable-section-card ${openSection === section.id ? "is-open" : ""} ${!section.visible ? "section-hidden" : ""} ${dragging?.section === section.id ? "drag-placeholder" : ""}`}
                  key={section.id}
                  data-drag-section={section.id}
                >
                  <button className="editor-section-handle" aria-label={`拖拽编辑栏栏目：${section.title}`} title="拖动调整栏目顺序" onPointerDown={e=>beginDrag(e,{section:section.id})}><GripVertical size={19}/></button>
                  <button
                    className="section-toggle"
                    onClick={() =>
                      setOpenSection(
                        openSection === section.id ? null : section.id,
                      )
                    }
                    aria-expanded={openSection === section.id}
                  >
                    <span
                      className={`section-icon icon-${section.components[0]?.type || "text"}`}
                    >
                      <ComponentIcon
                        type={section.components[0]?.type || "text"}
                        size={17}
                      />
                    </span>
                    <span className="section-label">
                      {section.title}
                      <small>
                        {section.components.length} 个组件
                        {!section.visible && " · 已隐藏"}
                      </small>
                    </span>
                    <ChevronDown size={17} className="accordion-chevron" />
                  </button>
                  {openSection === section.id && (
                    <div className="section-body">
                      <div className="section-tools">
                        <span>栏目设置</span>
                        <div>
                          <IconButton
                            label="上移栏目"
                            onClick={() => moveSection(sectionIndex, -1)}
                            disabled={sectionIndex === 0}
                          >
                            <ArrowUp size={14} />
                          </IconButton>
                          <IconButton
                            label="下移栏目"
                            onClick={() => moveSection(sectionIndex, 1)}
                            disabled={sectionIndex === data.sections.length - 1}
                          >
                            <ArrowDown size={14} />
                          </IconButton>
                          <IconButton
                            label={section.visible ? "隐藏栏目" : "显示栏目"}
                            onClick={() =>
                              updateSection(section.id, (s) => ({
                                ...s,
                                visible: !s.visible,
                              }))
                            }
                          >
                            {section.visible ? (
                              <Eye size={14} />
                            ) : (
                              <EyeOff size={14} />
                            )}
                          </IconButton>
                          <IconButton
                            label="删除栏目"
                            className="danger"
                            onClick={() => {
                              update((current) => ({
                                ...current,
                                sections: current.sections.filter(
                                  (s) => s.id !== section.id,
                                ),
                              }));
                              toast("栏目已删除，可在顶部撤销");
                            }}
                          >
                            <Trash2 size={14} />
                          </IconButton>
                        </div>
                      </div>
                      <div className="form-grid">
                        <Field
                          label="栏目标题"
                          value={section.title}
                          onChange={(v) =>
                            updateSection(section.id, (s) => ({
                              ...s,
                              title: v,
                            }))
                          }
                        />
                        <Field
                          label="英文副标题"
                          value={section.subtitle}
                          onChange={(v) =>
                            updateSection(section.id, (s) => ({
                              ...s,
                              subtitle: v,
                            }))
                          }
                        />
                      </div>
                      <div className="component-list">
                        {section.components.map((component, index) => (
                          <div
                            key={component.id}
                            className={`component-editor ${expandedItem === component.id ? "expanded" : ""}`}
                          >
                            <button
                              className="component-editor-header"
                              onClick={() =>
                                setExpandedItem(
                                  expandedItem === component.id
                                    ? null
                                    : component.id,
                                )
                              }
                              aria-expanded={expandedItem === component.id}
                            >
                              {component.icon ? (
                                <DecorationIcon
                                  name={component.icon}
                                  size={19}
                                />
                              ) : (
                                <ComponentIcon
                                  type={component.type}
                                  size={14}
                                />
                              )}
                              <span>
                                {component.title ||
                                  componentCatalog.find(
                                    (c) => c.type === component.type,
                                  )?.name}
                              </span>
                              <ChevronDown size={13} />
                            </button>
                            {expandedItem === component.id && (
                              <div className="component-editor-body">
                                <div className="component-actions">
                                  <small>
                                    {
                                      componentCatalog.find(
                                        (c) => c.type === component.type,
                                      )?.name
                                    }
                                  </small>
                                  <div>
                                    <IconButton
                                      label="上移组件"
                                      onClick={() =>
                                        moveComponent(section, index, -1)
                                      }
                                      disabled={index === 0}
                                    >
                                      <ArrowUp size={13} />
                                    </IconButton>
                                    <IconButton
                                      label="下移组件"
                                      onClick={() =>
                                        moveComponent(section, index, 1)
                                      }
                                      disabled={
                                        index === section.components.length - 1
                                      }
                                    >
                                      <ArrowDown size={13} />
                                    </IconButton>
                                    <IconButton
                                      label="复制组件"
                                      onClick={() =>
                                        updateSection(section.id, (s) => ({
                                          ...s,
                                          components: [
                                            ...s.components.slice(0, index + 1),
                                            { ...component, id: uid() },
                                            ...s.components.slice(index + 1),
                                          ],
                                        }))
                                      }
                                    >
                                      <Copy size={13} />
                                    </IconButton>
                                    <IconButton
                                      label="删除组件"
                                      className="danger"
                                      onClick={() =>
                                        updateSection(section.id, (s) => ({
                                          ...s,
                                          components: s.components.filter(
                                            (c) => c.id !== component.id,
                                          ),
                                        }))
                                      }
                                    >
                                      <Trash2 size={13} />
                                    </IconButton>
                                  </div>
                                </div>
                                <ComponentFields
                                  item={component}
                                  onChange={(patch) =>
                                    updateComponent(
                                      section.id,
                                      component.id,
                                      patch,
                                    )
                                  }
                                  toast={toast}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <button
                        className="add-component-button"
                        onClick={() => onAddComponent(section.id)}
                      >
                        <Plus size={14} />
                        添加组件
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <button
                className="add-section-button"
                onClick={() => {
                  const id = uid();
                  update((current) => ({
                    ...current,
                    sections: [
                      ...current.sections,
                      {
                        id,
                        title: "新的栏目",
                        subtitle: "MY STORY",
                        visible: true,
                        components: [],
                      },
                    ],
                  }));
                  setOpenSection(id);
                }}
              >
                <Plus size={16} />
                添加新栏目<span>让简历更像你</span>
              </button>
              <div className="editor-note">
                <Leaf size={13} />
                <span>没有标准答案，只有你的独特表达。</span>
              </div>
            </>
          )}
          {tab === "templates" && (
            <>
              <div className="panel-heading">
                <div>
                  <h2>
                    找到你的那一款<span className="small-spark">✧</span>
                  </h2>
                  <p>{templates.length - 1} 款独立设计 + 空白画布，含 {templates.filter(t => t.motif).length} 款整页卡通。</p>
                </div>
              </div>
              <div className="filter-tabs">
                {[
                  { id: "all", label: "全部" },
                  { id: "minimal", label: "简约" },
                  { id: "professional", label: "专业" },
                  { id: "creative", label: "创意" },
                  { id: "cartoon", label: "原创卡通" },
                ].map((f) => (
                  <button
                    className={filter === f.id ? "active" : ""}
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                  >
                    {f.label}
                    {f.id === "all" && <span>{templates.length}</span>}
                  </button>
                ))}
              </div>
              <div className="template-grid">
                {templates
                  .filter((t) => filter === "all" || t.category === filter)
                  .map((template) => (
                    <button
                      className={`template-option ${data.template === template.id ? "selected" : ""}`}
                      key={template.id}
                      onClick={() => {
                        update((current) => ({
                          ...current,
                          template: template.id,
                          background: "template",
                          accent: template.color,
                          font: template.font,
                        }));
                        toast(`已应用「${template.name}」的排版、背景与配色`);
                      }}
                      aria-pressed={data.template === template.id}
                      aria-label={`${template.name} ${template.english} 模板`}
                    >
                      <TemplateThumb template={template} />
                      <div className="template-caption">
                        <span>
                          {template.name}
                          <small>{template.english}</small>
                        </span>
                        {data.template === template.id ? (
                          <span className="selected-check">
                            <Check size={12} />
                          </span>
                        ) : (
                          <span
                            className="template-dot"
                            style={{ background: template.color }}
                          />
                        )}
                      </div>
                      <p className="template-design-note">{designFor(template.id).description}</p>
                    </button>
                  ))}
              </div>
              <div className="editor-note">
                <Sparkles size={13} />
                <span>模板是起点，你才是主角。</span>
              </div>
            </>
          )}
          {tab === "style" && (
            <>
              <div className="panel-heading">
                <div>
                  <h2>
                    细节，恰如其分<span className="small-spark">✳</span>
                  </h2>
                  <p>用一点自己的风格，让简历与众不同。</p>
                </div>
              </div>
              <section className="style-section">
                <div className="style-section-title">
                  <Palette size={16} />
                  <h3>主题色</h3>
                  <span>自由调色</span>
                </div>
                <div className="color-swatches">
                  {[
                    "#335e4c",
                    "#2f4269",
                    "#527581",
                    "#8272a2",
                    "#a26d77",
                    "#ad654d",
                    "#9c803b",
                    "#333333",
                  ].map((color) => (
                    <button
                      key={color}
                      className={data.accent === color ? "selected" : ""}
                      style={{ background: color }}
                      aria-label={`主题色 ${color}`}
                      onClick={() => setField("accent", color)}
                    >
                      {data.accent === color && <Check size={15} />}
                    </button>
                  ))}
                  <label className="custom-color" title="自定义主题色">
                    <Plus size={17} />
                    <input
                      type="color"
                      value={data.accent}
                      onChange={(e) => setField("accent", e.target.value)}
                      aria-label="自定义主题色"
                    />
                  </label>
                </div>
                <div className="color-value">
                  <span>当前颜色</span>
                  <code>{data.accent.toUpperCase()}</code>
                </div>
              </section>
              <section className="style-section">
                <div className="style-section-title">
                  <ImagePlus size={16} />
                  <h3>纸张背景</h3>
                  <span>{backgrounds.length} 种预设</span>
                </div>
                <div className="background-grid">
                  <button className={`background-option template-background ${data.background === "template" ? "selected" : ""}`} onClick={() => setField("background", "template")} aria-label="背景：跟随模板" aria-pressed={data.background === "template"}>
                    <span className="background-swatch" style={{ background: designFor(data.template).paper || "#fff" }}><Sparkles size={18}/>{data.background === "template" && <span><Check size={12}/></span>}</span>
                    <small>跟随模板</small>
                  </button>
                  {backgrounds.map((background) => (
                    <button
                      key={background.id}
                      className={`background-option ${data.background === background.id ? "selected" : ""}`}
                      onClick={() => setField("background", background.id)}
                      aria-label={`背景：${background.name}`}
                      aria-pressed={data.background === background.id}
                    >
                      <span
                        className="background-swatch"
                        style={{ background: background.value }}
                      >
                        {data.background === background.id && (
                          <span>
                            <Check size={12} />
                          </span>
                        )}
                      </span>
                      <small>{background.name}</small>
                    </button>
                  ))}
                </div>
              </section>
              <section className="style-section">
                <div className="style-section-title">
                  <span className="type-icon">Aa</span>
                  <h3>字体与排版</h3>
                </div>
                <div className="font-options">
                  {fontOptions.map((f) => (
                    <button
                      className={`${data.font === f.value ? "selected" : ""} font-${f.value}`}
                      key={f.value}
                      title={`${f.label} · ${f.note}`}
                      aria-pressed={data.font === f.value}
                      onClick={() => setField("font", f.value)}
                    >
                      <b aria-hidden="true" style={data.font === f.value ? { fontFamily: fontFor(data.font).css } : undefined}>{f.value === "sans" || f.value === "serif" || f.value === "mono" ? "Aa" : "简历"}</b>
                      <span>{f.label}</span>
                      <small>{f.note}</small>
                    </button>
                  ))}
                </div>
                <p className="font-license-note">新增 10 款中文字体均采用 SIL OFL 1.1 开源许可，可用于商业设计。字体按需从本站载入，无第三方 CDN。<a href={`${import.meta.env.BASE_URL}font-licenses.txt`} target="_blank" rel="noreferrer">查看字体许可</a></p>
                <RangeControl
                  label="正文字号（同步所有文字组件）"
                  value={data.fontSize}
                  min={10}
                  max={20}
                  suffix=" px"
                  onChange={(v) =>
                    update((current) => ({
                      ...current,
                      fontSize: v,
                      sections: current.sections.map((s) => ({
                        ...s,
                        components: s.components.map((c) => ({
                          ...c,
                          fontSize: v,
                        })),
                      })),
                    }))
                  }
                />
                <RangeControl
                  label="行间距"
                  value={data.lineHeight}
                  min={1.3}
                  max={2.3}
                  step={0.05}
                  suffix=" 倍"
                  onChange={(v) => setField("lineHeight", v)}
                />
                <RangeControl
                  label="页面边距"
                  value={data.pagePadding}
                  min={32}
                  max={80}
                  suffix=" px"
                  onChange={(v) => setField("pagePadding", v)}
                />
              </section>
            </>
          )}
        </div>
      </div>
      <div className="editor-bottom">
        <span>
          <span className="privacy-dot" />
          仅存储在此设备
        </span>
        <button onClick={onHelp}>
          安心创作
          <Leaf size={12} />
        </button>
      </div>
    </aside>
  );
}

export function ComponentFields({
  item,
  onChange,
  toast,
}: {
  item: ResumeComponent;
  onChange: (patch: Partial<ResumeComponent>) => void;
  toast: (message: string) => void;
}) {
  const catalog = componentCatalog.find((c) => c.type === item.type)!;
  return (
    <>
      {!["divider", "spacer"].includes(item.type) && (
        <Field
          label={
            item.type === "tags"
              ? "标签（用逗号分隔）"
              : item.type === "quote"
                ? "引言内容"
                : item.type === "image"
                  ? "图片说明"
                  : "标题 / 名称"
          }
          value={item.title}
          onChange={(v) => onChange({ title: v })}
        />
      )}
      {["timeline", "project", "text", "quote"].includes(item.type) && (
        <Field
          label={item.type === "quote" ? "署名" : "副标题 / 组织 / 职位"}
          value={item.subtitle}
          onChange={(v) => onChange({ subtitle: v })}
        />
      )}
      {["timeline", "project"].includes(item.type) && (
        <Field
          label="时间范围"
          value={item.date}
          onChange={(v) => onChange({ date: v })}
          placeholder="2023.09 — 至今"
        />
      )}
      {["timeline", "project", "text", "links"].includes(item.type) && (
        <Field
          label={item.type === "links" ? "链接地址" : "详细描述"}
          value={item.description}
          onChange={(v) => onChange({ description: v })}
          multiline={item.type !== "links"}
        />
      )}
      {item.type === "image" && (
        <label className="image-input-label">
          <ImagePlus size={18} />
          <span>
            {item.image ? "更换图片" : "选择图片"}
            <small>JPG / PNG / WebP，最大 5 MB</small>
          </span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="sr-only"
            onChange={(e) => {
              readImage(
                e.target.files?.[0],
                (image) => onChange({ image }),
                toast,
              );
              e.target.value = "";
            }}
          />
        </label>
      )}
      {["progress", "spacer", "image"].includes(item.type) && (
        <RangeControl
          label={
            item.type === "progress"
              ? "熟练程度"
              : item.type === "spacer"
                ? "留白高度"
                : "图片高度"
          }
          value={item.value}
          min={0}
          max={item.type === "spacer" ? 300 : 100}
          suffix={
            item.type === "progress" ? "%" : item.type === "spacer" ? " px" : ""
          }
          onChange={(v) => onChange({ value: v })}
        />
      )}
      {catalog.styles.length > 1 && (
        <label className="select-field">
          展示风格
          <select
            aria-label="展示风格"
            value={item.style}
            onChange={(e) => onChange({ style: e.target.value })}
          >
            {catalog.styles.map((style) => (
              <option value={style.value} key={style.value}>
                {style.label}
              </option>
            ))}
          </select>
        </label>
      )}
      {!["divider", "spacer"].includes(item.type) && (
        <>
          <IconPicker
            value={item.icon}
            onChange={(icon) => onChange({ icon })}
          />
          {item.icon && (
            <label className="select-field">
              图标样式
              <select
                aria-label="图标样式"
                value={item.iconStyle}
                onChange={(e) =>
                  onChange({
                    iconStyle: e.target.value as ResumeComponent["iconStyle"],
                  })
                }
              >
                <option value="line">简洁线条</option>
                <option value="soft">柔色底衬</option>
                <option value="badge">实色徽章</option>
              </select>
            </label>
          )}
        </>
      )}
      {item.type !== "spacer" && (
        <div className="item-color-row">
          <span>组件 / 图标颜色</span>
          <label className="color-picker">
            <input
              type="color"
              value={item.color || "#335e4c"}
              aria-label="组件颜色"
              onChange={(e) => onChange({ color: e.target.value })}
            />
            <span>{item.color || "跟随主题"}</span>
          </label>
          {item.color && (
            <button
              className="text-button"
              onClick={() => onChange({ color: "" })}
            >
              重置
            </button>
          )}
        </div>
      )}
      {!["divider", "spacer", "image"].includes(item.type) && (
        <>
          <div className="format-toolbar">
            <div>
              {(
                [
                  {
                    value: "left",
                    icon: <AlignLeft size={15} />,
                    name: "左对齐",
                  },
                  {
                    value: "center",
                    icon: <AlignCenter size={15} />,
                    name: "居中",
                  },
                  {
                    value: "right",
                    icon: <AlignRight size={15} />,
                    name: "右对齐",
                  },
                ] as const
              ).map((a) => (
                <IconButton
                  label={a.name}
                  key={a.value}
                  className={item.align === a.value ? "is-active" : ""}
                  onClick={() => onChange({ align: a.value })}
                >
                  {a.icon}
                </IconButton>
              ))}
            </div>
            <IconButton
              label="加粗"
              className={item.bold ? "is-active" : ""}
              onClick={() => onChange({ bold: !item.bold })}
            >
              <Bold size={15} />
            </IconButton>
          </div>
          <RangeControl
            label="字号"
            value={item.fontSize}
            min={10}
            max={24}
            suffix=" px"
            onChange={(v) => onChange({ fontSize: v })}
          />
        </>
      )}
      <RangeControl
        label="组件宽度"
        value={item.width}
        min={40}
        max={100}
        suffix="%"
        onChange={(v) => onChange({ width: v })}
      />
      <RangeControl
        label="左侧缩进"
        value={item.indent}
        min={0}
        max={120}
        suffix=" px"
        onChange={(v) => onChange({ indent: v })}
      />
      <RangeControl
        label="底部间距"
        value={item.spacing}
        min={0}
        max={48}
        suffix=" px"
        onChange={(v) => onChange({ spacing: v })}
      />
    </>
  );
}

export function TemplateThumb({ template }: { template: Template }) {
  const design = designFor(template.id), weights = columnWeights(template.id);
  return <div className={`template-thumb miniature thumb-header-${design.header} thumb-panel-${design.panel} thumb-surface-${design.surface} ${template.motif ? "thumb-cartoon" : ""}`} style={{ "--thumb-color": template.color, "--mini-paper": design.paper || "#fff", "--mini-secondary": design.secondary || "#e6ece7", "--resume-accent": template.color } as React.CSSProperties}>
    <div className="mini-paper">
      {template.id === "blank" ? <div className="mini-blank"><Plus size={26}/><span>YOUR STORY<br/>STARTS HERE</span></div> : <>
        <div className="mini-header"><div><b>林予安</b><small>MY LITTLE JOURNEY</small></div>{template.motif ? <Artwork motif={template.motif} size={36}/> : <i/>}</div>
        <div className="mini-contact"><i/><i/><i/></div>
        <div className="mini-columns" style={{gridTemplateColumns:weights.map(w=>`${w}fr`).join(" ")}}>{weights.map((_,col)=><div key={col}>{Array.from({length:weights.length===1?3:2},(_,n)=><div className="mini-section" key={n}><b>{["ABOUT ME", "MY STORY", "SKILLS"][n]}</b><i/><i/><i/>{n===0&&<i/>}</div>)}</div>)}</div>
        {template.motif && <PageScenery template={template}/>}
      </>}
    </div>
  </div>;
}
