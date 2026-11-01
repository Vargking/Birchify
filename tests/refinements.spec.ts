import { test, expect, type Page, type CDPSession } from "@playwright/test";
import { readFileSync } from "node:fs";
import { unzipSync, strFromU8 } from "fflate";
import { backgrounds, createDefaultResume, createComponent } from "../src/data";
import { extraTemplates, extraBackgrounds } from "../src/expansion";
import { designFor } from "../src/designs";
import { fontOptions } from "../src/fonts";

const preview = (page: Page) => page.locator(".mobile-nav").getByRole("button", {name:"预览",exact:true}).click();
const scale = (page: Page) => page.locator(".pages-stage").evaluate(el => Number((el as HTMLElement).style.getPropertyValue("--preview-scale")));
const frame = (page: Page) => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
const touch = (cdp: CDPSession, type: string, points: {x:number;y:number;id:number}[]) => cdp.send("Input.dispatchTouchEvent", {type,touchPoints:points.map(p=>({...p,radiusX:5,radiusY:5}))});
const unpack = (path:string) => Object.fromEntries(Object.entries(unzipSync(readFileSync(path))).map(([k,v])=>[k,k.endsWith(".xml")||k.endsWith(".rels")?strFromU8(v):v]));

test.describe("first visit", () => {
  test.use({storageState:{cookies:[],origins:[]},viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  test("four-step tutorial recommends desktop on phones, persists and can replay", async ({page}) => {
    await page.goto("/");
    const dialog=page.getByRole("dialog");
    await expect(dialog).toContainText("推荐使用电脑浏览器");
    await page.screenshot({path:"test-results/first-visit-mobile.png"});
    for(let i=0;i<3;i++) await dialog.getByRole("button",{name:"下一步",exact:true}).click();
    await expect(dialog).toContainText("Word");
    await dialog.getByRole("button",{name:"开始创作",exact:true}).click();
    await page.reload();
    await expect(dialog).toHaveCount(0);
    await page.getByRole("button",{name:"更多简历操作",exact:true}).click();
    await page.getByRole("button",{name:"重新查看教程",exact:true}).click();
    await expect(dialog).toContainText("推荐使用电脑浏览器");
    await dialog.getByRole("button",{name:"跳过引导",exact:true}).click();
    expect(await page.evaluate(()=>localStorage.getItem("birchify-tour-v2"))).toBe("seen");
  });
});

test.describe("mobile gestures", () => {
  test.use({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  test("quiet preview, contextual tools, native two-finger zoom and single-finger panning", async ({page}) => {
    await page.goto("/"); await preview(page);
    await expect(page.locator(".resume-page .preview-unit-tools:visible,.resume-page .section-drag-tools:visible")).toHaveCount(0);
    await page.getByRole("button",{name:"排版",exact:true}).click();
    await page.locator(".resume-page .component-edit-target").first().click();
    await expect(page.locator(".resume-page .preview-unit-tools:visible")).toHaveCount(1);
    await expect(page.locator(".resume-page .section-drag-tools:visible")).toHaveCount(0);
    await page.screenshot({path:"test-results/selected-mobile.png"});
    await page.getByRole("button",{name:"完成排版",exact:true}).click();
    const before=await scale(page), cdp=await page.context().newCDPSession(page);
    await touch(cdp,"touchStart",[{x:120,y:340,id:1},{x:240,y:340,id:2}]);
    for(let i=1;i<=8;i++) { await touch(cdp,"touchMove",[{x:120-i*10,y:340,id:1},{x:240+i*10,y:340,id:2}]); await frame(page); }
    await touch(cdp,"touchEnd",[]);
    await expect.poll(()=>scale(page)).toBeGreaterThan(before*1.8);
    expect(await page.evaluate(()=>visualViewport!.scale)).toBe(1);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    const enlarged=await scale(page);
    await touch(cdp,"touchStart",[{x:60,y:340,id:1},{x:300,y:340,id:2}]);
    for(let i=1;i<=6;i++) { await touch(cdp,"touchMove",[{x:60+i*10,y:340,id:1},{x:300-i*10,y:340,id:2}]); await frame(page); }
    await touch(cdp,"touchEnd",[]);
    await expect.poll(()=>scale(page)).toBeLessThan(enlarged*.7);
    for(let i=0;i<6;i++) await page.getByRole("button",{name:"放大预览",exact:true}).click();
    const scroll=page.locator(".preview-scroll");
    await scroll.evaluate(el=>{el.scrollTop=0;el.scrollLeft=0;});
    await touch(cdp,"touchStart",[{x:300,y:530,id:1}]);
    for(let i=1;i<=8;i++){ await touch(cdp,"touchMove",[{x:300-i*22,y:530-i*24,id:1}]);await frame(page); }
    await touch(cdp,"touchEnd",[]);
    await expect.poll(()=>scroll.evaluate(el=>el.scrollLeft+el.scrollTop)).toBeGreaterThan(50);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.getByRole("button",{name:"适应宽度",exact:true}).click();
    await expect.poll(()=>scale(page)).toBeCloseTo(before,2);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  });
});

test("desktop ctrl-wheel zoom and reduced-motion support", async ({page}) => {
  await page.goto("/"); const initial=await scale(page);
  await page.locator(".preview-scroll").dispatchEvent("wheel",{ctrlKey:true,deltaY:-40,clientX:1000,clientY:400,bubbles:true,cancelable:true});
  await expect.poll(()=>scale(page)).toBeGreaterThan(initial);
  await page.emulateMedia({reducedMotion:"reduce"});
  expect(await page.locator(".welcome-card").evaluate(el=>getComputedStyle(el,"::after").animationName)).toBe("none");
});

test("30 new designs have distinct layouts, 10 original scenes and 20 unique extra backgrounds", async ({page}) => {
  expect(extraTemplates).toHaveLength(30);
  expect(extraBackgrounds).toHaveLength(20);
  expect(new Set(extraBackgrounds.map(b=>b.value)).size).toBe(20);
  await page.goto("/");
  await expect(page.locator(".welcome-bottom")).toContainText(`${backgrounds.length} 种背景`);
  await page.getByRole("tab",{name:"样式",exact:true}).click();
  await expect(page.locator(".style-section-title").filter({hasText:"纸张背景"})).toContainText(`${backgrounds.length} 种预设`);
  await expect(page.locator(".background-option")).toHaveCount(backgrounds.length+1);
  await page.getByRole("tab",{name:"模板",exact:true}).click();
  const scenes:string[]=[],layouts:string[]=[];
  for(const theme of extraTemplates){
    await page.getByRole("button",{name:`${theme.name} ${theme.english} 模板`,exact:true}).click();
    const sheet=page.locator(".resume-page").first();
    if(theme.motif){
      await expect(sheet.locator(".identity-mascot [data-animal-drawing]")).toHaveAttribute("data-animal-drawing",theme.motif);
      await expect(sheet.locator("[data-theme-decoration]")).toHaveAttribute("data-theme-decoration",designFor(theme.id).surface);
      scenes.push(await sheet.locator("[data-theme-decoration]").evaluate(el=>el.innerHTML));
    }
    layouts.push(await sheet.evaluate(el=>JSON.stringify([".resume-columns",".resume-identity",".resume-section-fragment",".resume-section-heading"].map(s=>{const css=getComputedStyle(el.querySelector(s)!);return ["display","grid-template-columns","border-radius","border-width","padding","clip-path","box-shadow"].map(p=>css.getPropertyValue(p).replace(/rgba?\([^)]+\)/g,"COLOR"));}))));
    if(["owl-library","bat-observatory","folio","signal"].includes(theme.id)) await sheet.screenshot({path:`test-results/design-${theme.id}.png`});
  }
  expect(new Set(scenes).size).toBe(10);
  expect(new Set(layouts).size).toBe(30);
});

test("10 commercial-use fonts load from this origin with CJK glyphs and persist", async ({page}) => {
  const remote:string[]=[];
  page.on("request",r=>{if(!r.url().startsWith("http://localhost:5173")&&!r.url().startsWith("data:"))remote.push(r.url());});
  await page.goto("/");
  await page.getByRole("tab",{name:"样式",exact:true}).click();
  for(const font of fontOptions.slice(3)){
    await page.getByRole("button",{name:new RegExp(font.label)}).click();
    const faces=await page.evaluate(async id=>{
      // Import the same lazy loader used by the UI, and check actual loaded faces.
      const mod=await import(/* @vite-ignore */ "/src/fonts.ts");
      await mod.loadFont(id,"简历大学姓名设计工作");
      return [...document.fonts].filter(f=>f.family.replace(/["']/g,"")===mod.fontFor(id).family&&f.status==="loaded").length;
    },font.value);
    expect(faces).toBeGreaterThan(0);
    const rendersChinese=await page.evaluate(({family,value})=>{
      const canvas=document.createElement("canvas"); canvas.width=720; canvas.height=80;
      const ctx=canvas.getContext("2d")!;
      const draw=(face:string)=>{
        ctx.clearRect(0,0,720,80);
        ctx.font=`${value==="wenkai"?500:400} 36px ${face}`;
        ctx.fillText("简历大学姓名设计工作",10,50);
        return canvas.toDataURL();
      };
      return draw(`"${family}",serif`)!==draw("serif");
    },{family:font.family,value:font.value});
    expect(rendersChinese,`${font.label} should render Chinese using the selected font`).toBe(true);
  }
  await expect(page.locator(".save-status")).toContainText("所有更改已保存到本机");
  await page.reload();
  await expect(page.locator(".resume-page").first()).toHaveCSS("font-family",'"Long Cang", cursive');
  const licenses=await page.request.get("/font-licenses.txt");
  expect((await licenses.text()).match(/SIL OPEN FONT LICENSE Version 1.1/g)?.length).toBe(10);
  expect(remote).toEqual([]);
});

test("real layered Word downloads contain editable text, graphics, hyperlinks and fixed preview pages", async ({page}) => {
  const data=createDefaultResume();
  const picture="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+y/2sAAAAASUVORK5CYII=";
  data.photo=picture;
  const link=createComponent("links"); link.title="作品集链接"; link.description="https://example.com/portfolio";
  const art=createComponent("image"); art.image=picture; art.title="作品图片";
  data.sections[0].components.push(link,art);
  data.sections.push({id:"hidden",title:"不该导出的隐藏栏目",subtitle:"",visible:false,components:[]});
  data.exportSettings.fileName="可编辑简历.pdf";
  await page.addInitScript(data=>{localStorage.setItem("birchify-resume-v1",JSON.stringify(data));},data);
  await page.goto("/");
  await page.getByRole("button",{name:"导出 PDF / Word",exact:true}).click();
  await page.getByRole("button",{name:/Word \(\.docx\)/}).click();
  await page.getByLabel("Word 导出方式",{exact:true}).selectOption("editable");
  await expect(page.getByRole("dialog")).toContainText("按行定位的可编辑文本框");
  await expect(page.getByLabel("导出清晰度",{exact:true})).toBeVisible();
  const pending=page.waitForEvent("download",{timeout:30000});
  await page.getByRole("button",{name:/开始导出/}).click();
  const download=await pending;
  expect(download.suggestedFilename()).toBe("可编辑简历.docx");
  await download.saveAs("test-results/editable-resume.docx");
  const files=unpack((await download.path())!),xml=files["word/document.xml"] as string;
  expect(xml).toContain("林予安"); expect(xml).toContain("作品集链接"); expect(xml).toContain("作品图片");
  expect(xml).not.toContain("不该导出的隐藏栏目");
  expect(xml.indexOf("关于我")).toBeLessThan(xml.indexOf("工作经历"));
  expect(xml).toContain("w:txbxContent"); expect(xml).toContain("w:drawing");
  expect(xml).toContain('relativeFrom="page"');
  expect(files["word/_rels/document.xml.rels"]).toContain("https://example.com/portfolio");
  expect(Object.keys(files).some(k=>k.startsWith("word/media/"))).toBe(true);
  // Brand/footer/graphics are in the page image, not a second lossy Word header.
  expect(Object.keys(files).filter(k=>/word\/(header|footer)\d+\.xml$/.test(k))).toEqual([]);
  // Repeat through the actual mobile export controls, with both toggles disabled.
  await page.setViewportSize({width:390,height:844});
  await page.getByRole("button",{name:"导出 PDF / Word",exact:true}).click();
  await page.getByRole("switch",{name:"Birchify 品牌水印",exact:true}).click();
  await page.getByRole("switch",{name:"底部页码",exact:true}).click();
  const unbranded=page.waitForEvent("download",{timeout:30000});
  await page.getByRole("button",{name:/开始导出/}).click();
  const clean=unpack((await (await unbranded).path())!);
  expect(Object.keys(clean).filter(k=>/word\/(header|footer)\d+\.xml$/.test(k))).toEqual([]);
  expect(clean["word/document.xml"]).toContain("林予安");
});

test("Word supports blank resumes, old settings, long multiline content and CJK typography",async({page})=>{
  const data=createDefaultResume(); delete (data.exportSettings as Partial<typeof data.exportSettings>).format;
  await page.addInitScript(data=>localStorage.setItem("birchify-resume-v1",JSON.stringify(data)),data);
  await page.goto("/");
  await expect(page.locator(".save-status")).toContainText("所有更改已保存到本机");
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem("birchify-resume-v1")!).exportSettings.format)).toBe("pdf");
  const longDownload=page.waitForEvent("download");
  const results=await page.evaluate(async()=>{
    const {buildWordBlob}=await import(/* @vite-ignore */ "/src/word.ts");
    const data=JSON.parse(localStorage.getItem("birchify-resume-v1")!);
    data.font="wenkai"; data.exportSettings.watermark=false;
    data.exportSettings.wordMode="editable";
    data.sections[0].components[0].description=Array.from({length:200},(_,i)=>`第${i+1}段：研究与设计经验，保留所有可编辑文字。`).join("\n");
    const long=await buildWordBlob(data);
    const url=URL.createObjectURL(long),a=document.createElement("a"); a.href=url;a.download="long-resume.docx";a.click();
    data.name="";data.role="";data.email="";data.phone="";data.location="";data.website="";data.photo="";data.sections=[];
    const blank=await buildWordBlob(data);
    return {long:long.size,blank:blank.size};
  });
  expect(results.long).toBeGreaterThan(9000); expect(results.blank).toBeGreaterThan(5000);
  const download=await longDownload;
  await download.saveAs("test-results/long-resume.docx");
  const files=unpack((await download.path())!);
  const xml=files["word/document.xml"] as string;
  expect(xml).toContain("第200段");
  expect(xml).toContain('w:eastAsia="LXGW WenKai"');
  expect((xml.match(/<w:txbxContent>/g)||[]).length).toBeGreaterThanOrEqual(200);
  expect((xml.match(/<w:pageBreakBefore\//g)||[]).length).toBeGreaterThan(1);
  await expect(page.locator("[data-export-host]")).toHaveCount(0);
});
