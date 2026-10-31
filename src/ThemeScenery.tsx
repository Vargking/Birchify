// Each scene is an original illustration system. The 24 new templates deliberately
// use different objects, border rhythms and page-foot compositions, not a paw print swap.
export const themedSurfaces = new Set(["bamboo", "teahouse", "parcel", "orchard", "bakery", "pocket", "confetti", "gingham", "aviary", "nightmarket", "playground", "savanna", "pond", "wool", "river", "ice", "puddle", "meadow", "gumtree", "mushroom", "acorn", "soda", "spa", "dream"]);

export function ThemeScenery({ surface, ink, tint }: { surface: string; ink: string; tint: string }) {
  if (!themedSurfaces.has(surface)) return null;
  return <g data-theme-decoration={surface} stroke={ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
    {surface === "bamboo" && <g>
      {[29,766].map((x,i)=><g key={x}><path d={`M${x} 1050V80`} stroke={tint} strokeWidth="9"/>{[160,320,480,640,800,960].map(y=><g key={y}><path d={`M${x-6} ${y}h12`}/><path d={`M${x} ${y}q${i?-30:30}-30 ${i?-9:9}-52q18 28 ${i?9:-9} 52Z`} fill={tint} stroke="none"/></g>)}</g>)}
      <path d="M80 1081q80-12 128 0m-103-11q18-32 34-8m4 7q16-38 35-14" stroke={tint} strokeWidth="5"/>
    </g>}
    {surface === "teahouse" && <g>
      {Array.from({length:13},(_,i)=><path key={i} d={`M${21+i*58} 21h54v18q-27 24-54 0Z`} fill={i%2?tint:"#fffaf0"} stroke={tint}/>)}
      <g transform="translate(84 1021)"><ellipse cx="37" cy="65" rx="50" ry="7" fill={tint} stroke="none"/><path d="M7 8h59l-6 49q-23 17-47 0Z" fill="#fffaf0"/><path d="M66 20q38-4 19 22H63M24 0q-8-11 2-18m19 17q-7-11 2-18"/><path d="M13 38h47" stroke={tint} strokeWidth="8"/><circle cx="28" cy="49" r="3" fill={ink}/><circle cx="43" cy="51" r="3" fill={ink}/></g>
      {[200,450,700,950].map(y=><path key={y} d={`M755 ${y}h16m-8-8v16`} stroke={tint}/>)}</g>}
    {surface === "parcel" && <g>
      {Array.from({length:18},(_,i)=><path key={i} d={`M18 ${72+i*54}l16 10m726 0 16-10`} stroke={tint} strokeWidth="8"/>)}
      <g transform="translate(72 1020)"><path d="M0 18 45 0l50 19v42L47 79 0 60Z" fill="#fff3e4"/><path d="m0 18 47 21 48-20M47 39v40M25 9l47 20v19"/><circle cx="114" cy="44" r="23" stroke={tint} strokeWidth="3"/><path d="M99 43h30m-29 7h27m-87 49q90-8 150 0" strokeDasharray="4 5"/></g>
    </g>}
    {surface === "orchard" && <g>
      {[26,768].map((x,i)=><g key={x}><path d={`M${x} 1000V140q${i?-35:35}-40 0-80`} stroke={tint} strokeWidth="4"/>{[220,450,680,910].map((y,n)=><g key={y} transform={`translate(${x} ${y})`}><path d={`M0 0q${i?-15:15}-30 ${i?-24:24}-10`} stroke={tint}/><path d={`M${i?-17:7}-15q-18-8-13 12q10 14 22 0q6-18-9-12Z`} fill="#e9c3a4" stroke="none"/><path d={`M${i?-17:17}-16q12-16 15-5q-3 7-15 5Z`} fill={tint} stroke="none"/><circle cx={i?-22:12} cy="-7" r={n%2?2:1} fill="#fff8e7" stroke="none"/></g>)}</g>)}
      <path d="M100 1055h100l-12 37h-75Z" fill={tint}/><path d="M117 1054q33-50 65 0m-60 11 6 20m19-20v20m21-20-6 20"/></g>}
    {surface === "bakery" && <g>
      {[30,765].map(x=><g key={x}><path d={`M${x} 960V220`} stroke={tint}/>{[260,390,520,650,780,910].map(y=><path key={y} d={`M${x} ${y}q-22-8-16-25q19 2 16 25q22-8 16-25q-19 2-16 25Z`} fill={tint} stroke="none"/>)}</g>)}
      <g transform="translate(73 1018)"><path d="M0 59q-12-51 36-51h29q47 0 36 51Z" fill="#efd7aa"/><path d="m25 24-8 17m33-17-8 17m33-17-8 17" stroke="#fff8de" strokeWidth="6"/><path d="M-10 72h125" stroke={tint} strokeWidth="4"/><path d="M119 56q1-40 40-25l-12 15q-17-8-11 13Z" fill={tint}/></g>
      <path d="M200 30h390" stroke={tint} strokeDasharray="2 9" strokeWidth="5"/></g>}
    {surface === "pocket" && <g>
      <path d="M25 100V1035q0 46 45 46h630q45 0 45-46V100" stroke={tint} strokeWidth="5" strokeDasharray="3 9"/>
      <g fill={tint} stroke="none">{[230,480,730].map(y=><g key={y}><circle cx="28" cy={y} r="11"/><circle cx="768" cy={y+100} r="9"/></g>)}</g>
      <path d="M89 1018h112v43q-56 57-112 0Z" fill="#eee4f5"/><path d="M96 1027h98v32q-49 44-98 0Z" strokeDasharray="3 5"/><path d="M125 1018v-27h44v27" stroke={tint} strokeWidth="7"/></g>}
    {surface === "confetti" && <g>
      <path d="m27 190 13 25-15 11m736 67-17 24 19 18M23 651q26-15 14 11t1 20m725 111-16 28" stroke={tint} strokeWidth="8"/>
      {[82,245,623,731].map((x,i)=><rect key={x} x={x} y={25+i%2*12} width="20" height="9" rx="3" fill={tint} stroke="none" transform={`rotate(${i*17} ${x} 30)`}/>)}
      <g transform="translate(68 1019)"><path d="M0 36q0-36 52-34q53 4 42 38q-4 13-25 7q-18-2-10 16q-47 18-59-27Z" fill="#ffe4eb"/><circle cx="21" cy="28" r="7" fill="#e8b7c6" stroke="none"/><circle cx="43" cy="17" r="7" fill="#c7d9bb" stroke="none"/><circle cx="68" cy="21" r="7" fill="#c9cee8" stroke="none"/><path d="m98 65 23-54m-28 59 12-8 1 12" strokeWidth="5"/></g></g>}
    {surface === "gingham" && <g stroke="none" fill={tint} opacity=".8">
      {Array.from({length:27},(_,i)=><g key={i}><rect x="15" y={25+i*39} width="23" height="18"/><rect x="756" y={45+i*39} width="23" height="18"/></g>)}
      {Array.from({length:17},(_,i)=><g key={i}><rect x={50+i*41} y="25" width="24" height="15"/><rect x={50+i*41} y="1084" width="24" height="15"/></g>)}
      <g stroke={ink} strokeWidth="2" transform="translate(95 1027)"><path d="M0 26h89l-8 38H8Z" fill="#ede4c4"/><path d="M15 26q30-48 59 0M8 42h73m-65-14 5 30m20-30v30m20-30-5 30" fill="none"/><path d="M101 58q-3-27 16-33q20 6 15 33Z" fill="#e5c2b2"/><path d="m111 25 8-10 6 10" fill={tint}/></g></g>}
    {surface === "aviary" && <g>
      {[0,1,2,3,4].map(i=><path key={i} d={`M62 ${1045+i*9}q100-30 220-5t185-6`} stroke={tint}/>)}
      {[80,145,223,310,414].map((x,i)=><g key={x}><ellipse cx={x} cy={1067+i%2*7} rx="7" ry="5" fill={ink} stroke="none"/><path d={`M${x+6} ${1067+i%2*7}v-28l12 4`}/></g>)}
      {[34,762].map(x=><g key={x} transform={`translate(${x} 350)`}><path d="M0 0q-26-30 0-60q26 30 0 60Zm0-6v-40" fill={tint} stroke={tint}/><ellipse cy="-36" rx="6" ry="10" stroke={ink}/><path d="M0 12v40"/></g>)}</g>}
    {surface === "nightmarket" && <g>
      <path d="M20 21q380 50 754 0"/>{[95,245,395,545,695].map((x,i)=><g key={x}><path d={`M${x} ${30+i%2*5}v14`}/><rect x={x-11} y={44+i%2*5} width="22" height="24" rx="8" fill={tint}/><path d={`M${x-5} ${72+i%2*5}h10`}/></g>)}
      <g transform="translate(78 1023)"><path d="M0 24h111l-10-24H11Z" fill={tint}/><path d="M10 25v48h90V25M10 53h90m-58 0V25m30 28V25"/><path d="M-5 73h120" strokeWidth="4"/><circle cx="133" cy="28" r="7" fill="#f0dfaf" stroke="none"/></g></g>}
    {surface === "playground" && <g>
      {[30,760].map((x,i)=><g key={x}><rect x={x-12} y={290+i*190} width="25" height="25" rx="5" fill={tint}/><path d={`m${x-13} ${540+i*170} 13-24 13 24Z`} fill="#e2c0a1" stroke="none"/><circle cx={x} cy={850-i*110} r="12" fill="#d0d7b1" stroke="none"/></g>)}
      <g transform="translate(83 1030)"><rect y="28" width="43" height="42" rx="5" fill={tint}/><path d="m-5 26 27-27 27 27Z" fill="#e5b795"/><path d="M60 70V31q0-43 47-43t47 43v39h-25V31q0-20-22-20T85 31v39Z" fill="#dfcc96"/><circle cx="179" cy="52" r="17" fill="#c3d2b0"/></g></g>}
    {surface === "savanna" && <g>
      <g transform="translate(130 1090)" fill={tint} stroke={tint}><circle r="30"/>{Array.from({length:10},(_,i)=><path key={i} d="M0-46v8" transform={`rotate(${i*36})`} strokeWidth="5"/>)}</g>
      <path d="M240 1094q80-33 150 0t180-2t200-6M25 320q30 10 11 43m-1-20-12-9m739 316q-30 10-11 43m1-20 12-9" stroke={tint} strokeWidth="4"/>
      {[370,610,850].map(y=><path key={y} d={`M768 ${y}q-13-22-20 0q10 16 20 0Z`} fill={tint} stroke="none"/>)}</g>}
    {surface === "pond" && <g>
      {[330,650,890].map((y,i)=><g key={y} transform={`translate(${i%2?754:37} ${y})`}><ellipse rx="24" ry="8" stroke={tint}/><path d="M-17-3q7-30 27-15l-9 10Z" fill={tint} stroke="none"/></g>)}
      <g transform="translate(120 1060)"><ellipse rx="74" ry="17" stroke={tint} strokeWidth="3"/><path d="M-46 0q1-40 61-20L0-3l24 8q-45 20-70-5Z" fill={tint}/><path d="M44-3q-23-13-14-29q17 2 18 16q1-18 16-20q13 16-4 30Z" fill="#e9becb" stroke="#c795a7"/></g></g>}
    {surface === "wool" && <g>
      {[28,766].map(x=><path key={x} d={`M${x} 200q-15 13 0 26t0 26t0 26m0 220q15 13 0 26t0 26t0 26m0 220q-15 13 0 26t0 26t0 26`} stroke={tint} strokeWidth="5"/>)}
      <g transform="translate(127 1055)"><circle r="33" fill="#f5e6ec"/><path d="m-28-16 48 40m-37-49 46 39m-43 14 42-40m-55 21 47 39" stroke={tint} strokeWidth="3"/><path d="M30 15q38-22 36 7t28 10m-100-52 31-48m-7 48-29-48"/></g>
      <path d="M250 32h280" stroke={tint} strokeWidth="4" strokeDasharray="2 7"/></g>}
    {surface === "river" && <g>
      {[29,766].map(x=><path key={x} d={`M${x} 180q-17 34 0 68t0 68t0 68t0 68t0 68t0 68t0 68t0 68t0 68t0 68t0 68t0 68`} stroke={tint} strokeWidth="4"/>)}
      <g transform="translate(70 1031)"><path d="m0 22 55 39 53-39Z" fill={tint}/><path d="M55 22V-14l33 36Zm0 0H15L55-8" fill="#fffdf0"/><path d="M-10 70q35-16 70 0t70 0m-90 13q35-13 70 0" stroke={tint} strokeWidth="3"/></g></g>}
    {surface === "ice" && <g>
      {[220,530,840].flatMap(y=>[30,765].map(x=><g key={`${x}-${y}`} transform={`translate(${x} ${y})`} stroke={tint}>{[0,60,120].map(a=><path key={a} d="M0-17v34m-7-27 7 5 7-5m-14 20 7-5 7 5" transform={`rotate(${a})`}/>)}</g>))}
      <g transform="translate(83 1015)"><rect x="15" y="50" width="13" height="32" rx="5" fill="#ddc7a9"/><rect width="44" height="60" rx="20" fill="#c8dbef"/><path d="M12 16v24m13-24v24" stroke="#fff7ef" strokeWidth="5"/><path d="m65 77 25-48 34 48Zm53 0 20-35 25 35" fill={tint}/></g></g>}
    {surface === "puddle" && <g>
      {[200,350,500,650,800,950].flatMap((y,i)=>[30,764].map(x=><path key={`${x}-${y}`} d={`M${x} ${y}q-13 18 0 18q13 0 0-18Z`} fill={i%2?tint:"#d9e8de"} stroke="none"/>))}
      <g transform="translate(86 1018)"><ellipse cx="48" cy="69" rx="66" ry="9" fill={tint} stroke="none"/><path d="M0 5h29v38l14 2v17H0Zm49-5h29v38l14 2v17H49Z" fill="#e5d89b"/><path d="M4 13h21m28-5h21" stroke="#fff9e7" strokeWidth="4"/><path d="M109 35q-7-20 10-26q16 7 10 26m-10-26v35q5 10 12 0" stroke={tint}/></g></g>}
    {surface === "meadow" && <g>
      {[32,762].map(x=><g key={x}>{[220,440,660,880].map((y,i)=><g key={y} transform={`translate(${x} ${y})`}><path d="M0 30V-15m0 24q-17-3-13-14q12-1 13 14m0 7q17-3 13-14q-12-1-13 14" stroke={tint}/>{[0,72,144,216,288].map(a=><ellipse key={a} cy="-19" rx="4" ry="8" transform={`rotate(${a} 0 -10)`} fill={i%2?"#e3c8b3":"#dad9b5"} stroke="none"/>)}<circle cy="-10" r="4" fill={ink} stroke="none"/></g>)}</g>)}
      <path d="M92 1090q12-63 25-25m-4 25q23-50 38-23m-6 22q16-45 33-28" stroke={tint} strokeWidth="3"/></g>}
    {surface === "gumtree" && <g>
      {[27,768].map((x,n)=><g key={x}><path d={`M${x} 1000q${n?-10:10}-380 0-760`} stroke={tint} strokeWidth="3"/>{[260,360,460,560,660,760,860,960].map((y,i)=><g key={y} fill={tint} stroke="none"><ellipse cx={x+(i%2?-8:8)} cy={y} rx="12" ry="18" transform={`rotate(${i%2?-32:32} ${x} ${y})`}/><ellipse cx={x+(i%2?8:-8)} cy={y+20} rx="9" ry="14"/></g>)}</g>)}
      <path d="M90 1085q30-60 115-54m-102 39q-4-29 25-22q-3 20-25 22m25-19q2-27 25-21q-2 21-25 21m27-13q8-24 30-15q-8 19-30 15" fill={tint} stroke="none"/></g>}
    {surface === "mushroom" && <g>
      {[28,764].map(x=><g key={x}>{[260,520,780].map(y=><g key={y} transform={`translate(${x} ${y})`}><path d="M-5-1h10v23h-10Z" fill="#eee0c9" stroke={tint}/><path d="M-17 0q17-32 34 0Z" fill={tint} stroke="none"/><circle cx="-4" cy="-9" r="3" fill="#fff6e9" stroke="none"/></g>)}</g>)}
      <g transform="translate(117 1061)"><path d="M-17-4h34v39h-34Z" fill="#eee0c9"/><path d="M-51 0q51-86 102 0Z" fill="#dcae9e"/><path d="M-24-12h1m30-18h1m16 20h1" stroke="#fff7eb" strokeWidth="9"/><path d="M-50 1h100"/></g></g>}
    {surface === "acorn" && <g>
      {[30,763].flatMap(x=>[230,470,710,950].map(y=><g key={`${x}-${y}`} transform={`translate(${x} ${y})`}><path d="M-10 0q-2 23 10 28q12-5 10-28" fill={tint}/><path d="M-14 0q14-21 28 0Zm14-11v-7" fill="#dfd2b5"/></g>))}
      <g transform="translate(81 1027)"><rect width="132" height="63" rx="6" fill="#f3e5c7"/><path d="M44 0v63m44-63v63M0 30h132"/><path d="M15 17h14m30 0h14m30 0h14M15 46h14m30 0h14m30 0h14" strokeWidth="3"/></g></g>}
    {surface === "soda" && <g>
      {[200,380,560,740,920].map((y,i)=><g key={y} stroke={tint}><circle cx="28" cy={y} r={i%2?12:7}/><circle cx="764" cy={y+65} r={i%2?7:13}/><circle cx="42" cy={y+36} r="3"/><circle cx="750" cy={y+95} r="3"/></g>)}
      <g transform="translate(99 1012)"><path d="M0 0h49l-8 76H8Z" fill="#e3f4ef"/><path d="M7 34h35l-4 35H10Z" fill={tint} stroke="none"/><path d="m28 50 8-69 15-5"/><circle cx="49" cy="13" r="17" fill="#ecdfac"/><path d="m38 5 22 16m-8-22-8 26" stroke="#fff9dd"/><circle cx="18" cy="57" r="3" fill="#fff" stroke="none"/></g></g>}
    {surface === "spa" && <g>
      {[30,763].flatMap(x=>[300,620,940].map(y=><g key={`${x}-${y}`} transform={`translate(${x} ${y})`} fill={tint} stroke="none"><ellipse cy="12" rx="17" ry="7"/><ellipse rx="12" ry="6"/><ellipse cy="-10" rx="8" ry="5"/></g>))}
      <g transform="translate(123 1060)"><ellipse rx="61" ry="23" fill="#dbe6d8"/><ellipse cy="-3" rx="48" ry="14" stroke={tint} strokeWidth="4"/><path d="M-24-37q-9-12 0-23m24 20q-9-12 0-23m24 26q-9-12 0-23" stroke={tint} strokeWidth="3"/><circle cx="26" cy="-3" r="9" fill="#e9cf80" stroke="none"/><path d="M24-11q4-10 12-5q-3 7-12 5Z" fill={ink} stroke="none"/></g></g>}
    {surface === "dream" && <g>
      {[29,766].map((x,i)=><g key={x}><path d={`M${x} ${380+i*280}q20 115 0 185t0 170`} stroke={tint}/><ellipse cx={x} cy={350+i*280} rx="22" ry="29" fill={tint} stroke="none"/><path d={`m${x-4} ${380+i*280} 4-6 4 6Z`} fill={tint} stroke="none"/><path d={`M${x-10} ${337+i*280}q-5 8 0 15`} stroke="#fffaf5" strokeWidth="3"/></g>)}
      <g transform="translate(133 1038)"><path d="M-29 3q-12-58 29-58t29 58l-15 31h-28Z" fill="#e6d9ef"/><path d="M0-55q-20 50-14 89m14-89q20 50 14 89M-29 3h58M-14 34v19m28-19v19"/><path d="M-16 52h32l-4 19h-24Z" fill="#e3cda9"/></g></g>}
  </g>;
}
