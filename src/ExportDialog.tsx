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
  const ats = settings.format === "ats";
  return (
    <Modal
      title="让下一站，看见你。"
      subtitle="选择保留设计，或为招聘系统生成易读文字。所有文件均在本机生成。"
      onClose={onClose}
    >
      <div className="export-settings">
        <div className="export-format-options" aria-label="导出格式">
          <button aria-pressed={!ats} onClick={() => onChange({format:"pdf"})}>设计版 PDF<small>完整页面设计 · 高清图像</small></button>
          <button aria-pressed={ats} onClick={() => onChange({format:"ats"})}>ATS 友好 PDF<small>单栏真实文字 · 可搜索复制</small></button>
        </div>
        <div className="export-paper-summary">
          <span>
            <FileText size={25} />
          </span>
          <div>
            <b>A4 · {ats ? "ATS 友好 PDF" : "高清 PDF"}</b>
            <small>{ats ? "全部可见内容 · 单栏独立分页" : `${pageCount} 页简历 · 与预览相同的分页`}</small>
          </div>
          <ShieldCheck size={21} />
        </div>
        <Field
          label="导出文件名"
          value={settings.fileName}
          onChange={(fileName) => onChange({ fileName })}
          placeholder={`${name || "我的简历"}_${ats ? "ATS" : "Birchify"}.pdf`}
        />
        {!ats && <><div className="export-switches">
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
        </label></>}
        {ats ? <div className="ats-format-note">
          <b>为内容识别，主动简化排版</b>
          <p>按当前栏目与组件顺序导出全部可见内容。保留姓名、联系方式、经历、日期和链接；技能进度转为百分比，标签转为文本，图片组件只保留文字说明。</p>
          <p>统一使用内嵌开源中文字体，黑字白底、单栏自动分页。不包含照片、图标、装饰、品牌水印和页脚；不沿用设计预览的当前页。图中信息请先补充为文字，隐藏栏目不会导出。</p>
          <p>不同 ATS 的解析规则不同，无法保证所有系统的识别结果。原设计与设计版导出选项保持不变。</p>
        </div> : <p className="export-format-note">
          <Layers size={15} />
          PDF 为高清图像格式，文字不可选取；可同时下载 JSON 备份以便继续编辑。
        </p>}
        <button className="primary-button export-start" onClick={onExport}>
          <ArrowDownToLine size={17} />
          开始导出
          {ats ? " · ATS 友好 PDF" : settings.pages === "all"
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
