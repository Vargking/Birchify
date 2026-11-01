import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { GripVertical, Pencil, Plus } from "lucide-react";
import { templates } from "./data";
import { ComponentContent, Identity, PAGE_HEIGHT, PAGE_WIDTH, resumeStyle } from "./ResumePreview";
import { columnWeights, designClasses } from "./designs";
import { PageScenery } from "./PageScenery";
import { usePreviewDrag } from "./PreviewInteraction";
import type { EditingTarget } from "./PreviewEditorDialog";
import type { ResumeComponent, ResumeData, Section } from "./types";

interface Unit { key: string; sourceId: string; section: Section; item?: ResumeComponent; index: number; first: boolean }
interface Fragment { section: Section; index: number; units: Unit[]; continued: boolean }
type Page = Fragment[][];

function heading(section: Section, index: number, continued = false, onEdit?: () => void) {
  return <div className="resume-section-heading" role={onEdit ? "button" : undefined} tabIndex={onEdit ? 0 : undefined} aria-label={onEdit ? `编辑栏目标题：${section.title}` : undefined} onClick={onEdit} onKeyDown={event => {
    if (onEdit && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onEdit(); }
  }}><span className="section-number">{String(index + 1).padStart(2,"0")}</span><h2>{section.title}{continued && <small>（续）</small>}</h2><span className="section-english">{section.subtitle}</span><i/></div>;
}
function splitDescription(item: ResumeComponent, data: ResumeData, minWidth: number) {
  if (!["text", "timeline", "project"].includes(item.type)) return [item];
  const width = Math.min(minWidth * item.width / 100, minWidth - item.indent) - (item.icon ? 54 : 0) - 72;
  // Reserve room for any theme's header, card inset and continued-section label.
  const limit = Math.max(70, Math.floor(width * 570 / (item.fontSize ** 2 * data.lineHeight) * .46));
  if (item.description.length <= limit) return [item];
  const chunks: ResumeComponent[] = [];
  let remaining = item.description;
  while (remaining.length) {
    let end = Math.min(remaining.length, limit);
    if (remaining.length > limit) {
      const boundary = Math.max(remaining.lastIndexOf("\n", end), remaining.lastIndexOf("。", end), remaining.lastIndexOf(" ", end));
      if (boundary > limit * .6) end = boundary + 1;
    }
    chunks.push({ ...item, id: `${item.id}-${chunks.length}`, description: remaining.slice(0, end), title: chunks.length ? "" : item.title, subtitle: chunks.length ? "" : item.subtitle, date: chunks.length ? "" : item.date });
    remaining = remaining.slice(end);
  }
  return chunks;
}

export default function PagedResume({ data: savedData, onPageCount, editable, layoutMode = false, onEdit, onCommit, onAddSection, onAddComponent }: {
  data: ResumeData; onPageCount: (count: number) => void; editable: boolean; layoutMode?: boolean;
  onEdit: (target: EditingTarget) => void; onCommit: (next: ResumeData) => void;
  onAddSection: () => void; onAddComponent: (section: string) => void;
}) {
  const { beginDrag, draft, dragging } = usePreviewDrag({ data: savedData, onCommit, onEdit: t => onEdit(t.component ? { section: t.section, component: t.component } : { section: t.section }) });
  const data = draft || savedData;
  const measureRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<Page[]>([[[]]]);
  const [selection, setSelection] = useState<{ section: string; component?: string } | null>(null);
  const activate = (target: { section: string; component?: string }) => layoutMode ? setSelection(target) : onEdit(target);
  const template = templates.find(t => t.id === data.template) || templates[0];
  const classes = `resume-document ${designClasses(template.id, !!template.motif)}`;
  const weights = useMemo(() => columnWeights(template.id), [template.id]);
  const widths = weights.map(w => (PAGE_WIDTH - 2 * data.pagePadding - (weights.length - 1) * 24) * w / weights.reduce((a,b)=>a+b,0));
  const units = useMemo(() => data.sections.filter(s=>s.visible).flatMap((section,index) => {
    const content = section.components.flatMap(source => splitDescription(source, data, Math.min(...widths)).map(item=>({item, sourceId:source.id})));
    if (!content.length) return [{ key: section.id, sourceId: "", section, index, first: true } as Unit];
    return content.map(({item,sourceId},i)=>({key:`${section.id}-${item.id}`, item, sourceId, section, index, first:i===0}));
  }), [data, template.id]);

  useLayoutEffect(() => {
    const measure = measureRef.current;
    if (!measure) return;
    const calculate = () => {
      const header = measure.querySelector<HTMLElement>(".resume-identity")!.offsetHeight;
      const lanes = Array.from(measure.querySelectorAll<HTMLElement>(".measure-lane"));
      const heights = lanes.map(lane => Array.from(lane.querySelectorAll<HTMLElement>("[data-measure-unit]")).map(el=>el.offsetHeight));
      const heads = lanes.map(lane => Array.from(lane.querySelectorAll<HTMLElement>(".resume-section-heading")).map(el=>el.offsetHeight));
      const shell = lanes.map(lane => {
        const card = lane.querySelector<HTMLElement>(".resume-section-fragment");
        if (!card) return 0;
        const css = getComputedStyle(card);
        return [css.paddingTop,css.paddingBottom,css.borderTopWidth,css.borderBottomWidth,css.marginBottom].reduce((n,v)=>n+(parseFloat(v)||0),0);
      });
      const capacity = PAGE_HEIGHT - 2 * data.pagePadding - 76;
      const paginate = (balance: boolean): Page[] => {
        const result: Page[] = [];
        let cursor = 0;
        do {
          const page: Page = weights.map(()=>[]);
          const room = capacity - (result.length === 0 ? header : 54);
          // Balance the final spread without splitting an ordinary section if it fits.
          const remaining = units.slice(cursor).reduce((total,u,j) => total + (heights[0]?.[cursor+j]||0) + (u.first ? (heads[0]?.[u.index]||28)+shell[0]+14 : 0),0);
          const budget = balance && weights.length > 1 && remaining < room * weights.length ? Math.min(room, Math.max(160,remaining / weights.length + 50)) : room;
          for (let lane=0;lane<weights.length && cursor<units.length;lane++) {
            let used=0;
            while (cursor < units.length) {
              const unit=units[cursor], last=page[lane].at(-1);
              const newSection = last?.section.id !== unit.section.id;
              const overhead = newSection ? (heads[lane]?.[unit.index]||28) + shell[lane] + 14 : 0;
              const height = heights[lane]?.[cursor] || 0;
              // Keep a short whole section together across columns, but allow long
              // sections to continue naturally onto the next column or page.
              if (newSection && used > 0 && lane < weights.length - 1) {
                let groupHeight=overhead;
                for(let i=cursor;i<units.length && units[i].section.id===unit.section.id;i++) groupHeight+=heights[lane]?.[i]||0;
                if (groupHeight <= room && used + groupHeight > budget) break;
              }
              if (used + height + overhead > room && page[lane].length) break;
              if (newSection) page[lane].push({section:unit.section,index:unit.index,units:[],continued:!unit.first});
              page[lane].at(-1)!.units.push(unit);
              used += height + overhead; cursor++;
              if (used >= budget && lane < weights.length-1) break;
            }
          }
          result.push(page);
        } while(cursor<units.length);
        return result;
      };
      const result=paginate(true);
      setPages(result);
      onPageCount(result.length);
    };
    calculate();
    const observer=new ResizeObserver(calculate);
    observer.observe(measure);
    return ()=>observer.disconnect();
  },[data,units,weights,onPageCount]);

  const body = (fragment: Fragment, interactive: boolean) => <>
    {heading(fragment.section,fragment.index,fragment.continued,interactive && editable ? () => activate({ section: fragment.section.id }) : undefined)}
    {interactive && editable && <div className="section-drag-tools" data-html2canvas-ignore="true">
      <button className="preview-section-handle" aria-label={`拖拽栏目：${fragment.section.title}`} title="拖动整个栏目" onPointerDown={e=>beginDrag(e,{section:fragment.section.id})}><GripVertical size={17}/><span>栏目</span></button>
      <button aria-label={`编辑栏目：${fragment.section.title}`} onClick={()=>onEdit({section:fragment.section.id})}><Pencil size={14}/></button>
      <button aria-label={`添加组件到：${fragment.section.title}`} onClick={()=>onAddComponent(fragment.section.id)}><Plus size={16}/></button>
    </div>}
    <div className="section-components">
      {fragment.units.map(unit=> <div className={`resume-unit ${selection?.component === unit.sourceId ? "layout-selected" : ""} ${dragging?.component === unit.sourceId ? "drag-placeholder" : ""}`} key={unit.key} data-measure-unit={!interactive ? "true" : undefined} data-edit-unit={interactive && editable && unit.item ? unit.sourceId : undefined} data-edit-section={interactive && editable && unit.item ? unit.section.id : undefined}>
        {unit.item ? <><div className="component-edit-target" role={interactive && editable ? "button" : undefined} tabIndex={interactive && editable ? 0 : undefined} aria-label={interactive && editable ? `编辑组件：${unit.item.title || unit.section.title}` : undefined} onClick={e=>{if(interactive && editable && !(e.target as HTMLElement).closest("a"))activate({section:unit.section.id,component:unit.sourceId});}} onKeyDown={e=>{if(interactive && editable && (e.key==="Enter"||e.key===" ")){e.preventDefault();activate({section:unit.section.id,component:unit.sourceId});}}}>
          <ComponentContent item={unit.item} accent={data.accent}/>
        </div>
        {interactive && editable && <div className="preview-unit-tools" data-html2canvas-ignore="true"><button className="preview-drag-handle" aria-label={`拖拽组件：${unit.item.title||unit.section.title}`} title="拖动排序、跨栏目移动；横向拖动缩进" onPointerDown={e=>beginDrag(e,{section:unit.section.id,component:unit.sourceId})}><GripVertical size={17}/></button><button aria-label={`打开编辑：${unit.item.title||unit.section.title}`} onClick={()=>onEdit({section:unit.section.id,component:unit.sourceId})}><Pencil size={14}/></button></div>}</> : <div className="empty-section-space">{interactive && editable && <button data-html2canvas-ignore="true" onClick={()=>onAddComponent(unit.section.id)}><Plus size={16}/>添加第一个组件</button>}</div>}
      </div>)}
    </div>
  </>;

  return <div className={`resume-pages ${layoutMode ? "layout-active" : ""}`} data-drag-surface="preview" aria-label={dragging ? "正在实时拖拽排版，按 Escape 取消" : undefined}>
    <div ref={measureRef} className={`resume-measure ${classes}`} style={resumeStyle(data)} aria-hidden="true">
      <Identity data={data}/>
      <div className="measure-columns">{widths.map((width,lane)=><div className={`measure-lane resume-column column-${lane}`} style={{width}} key={lane}>
        {data.sections.filter(s=>s.visible).map((section,index)=><section className="resume-section-fragment" key={section.id}>{body({section,index,continued:false,units:units.filter(u=>u.section.id===section.id)},false)}</section>)}
      </div>)}</div>
    </div>
    {pages.map((page,pageIndex)=><article key={pageIndex} className={`resume-page ${classes} ${editable ? "preview-editable" : ""}`} style={resumeStyle(data)} data-pdf-page="true" aria-label={`简历第 ${pageIndex+1} 页`}>
      <PageScenery template={template} accent={data.accent}/>
      <div className="page-content">
        {pageIndex===0 ? <div className="identity-edit-target" role={editable?"button":undefined} tabIndex={editable?0:undefined} aria-label={editable?"编辑预览中的个人信息":undefined} onClick={()=>editable&&onEdit("personal")} onKeyDown={e=>{if(editable&&(e.key==="Enter"||e.key===" ")){e.preventDefault();onEdit("personal");}}}>
          <Identity data={data}/>{editable&&<span className="identity-edit-label" data-html2canvas-ignore="true"><Pencil size={13}/>编辑个人信息</span>}
        </div> : <div className="continuation-heading"><span>{data.name}<i>/</i>{data.role}</span><span>RÉSUMÉ</span></div>}
        {!units.length && editable && <div className="blank-canvas-hint" data-html2canvas-ignore="true"><span>一张白纸，无限可能</span><p>点按上方填写个人信息，添加栏目开始创作。</p><button className="secondary-button" onClick={onAddSection}><Plus size={17}/>添加第一个栏目</button></div>}
        <div className="resume-columns" style={{gridTemplateColumns:weights.map(w=>`${w}fr`).join(" ")}}>
          {page.map((fragments,lane)=><div className={`resume-column column-${lane}`} key={lane}>
            {fragments.map(fragment=><section className={`resume-section-fragment ${selection?.section === fragment.section.id && !selection.component ? "layout-selected" : ""} ${dragging && !dragging.component && dragging.section===fragment.section.id?"drag-placeholder":""}`} key={fragment.section.id} data-drag-section={editable?fragment.section.id:undefined}>{body(fragment,true)}</section>)}
          </div>)}
        </div>
      </div>
      <footer className="paper-footer"><span>{data.name}<i> · </i>个人简历</span><span className="paper-page-number">{data.exportSettings.pageNumbers&&<>{String(pageIndex+1).padStart(2,"0")}<i> / </i>{String(pages.length).padStart(2,"0")}</>}</span><span className="paper-watermark">{data.exportSettings.watermark&&<>Made with Birchify <span className="footer-leaf">✳</span></>}</span></footer>
    </article>)}
  </div>;
}
