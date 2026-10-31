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
      subtitle="导出设置会同步到预览，所见即所得。"
      onClose={onClose}
    >
      <div className="export-settings">
        <div className="export-paper-summary">
          <span>
            <FileText size={25} />
          </span>
          <div>
            <b>A4 · 高清 PDF</b>
            <small>{pageCount} 页简历 · 全程本机处理</small>
          </div>
          <ShieldCheck size={21} />
        </div>
        <Field
          label="导出文件名"
          value={settings.fileName}
          onChange={(fileName) => onChange({ fileName })}
          placeholder={`${name || "我的简历"}_Birchify.pdf`}
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
        <p className="export-format-note">
          <Layers size={15} />
          PDF 为高清图像格式，文字不可选取；可同时下载 JSON 备份以便继续编辑。
        </p>
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
