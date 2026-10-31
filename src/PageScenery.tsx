import { Artwork } from "./Artwork";
import { designFor } from "./designs";
import type { Template } from "./types";
import { ThemeScenery, themedSurfaces } from "./ThemeScenery";

function Paw({ x, y, turn = 0 }: { x: number; y: number; turn?: number }) {
  return <g transform={`translate(${x} ${y}) rotate(${turn})`}><ellipse cy="7" rx="8" ry="6"/><ellipse cx="-10" cy="-2" rx="3" ry="4"/><ellipse cx="-4" cy="-9" rx="3" ry="4"/><ellipse cx="4" cy="-9" rx="3" ry="4"/><ellipse cx="10" cy="-2" rx="3" ry="4"/></g>;
}
function Flower({ x, y, size = 1 }: { x: number; y: number; size?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${size})`}><g fill="currentColor">{[0, 60, 120, 180, 240, 300].map(a => <ellipse key={a} cy="-10" rx="7" ry="9" transform={`rotate(${a})`}/>)}</g><circle r="6" fill="#fff5cb"/><path d="M-2 0h1m4 0h1" stroke="#6f6555" strokeWidth="2" strokeLinecap="round"/></g>;
}

// Original page-wide SVG scenery. All artwork is local, reusable at any PDF DPI.
export function PageScenery({ template, accent = template.color }: { template: Template; accent?: string }) {
  const d = designFor(template.id), motif = template.motif;
  if (!motif) return <div className="design-scene" aria-hidden="true"><span/><span/><span/></div>;
  const secondary = d.secondary || "#e8ede7";
  const garden = ["garden", "forest"].includes(d.surface);
  const sky = ["sky", "cosmos", "night", "sunny"].includes(d.surface);
  const customScene = themedSurfaces.has(d.surface);
  return <div className={`cartoon-scene scene-${d.surface}`} aria-hidden="true">
    <svg className="whole-page-scene" width="794" height="1123" viewBox="0 0 794 1123" fill="none">
      {!customScene && <rect x="14" y="14" width="766" height="1095" rx={d.surface === "letter" ? 4 : 32} stroke={secondary} strokeWidth="3" strokeDasharray={d.surface === "postcard" ? "12 8" : undefined}/>}
      <ThemeScenery surface={d.surface} ink={accent} tint={secondary}/>
      {d.surface === "journal" && <g fill={secondary}>{Array.from({length:16},(_, i)=><g key={i}><rect x="10" y={60+i*64} width="36" height="12" rx="6"/><circle cx="36" cy={66+i*64} r="3" fill="#fff"/></g>)}</g>}
      {d.surface === "honey" && <><path d="M16 16H778V64q-18 36-36 0v-8q-18-27-36 0v26q-18 38-36 0V44H124v22q-18 38-36 0V52q-18-27-36 0v20q-18 36-36 0Z" fill={secondary}/><path d="M35 1066q90-42 170 0t180 0t180 0t180 0" stroke={secondary} strokeWidth="8"/><g stroke={secondary} strokeWidth="2" opacity=".55">{Array.from({length:12},(_,i)=><path key={i} d={`M748 ${140+i*70}l20-12 20 12v24l-20 12-20-12Z`}/>)}</g></>}
      {garden && <><path d="M16 1065Q110 1012 224 1064T440 1060T778 1050V1107H16Z" fill={secondary}/><g stroke={accent} strokeWidth="2" opacity=".5">{[42,75,700,746].map((x,i)=><path key={x} d={`M${x} 1090q-10-34 ${i%2?10:-8}-63m${i%2?-10:8} 30q-30-10-20-27m20 27q23-20 25-7`}/>)}</g></>}
      {sky && <><path d="M16 72Q60 25 110 63Q148 5 210 50Q242 22 280 40" stroke={secondary} strokeWidth="12" strokeLinecap="round"/><path d="M570 1081q22-37 58-14q29-44 68-17q45-32 82 4v52H570Z" fill={secondary}/>{[45,754,728,57,735,34].map((x,i)=><path key={i} d={`M${x} ${160+i*157}l3 8 8 3-8 3-3 8-3-8-8-3 8-3Z`} fill={accent} opacity=".48"/>)}</>}
      {["cat", "dog", "bear", "fox", "rabbit"].includes(motif) && <g fill={secondary}><Paw x={35} y={324} turn={-22}/><Paw x={762} y={545} turn={28}/><Paw x={32} y={778} turn={-18}/><Paw x={720} y={1081} turn={30}/><Paw x={671} y={1062} turn={-12}/></g>}
      {motif === "flower" && <g color={secondary}><Flower x={41} y={190}/><Flower x={757} y={392} size={.8}/><Flower x={36} y={754} size={.9}/><Flower x={706} y={1080} size={1.4}/><Flower x={659} y={1090} size={.8}/></g>}
      {["letter", "postcard"].includes(d.surface) && <><path d="M24 24l35 22 35-22M700 1097l35-22 35 22" stroke={secondary} strokeWidth="4"/><path d="M24 46H94M700 1074h70" stroke={secondary} strokeWidth="2" strokeDasharray="4 4"/><g stroke={secondary} strokeWidth="6">{Array.from({length:22},(_,i)=><path key={i} d={`M18 ${65+i*46}l14 14m730 0 14 14`}/>)}</g></>}
      {d.surface === "trail" && <><path d="M28 220q25 50 0 100t0 100t0 100t0 100t0 100t0 100t50 140" stroke={secondary} strokeWidth="4" strokeDasharray="5 9" strokeLinecap="round"/><path d="M190 1100l70-49 55 30 62-46 73 65m205-1067 28 38 30-30 40 29" stroke={secondary} strokeWidth="3" strokeLinejoin="round"/><g transform="translate(750 130)" stroke={accent} opacity=".55"><circle r="16"/><path d="m0-23 4 20-4 26-4-26Z"/><path d="M-23 0h46"/></g></>}
      {d.surface === "cushion" && <g stroke={secondary} strokeWidth="3"><path d="M30 180q-22 22 0 44t0 44t0 44M764 670q22 22 0 44t0 44t0 44M160 1093q22-22 44 0t44 0t44 0"/><path d="M620 31h122q21 0 21 21v96" strokeDasharray="5 6"/><path d="m55 1014 15-12 16 12-5 20H60Z" fill={secondary}/></g>}
      {d.surface === "garden" && <g stroke={secondary} strokeWidth="3"><path d="M29 950q28-90 0-180t0-180t0-180M765 260q-28-90 0-180"/>{[380,550,730,900].map((y,i)=><path key={y} d={`M29 ${y}q${i%2?32:-26}-28 0-42q-15 18 0 42Z`} fill={secondary}/>)}</g>}
      {d.surface === "forest" && <g fill={secondary} stroke={accent} strokeWidth="1.5" opacity=".7">{[50,105,590,740].map((x,i)=><g key={x} transform={`translate(${x} ${1064+i%2*13})`}><path d="m0-48-17 23h9l-15 23H23L8-25h9Z"/><path d="M0-2V14"/></g>)}</g>}
      {d.surface === "cosmos" && <g stroke={secondary} strokeWidth="2.5"><ellipse cx="732" cy="1020" rx="70" ry="24" transform="rotate(-28 732 1020)"/><circle cx="732" cy="1020" r="34" fill={secondary}/><path d="m27 190 10 54-12 54 13 44m705 165 21 51-25 38" strokeDasharray="3 6"/><circle cx="37" cy="244" r="7" fill={secondary}/><circle cx="764" cy="558" r="7" fill={secondary}/></g>}
      {d.surface === "night" && <g fill={secondary}><path d="M753 200a30 30 0 1 1-31-47 25 25 0 0 0 31 47Z"/><path d="M16 1094q180-58 350 0t412-4v17H16Z"/>{[32,757].flatMap(x=>[350,580,810].map(y=><circle key={`${x}-${y}`} cx={x} cy={y} r="3"/>))}</g>}
      {d.surface === "sunny" && <g stroke={secondary} strokeWidth="4" strokeLinecap="round"><path d="M70 1107a80 80 0 0 1 160 0" fill={secondary}/>{[-60,-30,0,30,60].map(a=><path key={a} d="M150 1009v-15" transform={`rotate(${a} 150 1107)`}/>)}</g>}
      {!customScene && <g fill={secondary}><circle cx="757" cy="135" r="4"/><circle cx="42" cy="990" r="5"/><path d="M735 840h14m-7-7v14M55 450h12m-6-6v12" stroke={secondary} strokeWidth="3" strokeLinecap="round"/></g>}
    </svg>
    <Artwork motif={motif} size={64} className="scene-companion"/>
  </div>;
}
