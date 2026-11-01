# Birchify

本地优先的简历制作 Web App。所有数据和照片只保存在当前浏览器中，不需要账号或后端。

<<<<<<< HEAD
应用欢迎卡片下方及“使用与隐私说明”中均有作者署名；署名不会添加到用户简历或导出的 PDF 中。
=======
作者：**Vargking**。应用欢迎卡片下方及“使用与隐私说明”中均有作者署名；署名不会添加到用户简历或导出文件中。
>>>>>>> 8d791ab (Fix layouts and enable GitHub Pages deployment)

## 启动

需要 Node.js 20.19+ 或 22.12+。

```powershell
npm install
npm run dev
```

浏览器访问终端显示的本地地址，通常为 [http://localhost:5173/](http://localhost:5173/)。请不要通过双击 `index.html` 或 `dist/index.html` 打开，浏览器的模块安全限制会阻止应用启动。

依赖安装源已在 `.npmrc` 和锁文件中配置为国内 npmmirror 镜像。系统字体之外，10 款开源字体随站点打包、按需载入；Logo、插画、动画均由 SVG/CSS 绘制；Lucide 图标、React、PDF 和 Word 库随项目打包。应用运行时不使用外部 CDN、图片、字体服务、统计或在线接口。

## 功能

- 桌面：左侧编辑、右侧 A4 实时预览；支持缩放、专注预览。
- 移动端：底栏切换编辑、模板、预览、样式；预览支持 25%–200% 双指缩放与放大后的单指平移，桌面支持 Ctrl / Command + 滚轮缩放。
- 首次进入提供四步教程；手机会推荐电脑浏览器，但可继续使用手机。更多菜单可重新播放教程。
- 104 款命名设计 + 1 款空白画布，采用单栏、等宽双栏、不等宽双栏、三栏及侧标题等结构；页眉、栏目形状与底纹随设计变化。
- 包含 52 款整页原创卡通模板。本轮新增树懒吊床日记、猫头鹰藏书室、海豚珊瑚湾、鲸鱼摇篮曲、六角龙水晶屋、蝙蝠观星台、长颈鹿温室、河马荷花旅馆、鸭嘴兽水车坊、雪貂裁缝铺。角色、主题道具、页边插画均为本地原创 SVG，不使用知名形象或仅换色的重复场景。
- 本轮另增 20 款不同风格设计：纸上画廊、信号矩阵、孔版印刷、方碑、羊皮卷、地铁线路、铸字所、植物标本、调查档案、动势海报、青瓷、北极星图、织物档案、光谱索引、账簿、专著、庭院、回路、日光展厅、折纸。
- 切换模板会同步应用模板背景、主题色和字体；可使用“跟随模板”，也可手动选择 40 种背景预设（本轮新增 20 种）。
- 3 种系统字体与 10 款支持商用的 SIL OFL 开源字体：霞鹜文楷、思源黑体、思源宋体、马善政毛笔、志莽行书、站酷快乐体、站酷小薇体、站酷庆科黄油体、刘建毛草、龙藏体。字体文件从本站按需加载，授权和版权声明见 [字体许可证](public/font-licenses.txt)。
- 从空白开始、清空当前内容、填入示例内容均有确认并可撤销。“填入示例内容”恢复初始个人资料、照片和全部栏目，保留当前模板、背景、排版和导出设置。
- 栏目自由新增、命名、排序、隐藏、删除；每栏可任意组合组件。
- 10 类组件：文本、时间线、熟练度、标签、项目、链接、图片、引言、分隔线、留白。
- 组件独立配置：展示风格、内容、颜色、字号、加粗、对齐、宽度、缩进、底部间距；熟练度支持水平条、环形、圆点、格状。
- 103 款组件图标（66 款 Lucide 矢量图标 + 37 款原创卡通）；支持搜索、线条 / 柔色底衬 / 实色徽章样式、跟随组件颜色。
- 桌面和移动预览均可点按内容弹窗编辑；组件及整个栏目均可拖拽，真实内容浮层跟随鼠标 / 手指，松开前实时重排，松开后仅产生一步撤销。组件支持跨栏目移动和横向缩进；可按 Escape 取消拖拽、切换为只读预览。手机默认隐藏全部拖动工具，进入“排版”后只显示选中组件或栏目的工具；按钮为 44px 触摸区域。
- 欢迎卡片光泽、模板悬浮反馈、弹窗弹性过渡和教程微动效；遵循系统“减少动态效果”设置，打印内容不播放装饰动画。
- 放大界面文字与控件，手机表单使用 16px 字号，避免 iOS 输入时自动放大。
- 个人照片支持 JPG / PNG / WebP / GIF，最大 5 MB，可选择圆形、圆角或方形。
- 自动分页、跨页续栏、页底页码、首页 Birchify 品牌标识。
- 高清 A4 PDF 下载；可设置文件名、品牌水印、页码、纸张背景、清晰度（1.5 / 2 / 3 倍）及全部页 / 当前页。关闭水印后同时移除首页左上角品牌 Logo / 名称和页底右侧品牌标识。
- 可编辑 Word（`.docx`）下载：导出全部可见栏目，保留文字、照片、作品图、链接及栏目顺序，采用 A4 单栏自动分页，支持品牌水印、页码及纯色背景设置。
- 撤销 / 重做（手机可从右上角更多菜单进入）；自动保存；JSON 备份导入导出。兼容早期版本本地数据。

PDF 当前为可调分辨率（默认 2 倍）的图像型 PDF，保留页面视觉效果和图标，但文字不可选取，不适合要求可提取文字的 ATS 系统。

Word 使用原生文字和图片，不是页面截图。熟练度转为百分比，复杂卡通装饰、组件图标、多栏和网页专有样式不保留，渐变与纹理背景回退白色。字体不嵌入，收件人电脑未安装相应字体时会回退；Word / WPS 的分页可能与网页不同。需要原样页面效果请用 PDF，需要继续编辑可用 Word 或 JSON 备份。

## 数据与隐私

浏览器 `localStorage` 自动保存，存在空间限制。清除浏览器数据、使用其他浏览器或访问不同端口都不会共享原简历。照片过大会耗尽存储；出现保存失败时，请及时通过右上角菜单下载 JSON 备份。网页没有上传、登录或云同步功能。

## 构建与测试

```powershell
npm run build
npm run preview
```

测试前在一个终端运行 `npm run dev`（默认端口 5173），在另一个终端运行 `npm test`。

测试覆盖首屏无白屏、无外部网络依赖、个人资料与照片、本地持久化、撤销重做、全部 105 个模板选项的页底边界、新增主题的图形及非颜色版式去重、模板背景跟随及手动覆盖、首次教程、手机工具收纳、原生双指缩放与单指平移、字体本地载入与许可、示例内容恢复及一步撤销、组件图标搜索和样式、预览弹窗、鼠标及原生触屏实时拖拽、缩进、跨栏目移动、多页页码、320px 手机适配、PDF 与 Word 设置和实际下载、Word 可编辑内容结构、JSON 备份。当前 Playwright 配置使用 Windows 已安装的 Microsoft Edge，其他环境请调整 `playwright.config.ts` 中的浏览器路径。

<<<<<<< HEAD
技术栈：React + TypeScript + Vite，Lucide React，html2canvas，jsPDF。无后端。
=======
技术栈：React + TypeScript + Vite，Lucide React，html2canvas，jsPDF，docx，Fontsource。无后端。

## GitHub Pages 自动编译部署

已提供工作流 [deploy.yml](.github/workflows/deploy.yml)。推送到 `main` 或从 Actions 手动运行后，GitHub 会使用 Node.js 22 执行 `npm ci`、`npm run build`，再把 `dist` 发布到 Pages。不需要上传 `node_modules` / `dist`、运行 Node 后端或另外建立 `gh-pages` 分支。

1. 打开 GitHub 仓库 **Settings → Pages → Build and deployment → Source**，选择 **GitHub Actions**。工作流已在项目里，不需要再选 Node.js 测试模板或创建重复工作流。
2. 在项目目录提交并推送源码：

   ```powershell
   cd D:\LunWen\Birchify
   git add .
   git commit -m "fix: improve layouts and enable GitHub Pages deployment"
   git pull --rebase origin main
   git push -u origin main
   ```

   `git add .` 会包含当前目录的全部未忽略修改，请先用 `git status` 检查。若拉取时出现冲突，先解决冲突，再 `git add` 对应文件、`git rebase --continue`，完成后才能推送；不要强制推送覆盖远端。
3. 打开仓库 **Actions → Deploy Birchify to GitHub Pages**，等构建和部署成功。也可使用 **Run workflow** 手动触发。
4. 当前仓库 `Vargking/Birchify` 的默认发布地址为 `https://vargking.github.io/Birchify/`，以 Pages 页面实际显示的地址为准。

工作流读取 Pages 的 `base_path` 作为 Vite 构建参数，自动兼容 `/Birchify/` 子路径、改名后的仓库及已正确配置的自定义域名；字体许可链接也跟随部署路径。本地、Cloudflare Pages / Vercel 的普通 `npm run build` 仍使用默认根路径，不受影响。此方式遵循 [Vite 官方 Pages 部署指南](https://vite.dev/guide/static-deploy.html#github-pages) 和 [GitHub Pages 发布源说明](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

部署到新域名后，不会自动共享 localhost 或其他域名里的简历数据。请先在旧地址下载 JSON 备份，再到新地址导入。

## 许可证

项目采用 [MIT 许可证](LICENSE)，Copyright (c) 2026 Vargking。第三方依赖仍遵循各自的许可证；新增 10 款字体采用 SIL OFL 1.1，完整声明随站点发布在 [font-licenses.txt](public/font-licenses.txt)，允许商用，重新分发或修改字体时需遵守相应条款。
>>>>>>> 8d791ab (Fix layouts and enable GitHub Pages deployment)
