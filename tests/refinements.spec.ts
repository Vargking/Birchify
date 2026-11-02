import { test, expect, type Page, type CDPSession } from "@playwright/test";
import { backgrounds } from "../src/data";
import { extraTemplates, extraBackgrounds } from "../src/expansion";
import { designFor } from "../src/designs";
import { fontOptions } from "../src/fonts";

const preview = (page: Page) => page.locator(".mobile-nav").getByRole("button", {name:"预览",exact:true}).click();
const scale = (page: Page) => page.locator(".pages-stage").evaluate(el => Number((el as HTMLElement).style.getPropertyValue("--preview-scale")));
const frame = (page: Page) => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
const touch = (cdp: CDPSession, type: string, points: {x:number;y:number;id:number}[]) => cdp.send("Input.dispatchTouchEvent", {type,touchPoints:points.map(p=>({...p,radiusX:5,radiusY:5}))});

test.describe("first visit", () => {
  test.use({storageState:{cookies:[],origins:[]},viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  test("four-step tutorial recommends desktop on phones, persists and can replay", async ({page}) => {
    await page.goto("/");
    const dialog=page.getByRole("dialog");
    await expect(dialog).toContainText("推荐使用电脑浏览器");
    await page.screenshot({path:"test-results/first-visit-mobile.png"});
    for(let i=0;i<3;i++) await dialog.getByRole("button",{name:"下一步",exact:true}).click();
    await expect(dialog).toContainText("ATS 友好 PDF");
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
