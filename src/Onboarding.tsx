import { useState } from "react";
import { ArrowRight, Download, GripVertical, Monitor, MousePointer2, ShieldCheck, Sparkles, ZoomIn } from "lucide-react";
import { BirchLogo } from "./icons";
import { Modal } from "./ui";
export const TOUR_KEY = "birchify-tour-v2";
export function needsTour() { try { return localStorage.getItem(TOUR_KEY) !== "seen"; } catch { return true; } }
const steps = [
  { title: "你的经历，值得好好呈现。", text: "从示例开始，或选择空白画布。所有编辑自动保存在这台设备，不需要注册。", icon: ShieldCheck, label: "LOCAL & YOURS" },
  { title: "先挑风格，再写故事。", text: "在「模板」挑选整页设计，再到「样式」调整背景、字体和颜色。切换模板不会改动你的内容。", icon: Sparkles, label: "MAKE IT YOURS" },
  { title: "拉近一点，轻松排版。", text: "预览可双指缩放，放大后单指移动查看。点内容打开编辑；开启「排版」，选中组件或栏目，再拖动唯一出现的手柄。", icon: ZoomIn, label: "A LITTLE CLOSER" },
  { title: "带着故事，走向下一站。", text: "PDF 与 Word 完整保真保留页面设计；Word 图文分层可编辑文字。导出前可关闭品牌水印。JSON 备份可以恢复到 Birchify 继续创作。", icon: Download, label: "READY FOR WHAT'S NEXT" },
];
export default function Onboarding({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [mobile] = useState(() => matchMedia("(max-width: 760px)").matches || /Android|iPhone|iPad/i.test(navigator.userAgent));
  const item = steps[step], Icon = item.icon;
  return <Modal title="欢迎来到 Birchify" subtitle="一分钟，认识你的简历工作室" onClose={onClose}>
    <div className="onboarding">
      <div className="tour-art" aria-hidden="true"><span className="tour-halo"/><BirchLogo size={76}/><i><Icon size={26}/></i><span className="tour-spark tour-spark-a">✦</span><span className="tour-spark tour-spark-b">✧</span></div>
      <div key={step} className="tour-copy"><small>{item.label}</small><h3>{item.title}</h3><p>{item.text}</p></div>
      {mobile && step === 0 && <div className="desktop-recommendation"><Monitor size={24}/><span><b>推荐使用电脑浏览器</b><small>大屏幕更适合精细排版与导出。手机也能继续编辑、缩放和导出，无需切换设备。</small></span></div>}
      {step === 2 && <div className="tour-gestures"><span><MousePointer2 size={18}/>点按编辑</span><span><GripVertical size={18}/>选中后拖动</span><span><ZoomIn size={18}/>双指缩放</span></div>}
      <div className="tour-dots" aria-label={`教程第 ${step+1} 步，共 4 步`}>{steps.map((s,i)=><button key={s.label} aria-label={`教程第 ${i+1} 步`} aria-current={i===step?"step":undefined} onClick={()=>setStep(i)}/>)}</div>
      <div className="tour-actions"><button className="secondary-button" onClick={onClose}>跳过引导</button><button className="primary-button" onClick={()=>step === steps.length-1 ? onClose() : setStep(step+1)}>{step === steps.length-1 ? "开始创作" : "下一步"}<ArrowRight size={17}/></button></div>
    </div>
  </Modal>;
}
