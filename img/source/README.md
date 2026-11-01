# Birchify 朋友圈九宫格

`img/` 下的 01–09 为九张独立宣传图，尺寸均为 1080 × 1080，可按编号上传朋友圈。`contact-sheet.png` 仅为排版总览，不是第十张宣传图。

海报由 React、CSS 和 SVG 纯代码绘制，复用 Birchify 的原创动物、Logo、简历模板和组件。本地字体由项目现有的 Fontsource 依赖提供，无外链素材、远程图片或 AI 生成图片。界面示意不涉及真实用户信息。

在项目根目录安装现有依赖后运行：

```sh
node img/source/render.mjs
```

脚本启动临时本地 Vite 服务，用无头浏览器导出 PNG，完成后自动关闭服务。Windows 默认使用已安装的 Microsoft Edge；其他环境使用 Playwright Chromium，也可通过 `BIRCHIFY_BROWSER` 指定浏览器可执行文件路径。不会修改业务页面或启动用户现有的调试服务。

- `posters.tsx`：文案、构图、原创资产和真实简历组件。
- `posters.css`：配色、字型和固定尺寸海报排版。
- `render.mjs`：图片生成与边界、尺寸、资源检查。
- `render-report.json`：最近一次生成检查结果。
