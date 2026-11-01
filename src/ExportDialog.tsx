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
      subtitle="保留你的整页设计，所有文件均在本机生成。"
      onClose={onClose}
    >
      <div className="export-settings">
        <div className="export-format-options" aria-label="导出格式">
          <button aria-pressed={settings.format === "pdf"} onClick={() => onChange({format:"pdf"})}>PDF<small>保留页面设计 · 便于投递</small></button>
          <button aria-pressed={settings.format === "docx"} onClick={() => onChange({format:"docx"})}>Word (.docx)<small>完整保真 / 图文分层可编辑</small></button>
        </div>
        {settings.format === "docx" && <label className="select-field">
          Word 导出方式
          <select aria-label="Word 导出方式" value={settings.wordMode || "faithful"}
            onChange={e => onChange({wordMode: e.target.value as ExportSettings["wordMode"]})}>
            <option value="faithful">完整保真 · 整页高清图像（推荐）</option>
            <option value="editable">图文分层 · 文字可编辑，图形保留</option>
          </select>
        </label>}
        <div className="export-paper-summary">
          <span>
            <FileText size={25} />
          </span>
          <div>
            <b>A4 · {settings.format === "docx" ? (settings.wordMode === "editable" ? "图文分层 Word" : "完整保真 Word") : "高清 PDF"}</b>
            <small>{pageCount} 页简历 · 与预览相同的分页</small>
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
            description="关闭后使用纯白纸张，保留模板装饰和图标"
            checked={settings.background}
            onChange={(background) => onChange({ background })}
          />
        </div>
        <label className="select-field">
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
        {settings.format === "docx" ? <p className="word-format-note">{settings.wordMode === "editable"
          ? "图文分层：保留页面背景、照片、图标、进度条与卡通装饰，文字使用按行定位的可编辑文本框，不再重排为单栏。图形合并为页面图像，不能逐个编辑；修改文字后不会自动重新分页。字体不嵌入，Word / WPS 的字体与字距可能有差异。要求原样效果请选择完整保真。"
          : "完整保真：将实际预览逐页以高清 PNG 嵌入 Word，保留所有可见组件、图标、进度条、照片、多栏排版、背景与卡通装饰。此模式页面文字不可直接编辑；需要改字可选「图文分层」，或导出 JSON 备份后回到 Birchify 编辑。"}</p> : <p className="export-format-note">
          <Layers size={15} />
          PDF 为高清图像格式，文字不可选取；可同时下载 JSON 备份以便继续编辑。
        </p>}
        <button className="primary-button export-start" onClick={onExport}>
          <ArrowDownToLine size={17} />
          开始导出
          {settings.pages === "all"
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
