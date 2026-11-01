import { createRoot } from "react-dom/client";
import type { CSSProperties, ReactNode } from "react";
import {
  ArrowDownToLine, ArrowRight, Check, CheckCheck, ChevronDown,
  CircleCheck, FileText, GripVertical, Layers3, LayoutTemplate, MousePointer2,
  Palette, Pencil, Plus, ShieldCheck, Sparkles, Type, X,
} from "lucide-react";
import { Artwork } from "../../src/Artwork";
import { BirchLogo } from "../../src/icons";
import { createComponent, createDefaultResume, templates, backgrounds } from "../../src/data";
import { ComponentContent } from "../../src/ResumePreview";
import PagedResume from "../../src/PagedResume";
import type { ComponentType, Motif, ResumeComponent } from "../../src/types";
import "@fontsource/noto-sans-sc/400.css";
import "@fontsource/noto-sans-sc/700.css";
import "@fontsource/zcool-kuaile/400.css";
import "@fontsource/lxgw-wenkai/500.css";
import "../../src/styles.css";
import "../../src/designs.css";
import "../../src/expansion.css";
import "../../src/refinements.css";
import "./posters.css";

const noop = () => {};
const cartoonCount = templates.filter(t => t.category === "cartoon").length;

function Mascot({ name, size = 180, className = "", style }: {
  name: Motif; size?: number; className?: string; style?: CSSProperties;
}) {
  return <Artwork motif={name} size={size} className={`mascot ${className}`} style={style} />;
}

function Flower({ size = 60, color = "#edbc92", className = "", style }: {
  size?: number; color?: string; className?: string; style?: CSSProperties;
}) {
  return <svg width={size} height={size} viewBox="0 0 100 100" className={`doodle-flower ${className}`} style={style} aria-hidden="true">
    {[0, 60, 120, 180, 240, 300].map(a => <ellipse key={a} cx="50" cy="27" rx="15" ry="23" fill={color} transform={`rotate(${a} 50 50)`} />)}
    <circle cx="50" cy="50" r="16" fill="#fff5d3" /><circle cx="45" cy="49" r="2" fill="#45624c" /><circle cx="55" cy="49" r="2" fill="#45624c" />
    <path d="M46 55q4 4 8 0" stroke="#45624c" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>;
}

function Star({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return <svg width="48" height="58" viewBox="0 0 48 58" className={`doodle-star ${className}`} style={style} aria-hidden="true">
    <path d="M24 1q1 25 23 28Q25 31 24 57Q22 31 1 29Q22 26 24 1Z" fill="currentColor" />
  </svg>;
}

function Sheet({ template, scale = .4, className = "", style }: {
  template: string; scale?: number; className?: string; style?: CSSProperties;
}) {
  const recipe = templates.find(t => t.id === template)!;
  if (!recipe) throw new Error(`Unknown template: ${template}`);
  const data = createDefaultResume();
  data.template = template;
  data.accent = recipe.color;
  data.font = "sans";
  data.fontSize = 14;
  data.lineHeight = 1.45;
  data.pagePadding = 44;
  data.website = "";
  data.role = "产品设计师 / PRODUCT DESIGNER";
  data.sections[0].components[0].description = "把好奇心变成创造力。擅长用户研究、交互设计与视觉表达，用设计连接有趣的想法与真实的生活。";
  data.sections[1].components = data.sections[1].components.slice(0, 1);
  data.sections[1].components[0].description = "负责产品体验与设计系统，让复杂的流程变得清晰、友好。主导核心产品体验升级，关键流程转化率提升 28%。";
  data.sections[3].components[0].description = "从用户访谈到产品上线，打造温暖的生活方式社区，完成品牌与产品体验设计。";
  data.sections[4].components = [data.sections[4].components[0], data.sections[4].components[2]];
  data.sections = data.sections.filter(section => section.id !== "education");
  if (template === "cat-letter") data.sections = data.sections.filter(section => section.id !== "projects");
  return <div className={`sheet-shell ${className}`} style={{ width: 794 * scale, height: 1123 * scale, ...style }}>
    <div className="sheet-render" style={{ transform: `scale(${scale})` }}>
      <PagedResume data={data} onPageCount={noop} editable={false} onEdit={noop} onCommit={noop} onAddSection={noop} onAddComponent={noop} />
    </div>
  </div>;
}

function Piece({ type, ...overrides }: { type: ComponentType } & Partial<ResumeComponent>) {
  const item = { ...createComponent(type), spacing: 0, fontSize: 24, ...overrides };
  return <ComponentContent item={item} accent="#3c6553" />;
}

function Tag({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <div className={`tag ${className}`} style={style}>{children}</div>;
}

function Poster({ id, slug, theme, category, children }: {
  id: number; slug: string; theme: string; category: string; children: ReactNode;
}) {
  return <section className={`poster theme-${theme} poster-${id}`} data-file={`${String(id).padStart(2, "0")}-${slug}.png`}>
    <header className="poster-brand" data-safe="brand"><BirchLogo size={48} /><b>Birchify</b><span>让每份经历，自在生长。</span></header>
    <div className="edition">{String(id).padStart(2, "0")}<span>/ 09</span></div>
    <div className="paper-grain" />
    {children}
    <footer className="poster-footer" data-safe="footer"><span>Birchify · 简历制作工具</span><span>{category}<i />Designed by Vargking</span></footer>
  </section>;
}

function Cover() {
  return <Poster id={1} slug="hello-birchify" theme="cream" category="你好，Birchify">
    <div className="headline" data-safe="headline"><h1>简历，也可以<br /><em>可爱得很认真。</em></h1><p>原创卡通模板 × 自由拖拽编辑</p></div>
    <div className="free-seal" data-safe="free badge"><Sparkles size={30} /><strong>完全免费</strong><span>无广告</span></div>
    <div className="cover-halo" />
    <Sheet template="panda-bamboo" scale={.355} className="cover-left" />
    <Sheet template="cat-letter" scale={.445} className="cover-center" />
    <Sheet template="hamster-bakery" scale={.345} className="cover-right" />
    <Tag className="cover-label"><Flower size={34} />把简历，做成喜欢的样子</Tag>
    <Tag className="cover-drag"><GripVertical size={27} />拖一拖，就很对</Tag>
    <Mascot name="cat" size={230} className="cover-cat" />
    <Mascot name="hamster" size={210} className="cover-hamster" />
    <Star className="cover-star" /><Flower size={75} className="cover-flower" color="#dfcaed" />
  </Poster>;
}

const friends: [Motif, string, string, string][] = [
  ["cat", "猫咪信笺", "把故事寄给未来", "#f9dfbf"],
  ["dog", "小狗散步", "沿着脚印出发", "#dbe9d3"],
  ["panda", "熊猫竹林", "带一点松弛感", "#dce7c2"],
  ["red-panda", "小熊猫邮局", "签收新的可能", "#f5d7bf"],
  ["hamster", "仓鼠面包房", "烘焙一份热爱", "#f6e4af"],
  ["pig", "小猪画室", "灵感不必打烊", "#efd1dd"],
  ["frog", "青蛙荷塘", "今天也有新芽", "#d6e8d7"],
  ["raccoon", "浣熊晚安集", "收藏闪光时刻", "#dfd4ed"],
  ["sheep", "绵羊云朵", "温柔也有力量", "#ecdfed"],
];

function Friends() {
  return <Poster id={2} slug="original-cute-templates" theme="peach" category="原创卡通模板">
    <div className="headline" data-safe="headline"><h1>今天，选哪只<br /><em>做你的求职搭子？</em></h1><p>每个主题，都有自己的小世界。</p></div>
    <div className="count-sticker" data-safe="template count"><strong>{cartoonCount}</strong><span>款原创<br />卡通模板</span></div>
    <div className="friends-grid">
      {friends.map(([name, title, caption, color], i) => <div className={`friend-card friend-${i}`} key={name} style={{ "--friend": color } as CSSProperties}>
        <div className="friend-scenery" /><Mascot name={name} size={128} /><div className="friend-copy" data-safe={`friend ${name}`}><h2>{title}</h2><p>{caption}</p></div>
      </div>)}
    </div>
    <Tag className="friends-note"><Plus size={24} />还有树懒、鲸鱼、六角龙等更多原创伙伴</Tag>
  </Poster>;
}

function WholePage() {
  return <Poster id={3} slug="a-whole-cute-world" theme="butter" category="整页可爱设计">
    <div className="headline" data-safe="headline"><h1>不是贴个小动物。<br /><em>是整页都很可爱。</em></h1><p>页眉、栏目、背景，认真可爱到每个角落。</p></div>
    <div className="bakery-backdrop" />
    <Sheet template="hamster-bakery" scale={.49} className="whole-sheet" />
    <div className="design-notes">
      <div data-safe="design note 1"><span>01</span><h2>主题页眉</h2><p>条纹雨棚，开张啦</p><i className="awning-doodle" /></div>
      <div data-safe="design note 2"><span>02</span><h2>特色栏目</h2><p>像刚出炉的奶油纸托</p><i className="scallop-doodle" /></div>
      <div data-safe="design note 3"><span>03</span><h2>整页氛围</h2><p>烘焙色与原创小装饰</p><Flower size={44} color="#ecc28a" /></div>
    </div>
    <Mascot name="hamster" size={210} className="bakery-mascot" />
    <div className="bakery-tag">今日推荐<br /><b>热爱 · 新鲜出炉</b></div>
    <Star className="bakery-star" />
  </Poster>;
}

function Drag() {
  return <Poster id={4} slug="drag-and-make-it-yours" theme="lilac" category="拖拽排版">
    <div className="headline" data-safe="headline"><h1>排版不用猜。<br /><em>拖到喜欢的位置。</em></h1><p>组件与栏目，都能拖。移动过程，实时看见。</p></div>
    <div className="editor-window">
      <div className="window-bar"><span className="window-dots"><i /><i /><i /></span><span><BirchLogo size={25} />Birchify</span><span className="window-export"><ArrowDownToLine size={19} />导出</span></div>
      <aside className="editor-rail"><small>我的栏目</small>{["关于我", "工作经历", "专业技能"].map((s, i) => <div className={i === 2 ? "rail-active" : ""} key={s}><GripVertical size={21} />{s}<ChevronDown size={18} /></div>)}<span className="rail-add"><Plus size={19} />添加栏目</span><Mascot name="raccoon" size={138} /></aside>
      <div className="editor-canvas"><div className="canvas-title">林予安 <span>个人简历</span></div><div className="static-unit"><span>工作经历</span><b>产品设计师</b><p>让复杂的体验，变得清晰温暖。</p></div><div className="drop-zone"><Plus size={29} /><span>把组件放在这里</span></div></div>
      <svg className="drag-path" viewBox="0 0 950 480" aria-hidden="true"><path d="M210 230C270 330 290 200 400 295" fill="none" stroke="#9e8bb9" strokeWidth="3" strokeDasharray="8 10" strokeLinecap="round" /></svg>
      <div className="floating-unit"><div className="floating-title"><GripVertical size={27} /><span>技能熟练度</span><Check size={22} /></div><Piece type="progress" title="创意表达" value={90} style="bar" color="#8d76a5" fontSize={25} /></div>
      <MousePointer2 size={79} fill="#345b4b" stroke="#fffdf3" strokeWidth={1.4} className="drag-cursor" />
    </div>
    <Tag className="drag-caption" data-safe="drag caption"><MousePointer2 size={26} />鼠标 / 手指，拖着就走</Tag>
    <span className="interaction-note" data-safe="interaction note">拖拽交互示意</span>
    <Flower size={65} className="drag-flower" color="#f1c6a3" />
  </Poster>;
}

function Components() {
  return <Poster id={5} slug="build-your-own-story" theme="mint" category="自由组合组件">
    <div className="headline" data-safe="headline"><h1>不把经历塞进格式。<br /><em>把格式交给你。</em></h1><p>时间线、进度条、标签、作品……自由组合。</p></div>
    <div className="component-board">
      <div className="component-card experience-card"><div className="card-eyebrow"><Layers3 size={27} />时间线</div><Piece type="timeline" title="把热爱变成日常" subtitle="产品设计师 · 创意工作室" date="2024 — 至今" description="从想法到落地，每一步都值得被看见。" style="line" fontSize={24} /></div>
      <div className="component-card skills-card"><div className="card-eyebrow"><Sparkles size={27} />技能熟练度</div><Piece type="progress" title="创意表达" value={90} style="bar" fontSize={24} /><Piece type="progress" title="好奇心" value={100} style="dots" fontSize={24} color="#c79155" /></div>
      <div className="component-card tags-card"><div className="card-eyebrow"><Plus size={27} />个性标签</div><Piece type="tags" title="设计思维, 细节控, 爱画画, 行动力" style="soft" fontSize={25} /></div>
      <div className="component-card project-card"><div className="card-eyebrow"><FileText size={27} />精选作品</div><Piece type="project" title="「一隅」生活方式社区" subtitle="用户研究 / 交互 / 视觉设计" description="用一个项目，讲好你的故事。" style="plain" fontSize={24} /></div>
    </div>
    <div className="component-foot" data-safe="component footer"><span>栏目顺序、颜色、图标、样式，都由你来定。</span><Mascot name="frog" size={104} /></div>
  </Poster>;
}

function Mobile() {
  return <Poster id={6} slug="tap-edit-anywhere" theme="rose" category="随手点按编辑">
    <div className="headline" data-safe="headline"><h1>灵感来了，<br /><em>手机也能随手改。</em></h1><p>点一下改内容，双指缩放看细节。</p></div>
    <div className="mobile-orbit" />
    <div className="phone"><div className="phone-status"><b>9:41</b><span>● ▰</span></div><div className="phone-island" /><div className="phone-appbar"><BirchLogo size={23} /><b>Birchify</b><ArrowDownToLine size={22} /></div><div className="phone-preview"><Sheet template="pig-studio" scale={.302} /></div><div className="phone-selection"><Pencil size={17} />编辑专业技能</div><div className="phone-nav"><span><FileText size={22} />编辑</span><span><LayoutTemplate size={22} />模板</span><span className="selected"><Layers3 size={22} />预览</span></div><div className="phone-home" /></div>
    <div className="dialog-kicker" data-safe="dialog kicker"><span>点按内容</span><ArrowRight size={30} /><span>弹窗编辑</span></div>
    <div className="edit-dialog"><div className="dialog-top"><span><Pencil size={25} />编辑技能</span><X size={26} /></div><label>技能名称</label><div className="dialog-input">创意表达<span /></div><label>熟练度 <b>90%</b></label><div className="dialog-slider"><i /><span /></div><div className="dialog-actions"><span>取消</span><b><Check size={22} />保存修改</b></div></div>
    <svg className="tap-hand" width="99" height="113" viewBox="0 0 99 113" aria-hidden="true"><path d="M32 57V19q0-14 13-14q12 0 12 14v29q12-10 20 4q14-2 17 15v15q0 19-19 26H53q-12-2-19-15L15 70q-10-17 5-19q5-1 12 6Z" fill="#fff8ed" stroke="#756377" strokeWidth="3.5" strokeLinejoin="round" /><path d="M10 16 3 10M16 1l4 9M2 31h10" stroke="#b58eb4" strokeWidth="4" strokeLinecap="round" /></svg>
    <Tag className="mobile-caption" data-safe="mobile caption"><CheckCheck size={25} />电脑精细排版，手机随手修改</Tag>
    <span className="mobile-note" data-safe="mobile note">点按编辑交互示意</span>
    <Mascot name="pig" size={145} className="mobile-pig" />
  </Poster>;
}

function Style() {
  return <Poster id={7} slug="colors-fonts-and-you" theme="sky" category="个性化设计">
    <div className="headline" data-safe="headline"><h1>你的风格，<br /><em>不止一种可能。</em></h1><p>从底色到字体，让每个细节都像你。</p></div>
    <div className="style-card"><div className="style-label"><Palette size={27} /><span>选一个喜欢的颜色</span></div><div className="swatches">{["#50745d", "#d1a3b0", "#9e8db5", "#d5af68", "#81afb8"].map((c, i) => <i key={c} style={{ background: c }}>{i === 0 && <Check size={27} />}</i>)}</div><div className="style-label font-label"><Type size={27} /><span>换一种表达方式</span></div><div className="font-samples"><span>你好，下一站。</span><span>你好，下一站。</span><span>你好，下一站。</span></div><div className="style-counts"><b>{backgrounds.length}<small>种背景</small></b><i /><b>10<small>款本地开源字体</small></b></div></div>
    <Sheet template="cat-nap" scale={.323} className="style-sheet-back" /><Sheet template="frog-pond" scale={.345} className="style-sheet-front" />
    <div className="ring-card"><Piece type="progress" title="设计灵感" value={95} style="circle" color="#7c95aa" fontSize={22} /></div>
    <Mascot name="owl" size={151} className="style-owl" /><Flower size={70} color="#edc69d" className="style-flower" />
    <Tag className="style-caption" data-safe="style caption">水平进度条、圆环、图标，也能换着玩。</Tag>
  </Poster>;
}

function Free() {
  return <Poster id={8} slug="free-and-ad-free" theme="forest" category="免费 · 无广告">
    <div className="headline" data-safe="headline"><h1>认真做简历。<br /><em>不必先掏钱包。</em></h1><p>把时间留给创作，把预算留给生活。</p></div>
    <div className="free-ticket"><div className="price"><span>¥</span><strong>0</strong><small>做简历，没有付费门槛</small></div><div className="ticket-divider" /><div className="free-promises"><h2>完全免费<br />没有广告</h2><span><CircleCheck size={27} />打开就能开始创作</span><span><CircleCheck size={27} />专注在自己的故事里</span></div><i className="ticket-notch notch-top" /><i className="ticket-notch notch-bottom" /></div>
    <div className="privacy-tags" data-safe="privacy"><Tag><Check size={23} />无需注册</Tag><Tag><ShieldCheck size={23} />本地保存</Tag><Tag><Sparkles size={23} />清爽创作</Tag></div>
    <Mascot name="capybara" size={165} className="free-capybara" /><Mascot name="dog" size={150} className="free-dog" />
    <p className="free-last" data-safe="free closing">少一点打扰，多一点专注。</p><Star className="free-star" />
  </Poster>;
}

const goodbyeFriends: Motif[] = ["hamster", "panda", "cat", "dog", "red-panda", "frog", "pig"];
function Goodbye() {
  return <Poster id={9} slug="your-next-chapter" theme="lime" category="下一站，出发">
    <div className="headline centered" data-safe="headline"><h1>下一站，<br /><em>带上可爱的自己。</em></h1><p>一份属于自己的简历，从这里开始。</p></div>
    <div className="goodbye-brand" data-safe="brand signature"><BirchLogo size={90} /><b>Birchify</b><Star /></div>
    <svg className="goodbye-arc" width="950" height="220" viewBox="0 0 950 220" aria-hidden="true"><path d="M30 180Q475-100 920 180" stroke="#6f8a57" strokeWidth="2.5" strokeDasharray="8 12" fill="none" /></svg>
    <div className="goodbye-friends">{goodbyeFriends.map((name, i) => <Mascot name={name} size={155} key={name} style={{ transform: `translateY(${[37, 8, -8, -22, -8, 8, 37][i]}px) rotate(${[-9, 5, -4, 0, 5, -4, 8][i]}deg)` }} />)}</div>
    <div className="goodbye-card" data-safe="call to action"><div>完全免费 <i /> 无广告 <i /> 自由拖拽编辑</div><span>在线体验：birchify.vargking.cn</span></div>
    <Flower size={81} color="#e8b2a0" className="goodbye-flower" /><Star className="goodbye-star" />
  </Poster>;
}

const posters = [Cover, Friends, WholePage, Drag, Components, Mobile, Style, Free, Goodbye];
const requested = Number(new URLSearchParams(location.search).get("poster"));
createRoot(document.getElementById("root")!).render(<main className="poster-gallery">{posters.map((View, i) => !requested || requested === i + 1 ? <View key={i} /> : null)}</main>);
