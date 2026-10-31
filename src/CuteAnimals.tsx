import type { Motif } from "./types";

export const animalNames = {
  cat: "栖栖猫", dog: "豆豆犬", panda: "团团熊猫", "red-panda": "邮差小熊猫",
  hamster: "面包仓鼠", pig: "画家小猪猪", raccoon: "晚安小浣熊", tiger: "积木小老虎",
  lion: "日光小狮子", frog: "荷塘小青蛙", sheep: "织梦小绵羊", otter: "漂流水獭",
  penguin: "冰淇淋企鹅", duck: "雨靴小鸭", deer: "采花小鹿", koala: "慢慢考拉",
  hedgehog: "蘑菇小刺猬", squirrel: "橡果小松鼠", seal: "苏打小海豹", capybara: "温泉卡皮巴拉",
  elephant: "气球小象", alpaca: "奶茶羊驼", turtle: "果园小龟", chinchilla: "口袋绒鼠",
  cow: "野餐小奶牛", peacock: "音乐小孔雀",
} as const;
export const isCuteAnimal = (motif: Motif): motif is keyof typeof animalNames => motif in animalNames;

function Face({ y = 77, spread = 18, nose = true, dark = "#554940" }: { y?: number; spread?: number; nose?: boolean; dark?: string }) {
  return <g stroke="none">
    {[-1, 1].map(sign => <g key={sign}>
      <ellipse cx={80 + sign * spread} cy={y} rx="4" ry="5" fill={dark}/>
      <circle cx={79 + sign * spread} cy={y - 1.5} r="1.3" fill="#fff"/>
      <ellipse cx={80 + sign * (spread + 9)} cy={y + 11} rx="7" ry="4" fill="#edb7ac" opacity=".72"/>
    </g>)}
    {nose && <path d={`M76 ${y+10}q4-4 8 0l-4 4Z`} fill={dark}/>}
    <path d={nose ? `M80 ${y+14}q-5 6-9 1m9-1q5 6 9 1` : `M74 ${y+15}q6 6 12 0`} stroke={dark} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
  </g>;
}
function Feet({ fill = "#e7ccac" }: { fill?: string }) {
  return <g fill={fill} stroke="none"><ellipse cx="62" cy="139" rx="13" ry="6"/><ellipse cx="98" cy="139" rx="13" ry="6"/></g>;
}
function Sprig() { return <g fill="#b3c694" stroke="#7f9c71" strokeWidth="1.5"><path d="M108 127q-5-18 9-28q8 14-9 28Zm1-1q6-13 20-11q-2 13-20 11Z"/><path d="m107 134 10-27" fill="none"/></g>; }

// Original, full-body miniatures. Silhouettes, accessories and facial markings
// are drawn per species; no external character assets or trademarked designs.
export function AnimalDrawing({ motif }: { motif: keyof typeof animalNames }) {
  return <g strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" data-animal-drawing={motif}>
    {motif === "cat" && <g stroke="#b5967f">
      <path d="M112 126q35 6 22-25q-5-10-11-3q-4 5 3 12q6 12-13 9" fill="#f5dfbf"/>
      <ellipse cx="80" cy="119" rx="32" ry="26" fill="#f6e5cc"/><Feet/>
      <path d="M34 72q-7-19 0-42q4-8 11-2l21 16q14-4 29 0l20-16q8-6 12 2q7 22-1 43q6 41-46 42q-52-1-46-43Z" fill="#fff1dc"/>
      <path d="m40 53 1-15 15 11m49 0 14-11 1 15" fill="#edb5ab" stroke="none"/>
      <path d="m72 48 2 10m12-11-1 10" stroke="#d0ad81" strokeWidth="5"/>
      <ellipse cx="80" cy="91" rx="21" ry="14" fill="#fffaf0" stroke="none"/><Face/>
      <path d="m40 82-13-2m14 11-13 3m91-12 13-2m-14 11 13 3" stroke="#c4a38a" strokeWidth="1.5"/>
      <path d="m62 115 36-1-1 23H64Z" fill="#e4b7ae" stroke="#c69891"/><path d="m63 116 17 12 17-13" stroke="#fff5e9"/>
      <ellipse cx="60" cy="121" rx="7" ry="10" fill="#fff1dc"/><ellipse cx="100" cy="121" rx="7" ry="10" fill="#fff1dc"/>
    </g>}
    {motif === "dog" && <g stroke="#ac8d6c">
      <path d="M110 123q19-20 26-10q7 14-23 19" fill="#d8b48a"/>
      <ellipse cx="80" cy="117" rx="31" ry="27" fill="#f3dfbd"/><Feet fill="#f1d7af"/>
      <path d="M47 49q-24-11-26 14q-7 42 14 41l17-29m61-26q24-11 26 14q7 42-14 41l-17-29" fill="#caa278"/>
      <path d="M40 65q0-27 40-27t40 27v21q-2 30-40 30T40 86Z" fill="#fff0d5"/>
      <path d="M91 42q25-2 26 23q-2 22-20 14q-18-7-6-37" fill="#dfbd91" stroke="none"/>
      <ellipse cx="80" cy="91" rx="23" ry="17" fill="#fffaf1" stroke="none"/><Face nose={false}/>
      <path d="M73 87q7-5 14 0q0 8-7 8t-7-8" fill="#705748" stroke="none"/><path d="M80 95v5"/>
      <path d="m57 111 24 5 22-5-22 24Z" fill="#a8c6b5" stroke="#7d9d89"/><circle cx="81" cy="122" r="3" fill="#fff5dc" stroke="none"/>
    </g>}
    {motif === "panda" && <g stroke="#62675f">
      <ellipse cx="80" cy="119" rx="31" ry="26" fill="#fffcf1"/><Feet fill="#64675f"/>
      <circle cx="45" cy="40" r="17" fill="#62675f"/><circle cx="115" cy="40" r="17" fill="#62675f"/>
      <rect x="32" y="38" width="96" height="77" rx="36" fill="#fffdf3"/>
      <ellipse cx="60" cy="76" rx="12" ry="16" fill="#696b63" transform="rotate(25 60 76)" stroke="none"/><ellipse cx="100" cy="76" rx="12" ry="16" fill="#696b63" transform="rotate(-25 100 76)" stroke="none"/>
      <Face spread={20} dark="#302e29"/><ellipse cx="53" cy="119" rx="10" ry="17" fill="#64675f" transform="rotate(-30 53 119)"/><Sprig/>
    </g>}
    {motif === "red-panda" && <g stroke="#9c6d52">
      <path d="M107 129q45 1 32-36q-8-19-23-9q-11 9 1 23q14 15-10 15" fill="#d89d73"/>
      <path d="m128 86 10 9m-13 4 15 13m-21 0 10 15" stroke="#805b45" strokeWidth="7"/>
      <ellipse cx="78" cy="120" rx="29" ry="24" fill="#a77455"/><Feet fill="#715546"/>
      <path d="m39 54-4-29q22-1 29 19m33 0q12-21 29-19l-5 31" fill="#ffeedb"/>
      <rect x="30" y="41" width="98" height="73" rx="35" fill="#dca078"/>
      <path d="M34 78q23-20 46 9q24-29 44-9q-3 29-44 32q-40-3-46-32Z" fill="#fff4e5" stroke="none"/>
      <path d="m52 53 10 13m44-13-10 13" stroke="#fff1de" strokeWidth="8"/><Face/>
      <path d="m48 103 52 34" stroke="#d7c7a2" strokeWidth="7"/>
      <rect x="57" y="117" width="40" height="21" rx="3" fill="#d5e0be"/><path d="m59 119 18 12 18-12"/>
    </g>}
    {motif === "raccoon" && <g stroke="#7f7b86">
      <path d="M101 129q20 19 42 1q17-14-3-21q-10-2-22 7" fill="#b8b0c1"/>
      <path d="m116 119 7 17m9-23 6 15" stroke="#776e84" strokeWidth="7"/>
      <path d="M53 102q-17 11-11 31q36 26 68-2q6-24-14-30" fill="#a59daf"/>
      <Feet fill="#777080"/>
      <circle cx="43" cy="43" r="16" fill="#8e859b"/><circle cx="112" cy="43" r="16" fill="#8e859b"/>
      <circle cx="43" cy="43" r="8" fill="#decfdc" stroke="none"/><circle cx="112" cy="43" r="8" fill="#decfdc" stroke="none"/>
      <path d="M29 69q1-29 49-29q48 0 49 29q-1 22-20 32l-29 14-29-14Q30 91 29 69Z" fill="#d1c9d8"/>
      <path d="M34 75q20-22 44-1q23-21 44 1l-17 15-27-8-26 8Z" fill="#736b80" stroke="none"/>
      <path d="M62 89q16-13 33 0l-17 21Z" fill="#fff2df" stroke="none"/>
      <g transform="translate(-2 -2)"><Face spread={19}/></g>
      <path d="m48 112 30 12 27-12-11 24H61Z" fill="#e8d6a6" stroke="#b4a37d"/>
      <path d="M116 106v-9q11-12 17 1v9" fill="none"/>
      <rect x="111" y="105" width="27" height="28" rx="9" fill="#f3dfa0" stroke="#b6a075"/>
      <path d="M119 109v19m9-19v19m-12 8h17" stroke="#c1a66f" strokeWidth="1.5"/>
      <ellipse cx="107" cy="113" rx="7" ry="10" fill="#a59daf"/>
    </g>}
    {(motif === "hamster" || motif === "chinchilla") && <g stroke={motif === "hamster" ? "#ba9a76" : "#a297b1"}>
      {motif === "chinchilla" && <path d="M111 134q38-2 26-24q-4-10-16-8q16 14-15 20" fill="#d3c9df" strokeWidth="5"/>}
      <circle cx="47" cy="37" r={motif === "hamster" ? 15 : 22} fill={motif === "hamster" ? "#e7c8a1" : "#d3c9df"}/><circle cx="113" cy="37" r={motif === "hamster" ? 15 : 22} fill={motif === "hamster" ? "#e7c8a1" : "#d3c9df"}/>
      <circle cx="47" cy="37" r="8" fill="#efc3bb" stroke="none"/><circle cx="113" cy="37" r="8" fill="#efc3bb" stroke="none"/>
      <path d="M31 80q-3-38 49-38t49 38q14 59-49 60T31 80Z" fill={motif === "hamster" ? "#f4dcba" : "#ded6e8"}/>
      <ellipse cx="80" cy="109" rx="37" ry="27" fill="#fff7ec" stroke="none"/><Face spread={22}/><Feet fill="#f0c9b5"/>
      {motif === "hamster" ? <><path d="M63 120q17-29 34 0l-4 15H67Z" fill="#dbaa69"/><path d="m74 117 2 7m9-9 1 8" stroke="#fff0ce" strokeWidth="3"/></> : <><path d="M58 115h44l-5 23H63Z" fill="#afbad1"/><path d="M64 121h32" stroke="#fff6ec" strokeDasharray="2 3"/></>}
    </g>}
    {motif === "pig" && <g stroke="#c593a1">
      <path d="M112 123q29-3 20-17q-8-8-10 2q-1 9 10 8" fill="none"/>
      <ellipse cx="80" cy="118" rx="32" ry="25" fill="#f1c6cd"/><Feet fill="#e5a9b6"/>
      <path d="M42 58 32 31q20-3 30 17m36 0q10-20 30-17l-10 28" fill="#ebb2be"/>
      <rect x="30" y="42" width="100" height="73" rx="35" fill="#f8d8dd"/><Face nose={false}/>
      <ellipse cx="80" cy="92" rx="16" ry="11" fill="#eaa6b4" stroke="none"/><path d="M75 91v3m10-3v3" stroke="#a9677a" strokeWidth="3"/>
      <path d="m53 119 10-12h34l11 13-9 17H61Z" fill="#c2cfdf"/><path d="M64 117h30" stroke="#fff8e9" strokeWidth="4"/>
      <path d="m112 125 11-24" stroke="#b29972" strokeWidth="4"/><path d="m121 101 5-10 3 13" fill="#b8c69d" stroke="none"/>
    </g>}
    {(motif === "tiger" || motif === "lion") && <g stroke="#b18b57">
      <ellipse cx="80" cy="120" rx="29" ry="25" fill="#efcd8e"/><Feet fill="#dfb77b"/>
      {motif === "lion" && <path d="M52 33q11-17 26-6q16-12 28 4q22-3 23 20q20 8 9 29q12 20-8 32q-5 22-27 18q-18 16-34 1q-23 8-31-15q-23-6-15-28q-10-19 7-33q0-22 22-22Z" fill="#d6ab6f"/>}
      <circle cx="44" cy="45" r="14" fill="#e6bd80"/><circle cx="116" cy="45" r="14" fill="#e6bd80"/><circle cx="44" cy="45" r="7" fill="#f9dbb1" stroke="none"/><circle cx="116" cy="45" r="7" fill="#f9dbb1" stroke="none"/>
      <rect x="34" y="40" width="92" height="76" rx="35" fill="#f8dda2"/>
      <ellipse cx="80" cy="94" rx="23" ry="16" fill="#fff4d6" stroke="none"/><Face/>
      {motif === "tiger" && <path d="M69 43 73 54m17-11-3 11M36 72l12 4m-12 9 11 2m77-15-12 4m12 9-11 2" stroke="#a78357" strokeWidth="5"/>}
      <path d="m64 118 16 9 16-9" stroke="#b5c4a1" strokeWidth="7"/>
      {motif === "tiger" ? <><rect x="101" y="124" width="19" height="18" rx="3" fill="#d4dda9"/><path d="m101 125 9-12 10 12Z" fill="#deb992"/></> : <><path d="M119 128q27-9 14-25" fill="none" strokeWidth="5"/><path d="M130 105q-13-8-3-17q13 1 12 14Z" fill="#d6ab6f"/></>}
    </g>}
    {motif === "frog" && <g stroke="#85a47c">
      <ellipse cx="80" cy="122" rx="30" ry="24" fill="#b9d4a3"/><Feet fill="#9ebf8c"/>
      <circle cx="51" cy="49" r="22" fill="#c6dfb1"/><circle cx="109" cy="49" r="22" fill="#c6dfb1"/>
      <rect x="25" y="49" width="110" height="66" rx="33" fill="#c6dfb1"/><ellipse cx="80" cy="97" rx="30" ry="13" fill="#e6edbf" stroke="none"/>
      <Face y={58} spread={29} nose={false}/><path d="M66 96q14 9 28 0" fill="none" stroke="#65835f"/>
      <path d="M91 132q23-28 47-13l-20 15Z" fill="#91b98b"/><path d="m112 128 13-4" stroke="#d8e9b9"/>
    </g>}
    {(motif === "sheep" || motif === "alpaca") && <g stroke="#b6a493">
      <path d="M51 108q-13 4-9 20q-5 14 12 14h52q18 0 12-15q5-17-10-20" fill="#f4eadc"/>
      <Feet fill="#bcaa9c"/>
      {motif === "alpaca" ? <><path d="M60 78v42q20 12 40 0V78" fill="#f4eadc"/><path d="M48 53q-16-48 3-43l13 36m31 0 12-36q20-5 4 43" fill="#f7e9d8"/></> : <><ellipse cx="38" cy="75" rx="19" ry="10" fill="#e1c6bc" transform="rotate(25 38 75)"/><ellipse cx="122" cy="75" rx="19" ry="10" fill="#e1c6bc" transform="rotate(-25 122 75)"/></>}
      <path d="M45 51q-2-18 17-17q11-16 26-5q20-10 27 9q20 4 11 23l-4 32q-8 22-42 22t-42-22V69q-13-13 7-18Z" fill="#fff9ed"/>
      <ellipse cx="80" cy="80" rx="31" ry="26" fill="#ebd8c7" stroke="none"/><Face spread={16}/>
      {motif === "sheep" ? <><circle cx="108" cy="127" r="13" fill="#d7bbce"/><path d="m99 120 16 14m-18-6 21-2" stroke="#fff3f2" strokeWidth="1.4"/></> : <><path d="M58 113h23l-3 22H61Z" fill="#d4b58e"/><path d="M70 115v-12"/><circle cx="68" cy="130" r="2" fill="#8f7763"/><circle cx="73" cy="128" r="2" fill="#8f7763"/></>}
    </g>}
    {motif === "otter" && <g stroke="#a38972">
      <path d="M105 135q36 0 26-24q-6 16-25 12" fill="#bca189"/><ellipse cx="80" cy="118" rx="32" ry="27" fill="#baa08a"/><Feet fill="#b59a81"/>
      <circle cx="42" cy="47" r="12" fill="#b59a81"/><circle cx="118" cy="47" r="12" fill="#b59a81"/><rect x="30" y="42" width="100" height="70" rx="34" fill="#d1b79b"/>
      <ellipse cx="80" cy="91" rx="37" ry="19" fill="#fbecd7" stroke="none"/><Face/>
      <path d="m43 88-14-3m15 10-12 3m85-10 14-3m-15 10 12 3" strokeWidth="1.5"/>
      <path d="M65 128q-9-14 2-17q13-5 13 8q2-13 13-8q11 4 1 17l-14 11Z" fill="#cedfce"/>
    </g>}
    {motif === "penguin" && <g stroke="#8795a6">
      <path d="M43 96q-23 19-20 30q9 4 23-9m71-21q23 19 20 30q-9 4-23-9" fill="#9fabb9"/>
      <path d="M34 99q-7-63 46-63t46 63q12 41-46 43t-46-43Z" fill="#aab5c5"/>
      <path d="M43 86q-4-35 24-31q13 5 13 15q1-10 13-15q29-4 24 31l1 28q-1 24-38 24t-38-24Z" fill="#fffdf0" stroke="none"/><Face nose={false}/>
      <path d="m73 90 7 9 8-9Z" fill="#e9ba76" stroke="none"/><Feet fill="#e5bc86"/><path d="m108 123 12-21 12 21Z" fill="#d8b88d"/><circle cx="120" cy="101" r="11" fill="#efc9d6"/>
    </g>}
    {motif === "seal" && <g stroke="#9eb7bd">
      <path d="M109 114q27-20 32-3l-6 12q24 10 8 17q-21 5-38-12" fill="#c4dfdf"/>
      <path d="M19 99q-4-47 38-45q35-1 42 30q7 11 19 18q24 29-21 38q-79 15-78-41Z" fill="#e5f0ef"/>
      <ellipse cx="59" cy="100" rx="25" ry="18" fill="#fffdf0" stroke="none"/>
      <g transform="translate(-21 13)"><Face spread={16}/></g>
      <path d="m53 100 5 4 5-4m-31 4-13-3m16 11-12 3m59-11 13-3m-16 11 12 3" strokeWidth="1.5"/>
      <path d="M69 125q-10-20-23-12q-8 13 15 25m23-17q11-17 21-9" fill="#cce5e4"/>
      <circle cx="112" cy="77" r="18" fill="#cde9e5" stroke="#b3d7d4"/><path d="M103 66q-8 6-5 12" stroke="#fff" strokeWidth="3"/><circle cx="135" cy="54" r="7" fill="#e3f4ef"/>
    </g>}
    {motif === "duck" && <g stroke="#c5b376">
      <path d="M36 109q-19-2-19-19l22 5q-5-52 42-52q47 0 43 50q15 46-46 47q-34 0-42-31Z" fill="#f4e6a2"/>
      <path d="M73 43q-10-16 1-17q8-2 9 9q11-14 17-4l-9 13" fill="#f4e6a2"/>
      <Face nose={false}/><ellipse cx="80" cy="92" rx="17" ry="8" fill="#eac17f" stroke="none"/>
      <path d="M40 111q18 17 25 1" fill="#edd891"/><Feet fill="#e7ba77"/>
      <path d="M104 124v-22h16l-5 22Z" fill="#b2cfbf"/><path d="M107 106h9" stroke="#fff9dc"/>
    </g>}
    {motif === "deer" && <g stroke="#af9374">
      <path d="M57 42 49 19m2 9-12-3m12 3 5-11m47 25 8-23m-2 9 12-3m-12 3-5-11" fill="none" strokeWidth="4"/>
      <ellipse cx="80" cy="121" rx="28" ry="24" fill="#d7b78f"/><Feet fill="#bc9877"/>
      <path d="M48 52Q10 29 28 66l20 6m64-20q38-23 20 14l-20 6" fill="#d7b78f"/>
      <rect x="36" y="42" width="88" height="74" rx="35" fill="#e8ccaa"/><ellipse cx="80" cy="96" rx="23" ry="15" fill="#fff0d8" stroke="none"/><Face/>
      <g fill="#fff2d9" stroke="none"><circle cx="49" cy="65" r="3"/><circle cx="111" cy="65" r="3"/><circle cx="56" cy="58" r="2"/><circle cx="104" cy="58" r="2"/></g><Sprig/>
    </g>}
    {motif === "koala" && <g stroke="#99a49c">
      <ellipse cx="80" cy="119" rx="29" ry="26" fill="#bfcbc3"/><Feet fill="#abb9af"/>
      <circle cx="33" cy="59" r="24" fill="#c8d1ca"/><circle cx="127" cy="59" r="24" fill="#c8d1ca"/><circle cx="33" cy="59" r="14" fill="#f2e7da" stroke="none"/><circle cx="127" cy="59" r="14" fill="#f2e7da" stroke="none"/>
      <rect x="33" y="38" width="94" height="77" rx="34" fill="#d4ddd5"/><Face spread={23} nose={false}/><rect x="72" y="74" width="16" height="23" rx="8" fill="#7a8379" stroke="none"/><Sprig/>
    </g>}
    {motif === "hedgehog" && <g stroke="#b49a83">
      <path d="m31 104-10-13 12-9-5-14 16-6-1-16 17-1 5-15 15 8 13-10 10 14 16-1 3 17 15 7-4 16 11 11-12 14 4 15-19 2-9 16H48l-9-15-17-2Z" fill="#b9a08b"/>
      <ellipse cx="80" cy="95" rx="45" ry="37" fill="#f8e9d5"/><Face y={84}/><Feet fill="#d7b599"/>
      <path d="M104 126h14v-20h-14Z" fill="#ecdec8"/><path d="M95 109q16-30 33 0Z" fill="#d5a08f"/><path d="M105 104h1m10-1h1" stroke="#fff2dd" strokeWidth="4"/>
    </g>}
    {motif === "squirrel" && <g stroke="#b18c67">
      <path d="M104 133q51-2 40-55q-7-32-29-24q-24 12-3 34q22 29-15 27" fill="#d9b084"/><path d="M118 69q-12 12 2 25" stroke="#f1d7b1" strokeWidth="7"/>
      <ellipse cx="76" cy="121" rx="28" ry="24" fill="#dbbb98"/><Feet fill="#c49c77"/>
      <path d="M41 55 34 22q20 0 28 22m34 0q10-24 28-22l-6 34" fill="#e4c6a3"/>
      <rect x="30" y="43" width="97" height="70" rx="33" fill="#e8ccaa"/><ellipse cx="80" cy="95" rx="29" ry="16" fill="#fff1d9" stroke="none"/><Face/>
      <ellipse cx="80" cy="127" rx="14" ry="15" fill="#c69c68"/><path d="M64 120q16-20 32 0Z" fill="#a58c69"/><path d="M80 109v-5"/>
    </g>}
    {motif === "capybara" && <g stroke="#ac9476">
      <ellipse cx="80" cy="117" rx="37" ry="28" fill="#d5c09a"/><Feet fill="#baa383"/>
      <circle cx="48" cy="42" r="10" fill="#d0b58c"/><circle cx="112" cy="42" r="10" fill="#d0b58c"/>
      <rect x="29" y="40" width="102" height="75" rx="30" fill="#dfcba9"/><path d="M53 77h9m36 0h9" stroke="#796750" strokeWidth="2.5"/>
      <rect x="57" y="86" width="49" height="24" rx="12" fill="#e9d8ba" stroke="none"/><path d="M77 92h6m-3 2v6m-5 0h10" stroke="#92795c" strokeWidth="2"/>
      <circle cx="81" cy="31" r="14" fill="#e9c57b"/><path d="M81 18q9-11 15-4q-3 8-15 4Z" fill="#9cb58a" stroke="none"/>
      <path d="M36 130q44 14 88 0" stroke="#bed2c5" strokeWidth="12"/>
    </g>}
    {motif === "elephant" && <g stroke="#a6a4bc">
      <ellipse cx="80" cy="121" rx="29" ry="23" fill="#d0cde2"/><Feet fill="#b8b4ce"/>
      <ellipse cx="35" cy="78" rx="24" ry="32" fill="#d2cee5"/><ellipse cx="125" cy="78" rx="24" ry="32" fill="#d2cee5"/><ellipse cx="35" cy="78" rx="14" ry="21" fill="#ebd6df" stroke="none"/><ellipse cx="125" cy="78" rx="14" ry="21" fill="#ebd6df" stroke="none"/>
      <rect x="37" y="37" width="86" height="75" rx="35" fill="#dedbef"/><Face spread={24} nose={false}/>
      <path d="M69 84v30q0 20 18 16q12-3 8-15q-8 10-8-1V84" fill="#dedbef"/><path d="M72 105h11m-11 7h11" stroke="#b9b5d0" strokeWidth="1.5"/>
    </g>}
    {motif === "turtle" && <g stroke="#93a46f">
      <ellipse cx="83" cy="114" rx="43" ry="27" fill="#b6c989"/><path d="m69 93 21 2 10 18-12 21-24-4-8-20Z" fill="#ccda9f"/>
      <path d="M46 132q-19 15-17 1l6-12m79 11q20 15 19 1l-7-12" fill="#d5dfae"/>
      <rect x="32" y="44" width="94" height="69" rx="33" fill="#e1e8bf"/><Face nose={false}/>
      <path d="M111 117q10-19 20-1q-1 15-14 11" fill="#dfae91"/><path d="M121 105v-8"/>
    </g>}
    {motif === "cow" && <g stroke="#a8a58f">
      <ellipse cx="80" cy="121" rx="30" ry="23" fill="#fffae7"/><Feet fill="#a4a58e"/>
      <path d="m48 46-3-23q-14 9-9 27m76-4 3-23q14 9 9 27" fill="#d9ca9d"/>
      <path d="M42 54Q9 33 23 64l20 7m75-17q33-21 19 10l-20 7" fill="#d5d9bc"/>
      <rect x="31" y="40" width="98" height="75" rx="32" fill="#fff9e9"/><path d="M97 41q27-3 29 25q-20 12-32-2Z" fill="#9b9f8a" stroke="none"/>
      <Face nose={false}/><ellipse cx="80" cy="96" rx="24" ry="15" fill="#eac6b7" stroke="none"/><path d="M72 94v3m16-3v3" stroke="#a47b71" strokeWidth="3"/>
      <path d="m61 116 19 13 20-13" stroke="#b3c097" strokeWidth="8"/>
    </g>}
    {motif === "peacock" && <g stroke="#83a6a4">
      {[-60,-30,0,30,60].map(a => <g key={a} transform={`rotate(${a} 80 126)`}><ellipse cx="80" cy="65" rx="20" ry="52" fill="#bdd4c4"/><ellipse cx="80" cy="40" rx="11" ry="17" fill="#e7deac" stroke="none"/><ellipse cx="80" cy="40" rx="5" ry="8" fill="#83aeb0" stroke="none"/></g>)}
      <path d="M51 108q-4-46 29-46t29 46q11 37-29 37t-29-37Z" fill="#bdd9db"/>
      <Face y={94} spread={14} nose={false}/><path d="m73 108 7 7 8-7" fill="#d5b579" stroke="none"/><path d="M80 63V49m-6 3 6 11 7-11" fill="none"/><Feet fill="#c5ba8e"/>
    </g>}
  </g>;
}
