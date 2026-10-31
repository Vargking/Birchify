import { useState } from "react";
import {
  Award,
  Bike,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  Camera,
  ChartNoAxesColumnIncreasing,
  CheckCircle2,
  ChevronDown,
  Cloud,
  Code2,
  Coffee,
  Compass,
  Cpu,
  Database,
  FileText,
  Film,
  Flag,
  Flame,
  Flower2,
  FolderOpen,
  GitBranch,
  Globe2,
  GraduationCap,
  Headphones,
  Heart,
  HeartHandshake,
  Languages,
  Layers,
  LayoutGrid,
  Leaf,
  Lightbulb,
  Link,
  Mail,
  MapPin,
  Medal,
  MessageCircle,
  Mic,
  Monitor,
  Moon,
  Mountain,
  MousePointer2,
  Music,
  Palette,
  PenTool,
  Phone,
  PieChart,
  Plane,
  Presentation,
  Puzzle,
  Rocket,
  Search,
  Settings,
  ShieldCheck,
  Smartphone,
  Smile,
  Sparkles,
  Star,
  Sun,
  Target,
  Terminal,
  TreePine,
  TrendingUp,
  Trophy,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Artwork } from "./Artwork";
import { animalNames } from "./CuteAnimals";
import type { Motif } from "./types";

export const iconLibrary: {
  id: string;
  name: string;
  icon?: LucideIcon;
  motif?: Motif;
}[] = [
  ...(
    [
      ["sparkles", "灵感", Sparkles],
      ["star", "星星", Star],
      ["heart", "爱心", Heart],
      ["award", "奖项", Award],
      ["trophy", "奖杯", Trophy],
      ["medal", "荣誉", Medal],
      ["graduation", "教育", GraduationCap],
      ["briefcase", "工作", Briefcase],
      ["building", "公司", Building2],
      ["book", "阅读", BookOpen],
      ["lightbulb", "创意", Lightbulb],
      ["target", "目标", Target],
      ["compass", "方向", Compass],
      ["rocket", "成长", Rocket],
      ["globe", "世界", Globe2],
      ["pin", "地点", MapPin],
      ["mail", "邮箱", Mail],
      ["phone", "电话", Phone],
      ["link", "链接", Link],
      ["code", "代码", Code2],
      ["terminal", "开发", Terminal],
      ["database", "数据", Database],
      ["monitor", "电脑", Monitor],
      ["mobile", "手机", Smartphone],
      ["pen", "设计", PenTool],
      ["palette", "色彩", Palette],
      ["camera", "摄影", Camera],
      ["music", "音乐", Music],
      ["headphones", "聆听", Headphones],
      ["film", "视频", Film],
      ["mic", "演讲", Mic],
      ["presentation", "展示", Presentation],
      ["chart", "能力", ChartNoAxesColumnIncreasing],
      ["pie", "分析", PieChart],
      ["trend", "增长", TrendingUp],
      ["check", "完成", CheckCircle2],
      ["shield", "安全", ShieldCheck],
      ["zap", "效率", Zap],
      ["flame", "热情", Flame],
      ["sun", "阳光", Sun],
      ["moon", "夜晚", Moon],
      ["cloud", "云朵", Cloud],
      ["flower", "花朵", Flower2],
      ["leaf", "植物", Leaf],
      ["tree", "森林", TreePine],
      ["mountain", "探索", Mountain],
      ["coffee", "咖啡", Coffee],
      ["plane", "旅行", Plane],
      ["bike", "运动", Bike],
      ["smile", "笑脸", Smile],
      ["puzzle", "解题", Puzzle],
      ["users", "团队", Users],
      ["message", "沟通", MessageCircle],
      ["language", "语言", Languages],
      ["calendar", "日期", Calendar],
      ["flag", "里程碑", Flag],
      ["folder", "项目", FolderOpen],
      ["file", "文档", FileText],
      ["search", "研究", Search],
      ["settings", "工具", Settings],
      ["layers", "系统", Layers],
      ["layout", "布局", LayoutGrid],
      ["pointer", "交互", MousePointer2],
      ["cpu", "技术", Cpu],
      ["handshake", "协作", HeartHandshake],
      ["git", "版本", GitBranch],
    ] as [string, string, LucideIcon][]
  ).map(([id, name, icon]) => ({ id, name, icon })),
  ...(
    [
      "cat",
      "dog",
      "bear",
      "flower",
      "rabbit",
      "bird",
      "fox",
      "cloud",
      "sun",
      "star",
      "moon",
      "planet",
      "leaf",
    ] as Motif[]
  ).map((motif, i) => ({
    id: `original-${motif}`,
    name: [
      "栖栖猫",
      "豆豆犬",
      "栗栗熊",
      "朵朵花",
      "长耳兔",
      "啾啾鸟",
      "枫枫狐",
      "绵绵云",
      "小太阳",
      "许愿星",
      "口袋月亮",
      "小宇宙",
      "新芽",
    ][i],
    motif,
  })),
  ...Object.entries(animalNames).filter(([motif]) => !["cat", "dog"].includes(motif)).map(([motif, name]) => ({ id: `original-${motif}`, name, motif: motif as Motif })),
];

export function DecorationIcon({
  name,
  size = 18,
}: {
  name: string;
  size?: number;
}) {
  const entry = iconLibrary.find((icon) => icon.id === name);
  if (!entry) return null;
  if (entry.motif) return <Artwork motif={entry.motif} size={size} />;
  const Icon = entry.icon!;
  return <Icon size={size} strokeWidth={1.8} />;
}

export function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const selected = iconLibrary.find((i) => i.id === value);
  return (
    <div className="icon-picker">
      <button
        className="icon-picker-toggle"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <span>
          组件图标 <small>{iconLibrary.length} 款</small>
        </span>
        <span>
          {value ? (
            <DecorationIcon name={value} size={22} />
          ) : (
            <Sparkles size={17} />
          )}
          <b>{selected?.name || "选择图标"}</b>
          <ChevronDown size={14} />
        </span>
      </button>
      {open && (
        <div className="icon-picker-panel">
          <label className="icon-search">
            <Search size={14} />
            <input
              placeholder="搜索图标，如：猫、设计、团队…"
              aria-label="搜索组件图标"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <div className="icon-filter">
            <button
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
            >
              全部
            </button>
            <button
              className={filter === "original" ? "active" : ""}
              onClick={() => setFilter("original")}
            >
              原创卡通
            </button>
            <button
              className={!value ? "active" : ""}
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              无图标
            </button>
          </div>
          <div className="icon-palette">
            {iconLibrary
              .filter(
                (i) =>
                  (filter === "all" || i.motif) &&
                  (i.name.includes(query) ||
                    i.id.includes(query.toLowerCase())),
              )
              .map((icon) => (
                <button
                  key={icon.id}
                  className={value === icon.id ? "selected" : ""}
                  title={icon.name}
                  aria-label={`图标：${icon.name}`}
                  onClick={() => {
                    onChange(icon.id);
                    setOpen(false);
                  }}
                >
                  <DecorationIcon name={icon.id} size={27} />
                  <small>{icon.name}</small>
                </button>
              ))}
          </div>
          <p className="icon-picker-note">
            矢量图标随应用打包 · 卡通图案均为原创绘制
          </p>
        </div>
      )}
    </div>
  );
}
