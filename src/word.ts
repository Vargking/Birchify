import { AlignmentType, BorderStyle, Document, ExternalHyperlink, Footer, Header, HeadingLevel, ImageRun, Packer, PageNumber, Paragraph, TextRun, type IParagraphOptions } from "docx";
import { fontFor } from "./fonts";
import { designFor } from "./designs";
import { backgrounds } from "./data";
import type { ResumeData } from "./types";

const hex = (s:string, fallback="335E4C") => /^#[\da-f]{6}$/i.test(s) ? s.slice(1).toUpperCase() : fallback;
const alignment = {left:AlignmentType.LEFT,center:AlignmentType.CENTER,right:AlignmentType.RIGHT};

async function image(source:string,maxWidth:number,maxHeight:number): Promise<ImageRun> {
  if (!/^data:image\/(png|jpeg|webp|gif);base64,/i.test(source)) throw new Error("图片格式无法导出，请重新上传 PNG / JPG / WebP / GIF 图片");
  const img = new Image(); img.src=source; await img.decode();
  const ratio = Math.min(maxWidth/img.naturalWidth,maxHeight/img.naturalHeight,1);
  const canvas=document.createElement("canvas");
  canvas.width=Math.max(1,Math.round(img.naturalWidth*ratio)); canvas.height=Math.max(1,Math.round(img.naturalHeight*ratio));
  const ctx=canvas.getContext("2d"); if (!ctx) throw new Error("浏览器无法处理图片");
  ctx.drawImage(img,0,0,canvas.width,canvas.height);
  const bytes=Uint8Array.from(atob(canvas.toDataURL("image/png").split(",")[1]),c=>c.charCodeAt(0));
  return new ImageRun({type:"png",data:bytes,transformation:{width:canvas.width,height:canvas.height},altText:{title:"简历图片",description:"用户上传的简历照片或作品",name:"Resume image"}});
}
function brandLogo(accent:string) {
  const canvas=document.createElement("canvas"); canvas.width=64; canvas.height=64;
  const c=canvas.getContext("2d")!; c.fillStyle=accent; c.beginPath(); c.roundRect(1,1,62,62,16); c.fill();
  c.strokeStyle="#fff"; c.lineWidth=4; c.lineCap="round"; c.beginPath(); c.moveTo(32,48); c.lineTo(32,18); c.moveTo(32,36); c.quadraticCurveTo(16,34,17,20); c.quadraticCurveTo(31,20,32,32); c.moveTo(32,29); c.quadraticCurveTo(49,26,47,13); c.quadraticCurveTo(34,14,32,29); c.stroke();
  return new ImageRun({type:"png",data:Uint8Array.from(atob(canvas.toDataURL().split(",")[1]),x=>x.charCodeAt(0)),transformation:{width:21,height:21},altText:{title:"Birchify Logo",description:"白桦枝叶标志",name:"Birchify"}});
}

// Native OOXML text, headings, hyperlinks and images. No page screenshots.
// Preset: compact_reference_guide. Named resume overrides: A4, user-selected
// typography/color/padding, no tables, editable proficiency labels, restrained header.
export async function buildWordBlob(data:ResumeData,onProgress:(n:number)=>void=()=>{}) {
  const settings=data.exportSettings, accent=hex(data.accent), family=fontFor(data.font).family;
  const size=Math.round(data.fontSize*1.5);
  const margin=Math.max(480,Math.min(1080,Math.round(data.pagePadding*15)));
  const children:Paragraph[]=[];
  const run=(text:string,opts:object = {}) => new TextRun({text,font:family,size,color:"38413A",...opts});
  const add=(text:string,options:IParagraphOptions={},runOptions:object={}) => children.push(new Paragraph({children:[run(text,runOptions)],spacing:{before:0,after:120,line:Math.round(data.lineHeight*240)},...options}));
  onProgress(10);
  if (data.photo) children.push(new Paragraph({children:[await image(data.photo,88,105)],alignment:AlignmentType.RIGHT,spacing:{after:100},keepNext:true}));
  if (data.name) add(data.name,{heading:HeadingLevel.TITLE,spacing:{before:0,after:120},keepNext:true},{size:56,bold:true,color:accent});
  if (data.role) add(data.role,{spacing:{after:160},keepNext:true},{size:26,color:accent});
  const contacts=[data.email,data.phone,data.location,data.website].filter(Boolean);
  if (contacts.length) add(contacts.join("  |  "),{spacing:{after:220}},{size:20,color:"667263"});
  const total=data.sections.reduce((n,s)=>n+s.components.length,0); let completed=0;
  for (const section of data.sections.filter(s=>s.visible)) {
    if (section.title) add(section.title,{heading:HeadingLevel.HEADING_1,keepNext:true,spacing:{before:360,after:200},border:{bottom:{style:BorderStyle.SINGLE,color:accent,size:5,space:7}}},{size:32,bold:true,color:accent});
    if (section.subtitle) add(section.subtitle,{keepNext:section.components.length>0,spacing:{after:140}},{size:18,color:accent});
    for (const item of section.components) {
      const color=hex(item.color,accent), itemSize=Math.round(item.fontSize*1.5);
      const base:IParagraphOptions={alignment:alignment[item.align],indent:{left:Math.round(item.indent*15),right:Math.max(0,Math.round((100-item.width)/100*(11906-2*margin)))},spacing:{before:0,after:Math.round(item.spacing*15),line:Math.round(data.lineHeight*240)},widowControl:true};
      const itemRun={size:itemSize,bold:item.bold,color};
      const lines=(text:string,opts:IParagraphOptions={},r:object={}) => text.split(/\r?\n/).forEach(line=>add(line,{...base,...opts,keepNext:opts.keepNext ?? false},{...itemRun,...r}));
      if(item.type === "divider") add("",{...base,border:{bottom:{style:item.style==="dots"?BorderStyle.DOTTED:BorderStyle.SINGLE,color,size:6,space:4}}});
      else if(item.type === "spacer") add("",{spacing:{before:0,after:0,line:Math.max(20,Math.round(item.value*15)),lineRule:"exact"}});
      else if(item.type === "image") {
        if(item.image) children.push(new Paragraph({...base,children:[await image(item.image,Math.max(60,(794-2*data.pagePadding)*.75*item.width/100),Math.min(item.value*3+40,300))]}));
        if(item.title) lines(item.title,{}, {size:20,color:"687363"});
      } else if(item.type === "links") {
        const url=item.description.trim(); const safe=/^(https?:\/\/|mailto:|tel:)/i.test(url)?url:/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(url)?`https://${url}`:"";
        if(safe) children.push(new Paragraph({...base,children:[new ExternalHyperlink({link:safe,children:[run(item.title||url,{...itemRun,underline:{},color})]})]}));
        else if(item.title) lines(item.title);
        if(url) lines(url,{}, {size:20,color:"687363"});
      } else if(item.type === "progress") lines(`${item.title}  ${item.value}%`);
      else if(item.type === "tags") lines(item.title.split(/[,，\n]/).map(t=>t.trim()).filter(Boolean).join("  /  "));
      else if(item.type === "quote") { lines(item.title,{keepNext:!!item.subtitle},{italics:true}); if(item.subtitle) lines(item.subtitle,{}, {size:20}); }
      else {
        if(item.title||item.date) add([item.title,item.date].filter(Boolean).join("  |  "),{...base,heading:HeadingLevel.HEADING_2,keepNext:!!(item.subtitle||item.description),spacing:{before:140,after:100}},{...itemRun,size:Math.max(itemSize,26),bold:true});
        if(item.subtitle) lines(item.subtitle,{keepNext:!!item.description},{color:"687363"});
        if(item.description) lines(item.description,{}, {color:item.color?color:"38413A"});
      }
      onProgress(15+Math.round(++completed/Math.max(1,total)*65));
    }
  }
  if (!children.length) children.push(new Paragraph({text:""}));
  const footerRuns=[];
  if(settings.pageNumbers) footerRuns.push(run("第 ",{size:18}),new TextRun({children:[PageNumber.CURRENT],size:18}),run(" / ",{size:18}),new TextRun({children:[PageNumber.TOTAL_PAGES],size:18}),run(" 页",{size:18}));
  if(settings.watermark) footerRuns.push(run(`${footerRuns.length?"     ":""}Birchify`,{color:accent,size:18}));
  const selectedBg=data.background==="template"?designFor(data.template).paper:backgrounds.find(b=>b.id===data.background)?.value;
  const doc=new Document({
    creator:data.name || "",title:data.name?`${data.name} · 简历`:"简历",description:"可编辑简历",background:{color:settings.background?hex(selectedBg||"#ffffff","FFFFFF"):"FFFFFF"},
    styles: {
      default: { document: { run: {font:family,size,color:"38413A"}, paragraph: {spacing:{before:0,after:120,line:Math.round(data.lineHeight*240)}} } },
      paragraphStyles: [
        {id:"Heading1",name:"Heading 1",basedOn:"Normal",next:"Normal",quickFormat:true,run:{font:family,size:32,bold:true,color:accent},paragraph:{spacing:{before:360,after:200},keepNext:true}},
        {id:"Heading2",name:"Heading 2",basedOn:"Normal",next:"Normal",quickFormat:true,run:{font:family,size:26,bold:true,color:accent},paragraph:{spacing:{before:280,after:140},keepNext:true}},
        {id:"Heading3",name:"Heading 3",basedOn:"Normal",next:"Normal",quickFormat:true,run:{font:family,size:24,bold:true,color:accent},paragraph:{spacing:{before:200,after:100},keepNext:true}}
      ]
    },
    sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:settings.watermark?Math.max(720,margin):margin,bottom:Math.max(720,margin),left:margin,right:margin,header:240,footer:300}},titlePage:true},
      headers:settings.watermark?{first:new Header({children:[new Paragraph({children:[brandLogo(data.accent),run("  Birchify",{color:accent,size:20,bold:true})],spacing:{before:0,after:0}})]})}:undefined,
      footers:footerRuns.length?{default:new Footer({children:[new Paragraph({children:footerRuns,alignment:AlignmentType.RIGHT,spacing:{before:0,after:0}})]}),first:new Footer({children:[new Paragraph({children:footerRuns,alignment:AlignmentType.RIGHT,spacing:{before:0,after:0}})]})}:undefined,
      children}],
  });
  const blob=await Packer.toBlob(doc); onProgress(100); return blob;
}
export async function exportWord(data:ResumeData,onProgress:(n:number)=>void) {
  const blob=await buildWordBlob(data,onProgress), url=URL.createObjectURL(blob);
  const name=(data.exportSettings.fileName.trim().replace(/\.(pdf|docx)$/i,"")||`${data.name||"我的简历"}_Birchify`).replace(/[<>:"/\\|?*\x00-\x1f]/g,"").slice(0,100)||"我的简历";
  const a=document.createElement("a"); a.href=url; a.download=`${name}.docx`; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
}
