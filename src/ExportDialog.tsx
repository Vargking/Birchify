import { ArrowDownToLine, FileText, Layers, ShieldCheck } from "lucide-react";
import { Field, Modal } from "./ui";
import type { ExportSettings } from "./types";

export default function ExportDialog({
  settings,
  onChange,
  onClose,
  onExport,
  pageCount,
  currentPage,
  name,
}: {
  settings: ExportSettings;
  onChange: (patch: Partial<ExportSettings>) => void;
  onClose: () => void;
  onExport: () => void;
  pageCount: number;
  currentPage: number;
  name: string;
}) {
  return (
    <Modal
      title="让下一站，看见你。"
      subtitle="PDF 保留视觉效果，Word 方便继续编辑。全程本机处理。"
      onClose={onClose}
    >
      <div className="export-settings">
        <div className="export-format-options" aria-label="导出格式">
          <button aria-pressed={settings.format === "pdf"} onClick={() => onChange({format:"pdf"})}>PDF<small>保留页面设计 · 便于投递</small></button>
          <button aria-pressed={settings.format === "docx"} onClick={() => onChange({format:"docx"})}>Word (.docx)<small>原生可编辑文字、图片和链接</small></button>
        </div>
        <div className="export-paper-summary">
          <span>
            <FileText size={25} />
          </span>
          <div>
            <b>A4 · {settings.format === "docx" ? "可编辑 Word" : "高清 PDF"}</b>
            <small>{settings.format === "docx" ? "全部内容 · 由 Word / WPS 自动分页" : `${pageCount} 页简历 · 全程本机处理`}</small>
          </div>
          <ShieldCheck size={21} />
        </div>
        <Field
          label="导出文件名"
          value={settings.fileName}
          onChange={(fileName) => onChange({ fileName })}
          placeholder={`${name || "我的简历"}_Birchify.${settings.format}`}
        />
        <div className="export-switches">
          <SettingSwitch
            title="Birchify 品牌水印"
            description="关闭后移除左上角 Logo / 名称和右下角品牌标识"
            checked={settings.watermark}
            onChange={(watermark) => onChange({ watermark })}
          />
          <SettingSwitch
            title="底部页码"
            description="自动显示当前页 / 总页数"
            checked={settings.pageNumbers}
            onChange={(pageNumbers) => onChange({ pageNumbers })}
          />
          <SettingSwitch
            title="纸张背景"
            description={settings.format === "docx" ? "Word 仅使用纯色底色；不保留网页渐变、纹理与场景装饰" : "关闭后使用纯白纸张，保留模板装饰和图标"}
            checked={settings.background}
            onChange={(background) => onChange({ background })}
          />
        </div>
        {settings.format === "pdf" && <><label className="select-field">
          导出清晰度
          <select
            aria-label="导出清晰度"
            value={settings.quality}
            onChange={(e) =>
              onChange({
                quality: Number(e.target.value) as ExportSettings["quality"],
              })
            }
          >
            <option value="1.5">标准 · 较小文件</option>
            <option value="2">高清 · 推荐</option>
            <option value="3">超清 · 较大文件</option>
          </select>
        </label>
        <label className="select-field">
          导出范围
          <select
            aria-label="导出范围"
            value={settings.pages}
            onChange={(e) =>
              onChange({ pages: e.target.value as ExportSettings["pages"] })
            }
          >
            <option value="all">全部 {pageCount} 页</option>
            <option value="current">仅当前第 {currentPage} 页</option>
          </select>
        </label>
        </>}
        {settings.format === "docx" ? <p className="word-format-note">Word 导出全部可见栏目，采用适合编辑的单栏排版，自动分页与页码。文字、照片、作品图和链接均可编辑；熟练度转为百分比，复杂卡通装饰、图标与网页排版不保留。字体不嵌入：电脑未安装所选字体时会回退。需要原样效果请使用 PDF。</p> : <p className="export-format-note">
          <Layers size={15} />
          PDF 为高清图像格式，文字不可选取；可同时下载 JSON 备份以便继续编辑。
        </p>}
        <button className="primary-button export-start" onClick={onExport}>
          <ArrowDownToLine size={17} />
          开始导出
          {settings.format === "docx" ? " · Word 全部内容" : settings.pages === "all"
            ? ` · ${pageCount} 页`
            : ` · 第 ${currentPage} 页`}
        </button>
      </div>
    </Modal>
  );
}

function SettingSwitch({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="setting-switch-row">
      <span>
        <b>{title}</b>
        <small>{description}</small>
      </span>
      <button
        role="switch"
        aria-label={title}
        aria-checked={checked}
        className={`ios-switch ${checked ? "on" : ""}`}
        onClick={() => onChange(!checked)}
      >
        <span />
      </button>
    </div>
  );
}
