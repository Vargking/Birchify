import type { CSSProperties } from "react";

export interface ResumeDesign {
  flow: "single" | "equal" | "left" | "right" | "triple";
  header: string;
  panel: string;
  heading: string;
  surface: string;
  description: string;
  paper?: string;
  secondary?: string;
}

const papers: Record<string, string> = { clean: "#ffffff", news: "#faf9f3", soft: "#f3f6f0", side: "#f4f7f5", petal: "#fff6f8", code: "#f4f6f7", clay: "#fcf2e9", split: "#f1f6f7", gallery: "#faf8f3", formal: "#fffdf8", sky: "#f1f7fd", linen: "#faf5eb", ink: "#f3f3f1", swiss: "#fff9f3", geo: "#fff6e7", blueprint: "#eef5fc", museum: "#f7f3ed", wave: "#edf7f9", grid: "#f5f0fc" };
const d = (flow: ResumeDesign["flow"], header: string, panel: string, heading: string, surface: string, description: string, paper?: string, secondary?: string): ResumeDesign => ({ flow, header, panel, heading, surface, description, paper: paper || papers[surface] || "#fff", secondary });

// Each entry is an art direction, not a palette preset. These recipes are shared
// by the actual A4 pages, their measurement copies and the template thumbnails.
export const designs: Record<string, ResumeDesign> = {
  birch: d("single", "plain", "open", "line", "clean", "舒展单栏 · 植物留白 · 细线标题"),
  editorial: d("equal", "poster", "rule", "index", "news", "报刊双栏 · 巨幅姓名 · 数字索引"),
  sage: d("left", "profile", "bubble", "pill", "soft", "窄左宽右 · 柔软档案卡 · 胶囊标题"),
  midnight: d("right", "banner", "open", "ribbon", "side", "宽左窄右 · 深色通栏 · 侧边色块"),
  bloom: d("single", "center", "outline", "stamp", "petal", "花窗单栏 · 居中名片 · 双线印章"),
  mono: d("single", "terminal", "rule", "label", "code", "终端档案 · 等宽字符 · 编号标签"),
  terracotta: d("equal", "ticket", "ticket", "tab", "clay", "双列票券 · 撕口卡片 · 陶色页眉"),
  nordic: d("right", "plain", "rule", "line", "split", "非对称双栏 · 冷调分区 · 简练细线"),
  atelier: d("single", "poster", "rail", "index", "gallery", "作品叙事 · 左侧标题轨道 · 大字海报"),
  executive: d("single", "banner", "rule", "stamp", "formal", "庄重通栏 · 双线抬头 · 公文分隔"),
  olive: d("left", "badge", "open", "tab", "side", "侧栏履历 · 徽章式个人信息 · 抽签标题"),
  azure: d("equal", "center", "open", "pill", "sky", "对称双栏 · 居中联系卡 · 晴空色带"),
  sand: d("single", "letter", "note", "label", "linen", "信纸叙事 · 宽边便笺 · 亚麻底纹"),
  ink: d("single", "poster", "rule", "ribbon", "ink", "黑白宣言 · 横向粗线 · 反白标题"),
  lavender: d("equal", "badge", "bubble", "stamp", "soft", "双栏圆角档案 · 浮起徽章 · 紫色章印"),
  forest: d("left", "banner", "outline", "line", "split", "林间双栏 · 有框资料 · 深绿抬头"),
  coral: d("single", "ticket", "bubble", "pill", "clay", "珊瑚邀请函 · 圆角气泡 · 券式页眉"),
  slate: d("triple", "terminal", "open", "index", "code", "三栏技术档案 · 终端抬头 · 坐标编号"),
  golden: d("single", "center", "rail", "stamp", "formal", "金色履历 · 居中姓名 · 侧标题栏"),
  mint: d("equal", "profile", "rule", "tab", "split", "薄荷双栏 · 横排头像 · 书签分组"),
  swiss: d("equal", "poster", "rail", "label", "swiss", "瑞士网格 · 左对齐海报 · 结构化侧标"),
  bauhaus: d("right", "poster", "outline", "index", "geo", "包豪斯构成 · 几何页眉 · 不等宽双栏"),
  blueprint: d("equal", "terminal", "outline", "tab", "blueprint", "工程蓝图 · 技术网格 · 装订式双栏"),
  museum: d("single", "badge", "rail", "label", "museum", "展签档案 · 侧标叙事 · 画框留白"),
  graphite: d("left", "terminal", "rule", "ribbon", "ink", "石墨面板 · 深浅分区 · 反白分组"),
  moss: d("single", "profile", "outline", "ribbon", "side", "苔原档案 · 左侧色带 · 有框长叙事"),
  apricot: d("equal", "letter", "note", "label", "linen", "杏色双页手札 · 信笺页眉 · 便签栏"),
  seaside: d("right", "center", "open", "line", "wave", "海岸双栏 · 波浪分隔 · 居中名片"),
  gallery: d("triple", "poster", "outline", "stamp", "gallery", "三列展览目录 · 巨幅抬头 · 作品边框"),
  "violet-grid": d("equal", "ticket", "window", "index", "grid", "窗口档案 · 双栏网格 · 窗格编号"),
  "modern-lines": d("single", "terminal", "rail", "line", "swiss", "线性履历 · 侧栏标签 · 摩登线性抬头"),
  studio: d("right", "badge", "ticket", "label", "clay", "独立工作室 · 双色徽章 · 票据式分栏"),
  "cat-letter": d("single", "letter", "tape", "stamp", "letter", "小猫信封 · 邮票页眉 · 胶带手写信纸", "#fff8ed", "#edc8bb"),
  "cat-nap": d("equal", "badge", "bubble", "pill", "cushion", "猫咪午睡房 · 双栏软垫 · 奶紫气泡", "#f5effd", "#d8c9ee"),
  "dog-walk": d("single", "ticket", "rail", "tab", "trail", "小狗散步地图 · 脚印路线 · 路牌侧栏", "#fff8e7", "#e5c996"),
  "dog-letter": d("left", "profile", "stitch", "label", "journal", "小狗活页本 · 左侧资料袋 · 缝线方格纸", "#eff8f8", "#bedce0"),
  "bear-honey": d("right", "badge", "ticket", "ribbon", "honey", "蜂蜜小铺 · 双栏蜂蜜罐 · 滴蜜招牌", "#fff7d9", "#eac878"),
  "bear-forest": d("equal", "banner", "stitch", "tab", "forest", "森林露营手册 · 双栏布章 · 山丘页边", "#f0f5e8", "#c1d2a4"),
  "flower-day": d("single", "center", "petal", "pill", "garden", "花瓣相册 · 波浪花框 · 圆形花心标题", "#fff0f3", "#efbecd"),
  "flower-notes": d("equal", "letter", "tape", "stamp", "journal", "小花拼贴本 · 双栏胶带便签 · 方格花纸", "#fffae9", "#e8d891"),
  "flower-garden": d("left", "profile", "outline", "ribbon", "garden", "花园温室 · 拱形名片 · 栅栏双栏", "#f2f7e9", "#c6d4aa"),
  rabbit: d("right", "center", "bubble", "tab", "cushion", "兔兔愿望屋 · 云朵圆角 · 粉色不等宽双栏", "#fff0f5", "#eac2d4"),
  bird: d("single", "ticket", "ticket", "stamp", "postcard", "小鸟旅行明信片 · 机票分组 · 航线虚线", "#eff9fb", "#aed8e3"),
  fox: d("left", "banner", "stitch", "index", "trail", "狐狸探险地图 · 双栏冒险档案 · 罗盘与山丘", "#fff4e8", "#e7c39b"),
  cloud: d("equal", "center", "cloud", "pill", "sky", "云端棉花糖 · 双栏云团 · 整页蓝天弧线", "#edf5ff", "#c8d9f3"),
  sun: d("single", "poster", "bubble", "ribbon", "sunny", "阳光广播站 · 放射大标题 · 奶油色笑脸卡", "#fff9dc", "#efdc84"),
  star: d("triple", "badge", "window", "tab", "cosmos", "星星收藏柜 · 三列展示窗 · 星座相框", "#f6efff", "#d4c1ee"),
  moon: d("right", "letter", "note", "stamp", "night", "月亮口袋书 · 夜空侧栏 · 奶蓝信纸", "#edf0ff", "#c5cce8"),
  planet: d("equal", "terminal", "window", "index", "cosmos", "宇宙舱档案 · 双栏舷窗 · 轨道编号", "#f6effd", "#d9c4ed"),
  leaf: d("single", "profile", "tape", "label", "forest", "发芽观察日记 · 植物胶带 · 生长记录纸", "#f0f8e9", "#c6dcac"),
  "panda-bamboo": d("left", "arch", "bamboo", "leaf", "bamboo", "竹林档案 · 竹节侧栏 · 圆拱熊猫名片", "#f1f7ea", "#c3d7b3"),
  "alpaca-cafe": d("equal", "awning", "scallop", "pill", "teahouse", "羊驼奶茶店 · 条纹雨棚 · 双栏杯垫卡", "#faf4e8", "#d7cbb7"),
  "red-panda-mail": d("right", "parcel", "parcel", "stamp", "parcel", "森林邮局 · 包裹页眉 · 邮票双栏信件", "#fff3e7", "#ebc5a4"),
  "turtle-orchard": d("single", "arch", "basket", "leaf", "orchard", "小龟果园 · 藤篮栏目 · 拱门果树名片", "#fff8e7", "#dbd59e"),
  "hamster-bakery": d("equal", "awning", "scallop", "tab", "bakery", "面包房菜单 · 扇贝纸托 · 双栏烘焙档案", "#fff6df", "#e9ce9b"),
  "chinchilla-pocket": d("left", "profile", "pocket", "label", "pocket", "绒鼠口袋本 · 左侧小卡袋 · 全页缝线圆点", "#f6f0fb", "#d8c9e7"),
  "pig-studio": d("equal", "poster", "polaroid", "index", "confetti", "粉色画室 · 拼贴拍立得 · 撞色画纸双栏", "#fff0f4", "#edc5d5"),
  "cow-picnic": d("single", "basket", "quilt", "pill", "gingham", "奶牛野餐 · 格纹餐布 · 便当式全宽栏目", "#fff9ef", "#d5dabb"),
  "peacock-song": d("single", "song", "rail", "note", "aviary", "孔雀音乐会 · 五线谱页眉 · 音符侧标题", "#edf8f8", "#badadd"),
  "raccoon-night": d("right", "awning", "window", "ribbon", "nightmarket", "晚安夜市 · 灯串招牌 · 双栏小店橱窗", "#f4f0fb", "#d3c7e5"),
  "tiger-play": d("equal", "ticket", "block", "index", "playground", "积木游乐园 · 拼色拱桥 · 双栏积木档案", "#fff7de", "#ecd092"),
  "lion-sun": d("single", "arch", "sunburst", "ribbon", "savanna", "草原日光屋 · 日晕姓名 · 太阳花边卡", "#fff9e6", "#e9d799"),
  "frog-pond": d("left", "pond", "pond", "leaf", "pond", "荷塘日记 · 荷叶个人名片 · 水滴气泡双栏", "#edf8ee", "#bddbc6"),
  "sheep-cloud": d("equal", "cloud", "cloud", "pill", "wool", "绵羊织梦 · 云团抬头 · 毛线双栏棉花卡", "#faf1f6", "#e2ccd9"),
  "otter-river": d("right", "wave", "ripple", "tab", "river", "河流漂流记 · 波纹通栏 · 河岸日记双栏", "#edf7f6", "#bcd9d7"),
  "penguin-ice": d("equal", "awning", "ice", "stamp", "ice", "冰淇淋站 · 冰川色块 · 双栏冰棒卡片", "#eff5fe", "#c6d9ef"),
  "duck-puddle": d("single", "letter", "raincoat", "note", "puddle", "雨后手札 · 雨衣口袋 · 点点雨滴记录纸", "#fffbe6", "#d5dfb5"),
  "deer-meadow": d("left", "arch", "petal", "leaf", "meadow", "野花采集册 · 花草拱窗 · 植物标本双栏", "#faf6e9", "#d9d6b5"),
  "koala-leaf": d("right", "profile", "leaf", "pill", "gumtree", "桉树慢生活 · 叶片分区 · 不等宽剪贴纸", "#eff6ef", "#c9dccd"),
  "hedgehog-mushroom": d("single", "cottage", "scallop", "stamp", "mushroom", "蘑菇小屋 · 屋顶名片 · 蘑菇花边长叙事", "#fff4ec", "#e7c5b8"),
  "squirrel-acorn": d("triple", "basket", "pocket", "tab", "acorn", "橡果收藏柜 · 三列小抽屉 · 森林收纳档案", "#faf3e4", "#dcc8a2"),
  "seal-soda": d("equal", "wave", "bubble", "note", "soda", "苏打海洋 · 波浪页眉 · 透明气泡双栏", "#eefbfa", "#bce2df"),
  "capybara-spa": d("single", "pond", "stone", "label", "spa", "柚子温泉 · 鹅卵石卡片 · 蒸汽小浴池页眉", "#f8f6e9", "#d7d4ae"),
  "elephant-dream": d("right", "cloud", "quilt", "pill", "dream", "气球旅行 · 云朵页眉 · 拼布口袋双栏", "#f5f2fe", "#d5ccec"),
  blank: d("single", "blank", "open", "line", "clean", "纯白画布 · 无装饰 · 从零填写"),
};

export function designFor(id: string): ResumeDesign { return designs[id] || designs.birch; }
export function designClasses(id: string, cartoon = false) {
  const d = designFor(id);
  return `design-${id} flow-${d.flow} header-${d.header} panel-${d.panel} heading-${d.heading} surface-${d.surface}${cartoon ? " cartoon-document" : ""}`;
}
export function designVariables(id: string): CSSProperties {
  const d = designFor(id);
  return { "--design-paper": d.paper || "#fff", "--design-secondary": d.secondary || "#e8ede7" } as CSSProperties;
}
export function columnWeights(id: string) {
  const flow = designFor(id).flow;
  return flow === "equal" ? [1, 1] : flow === "left" ? [0.8, 1.2] : flow === "right" ? [1.2, 0.8] : flow === "triple" ? [1, 1, 1] : [1];
}
