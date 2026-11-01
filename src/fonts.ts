import type { ResumeData } from "./types";

export const fontOptions = [
  { value: "sans", label: "现代无衬线", family: "Microsoft YaHei", css: '-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif', note: "系统字体" },
  { value: "serif", label: "经典衬线", family: "SimSun", css: 'Georgia,"Songti SC",SimSun,serif', note: "系统字体" },
  { value: "mono", label: "理性等宽", family: "Consolas", css: '"SFMono-Regular",Consolas,"Microsoft YaHei",monospace', note: "系统字体" },
  { value: "wenkai", label: "霞鹜文楷", family: "LXGW WenKai", css: '"LXGW WenKai",serif', note: "温柔楷书" },
  { value: "noto-sans", label: "思源黑体", family: "Noto Sans SC", css: '"Noto Sans SC",sans-serif', note: "清晰现代" },
  { value: "noto-serif", label: "思源宋体", family: "Noto Serif SC", css: '"Noto Serif SC",serif', note: "书卷气质" },
  { value: "mashan", label: "马善政毛笔", family: "Ma Shan Zheng", css: '"Ma Shan Zheng",cursive', note: "遒劲手写" },
  { value: "zhimang", label: "志莽行书", family: "Zhi Mang Xing", css: '"Zhi Mang Xing",cursive', note: "洒脱行书" },
  { value: "kuaile", label: "站酷快乐体", family: "ZCOOL KuaiLe", css: '"ZCOOL KuaiLe",cursive', note: "圆趣童真" },
  { value: "xiaowei", label: "站酷小薇体", family: "ZCOOL XiaoWei", css: '"ZCOOL XiaoWei",serif', note: "秀雅宋意" },
  { value: "huangyou", label: "站酷庆科黄油体", family: "ZCOOL QingKe HuangYou", css: '"ZCOOL QingKe HuangYou",sans-serif', note: "方圆可爱" },
  { value: "liujian", label: "刘建毛草", family: "Liu Jian Mao Cao", css: '"Liu Jian Mao Cao",cursive', note: "飞扬草书" },
  { value: "longcang", label: "龙藏体", family: "Long Cang", css: '"Long Cang",cursive', note: "率性笔触" },
] as const;
const loaders: Record<string, () => Promise<unknown>> = {
  wenkai: () => import("@fontsource/lxgw-wenkai/500.css"),
  "noto-sans": () => import("@fontsource/noto-sans-sc/400.css"),
  "noto-serif": () => import("@fontsource/noto-serif-sc/400.css"),
  mashan: () => import("@fontsource/ma-shan-zheng/400.css"),
  zhimang: () => import("@fontsource/zhi-mang-xing/400.css"),
  kuaile: () => import("@fontsource/zcool-kuaile/400.css"),
  xiaowei: () => import("@fontsource/zcool-xiaowei/400.css"),
  huangyou: () => import("@fontsource/zcool-qingke-huangyou/400.css"),
  liujian: () => import("@fontsource/liu-jian-mao-cao/400.css"),
  longcang: () => import("@fontsource/long-cang/400.css"),
};
export const fontFor = (id: ResumeData["font"]) => fontOptions.find(f => f.value === id) || fontOptions[0];
const loaded = new Map<string, Promise<void>>();
export function loadFont(id: ResumeData["font"], text = "简历林予安工作经历教育背景") {
  if (!loaders[id]) return Promise.resolve();
  if (!loaded.has(id)) loaded.set(id, loaders[id]().then(() => undefined).catch(e => { loaded.delete(id); throw e; }));
  return loaded.get(id)!.then(async () => {
    await document.fonts.load(`${id === "wenkai" ? 500 : 400} 16px "${fontFor(id).family}"`, text || "简历");
    await document.fonts.ready;
  });
}
