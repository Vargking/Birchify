import type { CSSProperties } from "react";
import type { Motif } from "./types";
import { AnimalDrawing, isCuteAnimal } from "./CuteAnimals";
import { NewAnimalDrawing, isNewAnimal } from "./NewAnimals";

// All shapes are original local vector drawings. No character assets or remote images.
export function Artwork({
  motif,
  size = 110,
  className = "",
  style,
}: {
  motif: Motif;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  if (isCuteAnimal(motif)) return <svg width={size} height={size} viewBox="0 0 160 160" fill="none" className={`original-art art-${motif} ${className}`} style={style} aria-hidden="true"><AnimalDrawing motif={motif}/></svg>;
  if (isNewAnimal(motif)) return <svg width={size} height={size} viewBox="0 0 160 160" fill="none" className={`original-art art-${motif} ${className}`} style={style} aria-hidden="true"><NewAnimalDrawing motif={motif}/></svg>;
  const face = (
    <>
      <ellipse cx="65" cy="83" rx="3" ry="4" fill="#66564c" />
      <ellipse cx="95" cy="83" rx="3" ry="4" fill="#66564c" />
      <ellipse cx="54" cy="95" rx="7" ry="3.5" fill="#e3a6a0" opacity=".65" />
      <ellipse cx="106" cy="95" rx="7" ry="3.5" fill="#e3a6a0" opacity=".65" />
      <path
        d="M74 98q6 7 12 0"
        fill="none"
        stroke="#66564c"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </>
  );
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      className={`original-art art-${motif} ${className}`}
      style={style}
      aria-hidden="true"
    >
      <circle cx="80" cy="80" r="66" fill="currentColor" opacity=".07" />
      {motif === "bear" && (
        <>
          <circle
            cx="43"
            cy="47"
            r="19"
            fill="#c6a276"
            stroke="#9e805c"
            strokeWidth="2.5"
          />
          <circle
            cx="117"
            cy="47"
            r="19"
            fill="#c6a276"
            stroke="#9e805c"
            strokeWidth="2.5"
          />
          <circle cx="43" cy="47" r="10" fill="#e2c5a0" />
          <circle cx="117" cy="47" r="10" fill="#e2c5a0" />
          <path
            d="M31 83c0-61 98-61 98 0 0 39-21 54-49 54S31 122 31 83Z"
            fill="#d7b68c"
            stroke="#9e805c"
            strokeWidth="2.5"
          />
          <ellipse cx="80" cy="100" rx="19" ry="15" fill="#f3e4ce" />
          {face}
          <ellipse cx="80" cy="93" rx="6" ry="4" fill="#795f47" />
          <path
            d="M109 129c-2-17 11-23 17-18 3 11-4 20-17 18Z"
            fill="#93a780"
          />
          <path d="m110 130 9-14" stroke="#657b56" strokeWidth="1.5" />
        </>
      )}
      {motif === "flower" && (
        <>
          <path
            d="M80 113v34m0-16c-19 1-26-10-24-18 15-3 25 6 24 18Zm1 8c19 1 26-10 24-18-15-3-25 6-24 18Z"
            stroke="#8b9e70"
            strokeWidth="3"
            fill="#b4c39b"
            strokeLinecap="round"
          />
          {[0, 60, 120, 180, 240, 300].map((r, i) => (
            <ellipse
              key={r}
              cx="80"
              cy="43"
              rx={18 + (i % 2) * 2}
              ry="24"
              fill={i % 2 ? "#edc1bd" : "#f0d3b4"}
              stroke="#d9aaa3"
              strokeWidth="1.5"
              transform={`rotate(${r} 80 77)`}
            />
          ))}
          <circle
            cx="80"
            cy="77"
            r="28"
            fill="#f8e6a6"
            stroke="#d6bd75"
            strokeWidth="2"
          />
          <g transform="translate(0 -9)">{face}</g>
        </>
      )}
      {motif === "rabbit" && (
        <>
          <path
            d="M48 61c-23-60 9-75 18-10m29 0c8-66 41-49 18 12"
            fill="#f4e9dd"
            stroke="#bda59a"
            strokeWidth="2.5"
          />
          <path
            d="M52 42c-9-25 3-28 6 3m45 0c4-30 16-27 8-2"
            stroke="#d9adaf"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <ellipse
            cx="80"
            cy="92"
            rx="49"
            ry="44"
            fill="#f5eadf"
            stroke="#bda59a"
            strokeWidth="2.5"
          />
          {face}
          <path d="m77 92 3 3 4-3" fill="#c7999c" />
          <path d="m115 126 12-8 8 13-14 6Z" fill="#b7bd99" />
        </>
      )}
      {motif === "bird" && (
        <>
          <path
            d="M40 100c-19-2-25-19-25-19s26-7 34 8c-8-38 13-64 42-62 35 3 45 44 25 78-16 26-65 21-76-5Z"
            fill="#bfd7de"
            stroke="#799ca7"
            strokeWidth="2.5"
          />
          <path d="M70 76c-28-5-31 20-15 27 14 6 31-5 35-14" fill="#8eb6c1" />
          <circle cx="104" cy="62" r="3.5" fill="#587178" />
          <path d="m123 68 18 7-18 8" fill="#e8bc7d" />
          <path
            d="m77 125-4 13m24-14 4 14"
            stroke="#a18763"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path d="M82 33c-13-17-1-22 4-10 5-17 17-10 7 5" fill="#c9dcb0" />
        </>
      )}
      {motif === "fox" && (
        <>
          <path
            d="m32 74 0-47 37 26q11-4 23 0l35-28 2 50c0 36-49 62-49 62S31 110 32 74Z"
            fill="#dfae83"
            stroke="#ab7d59"
            strokeWidth="2.5"
          />
          <path d="m42 59 0-16 15 14m48 0 14-16 1 20" fill="#f0d2ba" />
          <path
            d="M36 82c28-18 43 13 44 28 3-15 22-42 46-27-12 28-46 48-46 48S48 109 36 82Z"
            fill="#faeddc"
          />
          {face}
          <path d="m74 99 6 7 6-7Z" fill="#7c5b47" />
          <path d="M71 47c1-14 17-22 26-16-3 17-14 21-26 16Z" fill="#98a67d" />
        </>
      )}
      {motif === "cloud" && (
        <>
          <path
            d="M34 105C6 99 17 63 39 65c-2-41 54-49 64-13 24-8 41 16 32 33 21 25-9 46-36 35-20 11-42 9-49-1-8 1-15-4-16-14Z"
            fill="#e5edf5"
            stroke="#a1b5c8"
            strokeWidth="2.5"
          />
          {face}
          <path
            d="m44 137-5 8m44-8-3 10m42-14-2 9"
            stroke="#c1d1df"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </>
      )}
      {motif === "sun" && (
        <>
          {Array.from({ length: 10 }, (_, i) => (
            <path
              key={i}
              d="M80 17v10"
              transform={`rotate(${i * 36} 80 80)`}
              stroke="#d9b66b"
              strokeWidth="5"
              strokeLinecap="round"
            />
          ))}
          <circle
            cx="80"
            cy="80"
            r="42"
            fill="#f3d894"
            stroke="#d2b16d"
            strokeWidth="2.5"
          />
          {face}
        </>
      )}
      {motif === "star" && (
        <>
          <path
            d="m80 20 18 36 39 8-27 30 5 41-35-19-36 19 6-41-27-30 39-8Z"
            fill="#e7d9f2"
            stroke="#b39bc9"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {face}
          <path
            d="m123 28 4 8 9 2-7 6 1 9-8-4-8 4 2-9-6-7 9-1Z"
            fill="#eadba7"
          />
        </>
      )}
      {motif === "moon" && (
        <>
          <path
            d="M101 25c-47-2-73 35-59 72 12 34 62 40 85 7-42 7-70-41-26-79Z"
            fill="#eee1b5"
            stroke="#bfaf80"
            strokeWidth="2.5"
          />
          <path
            d="m103 54 6 10 12 3-8 9 1 12-11-6-11 6 2-13-8-9 12-2Z"
            fill="#d3dcee"
          />
          <path
            d="M52 82q4-6 8 0m5 15q7 6 12-2"
            stroke="#9e8d68"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="49" cy="92" r="4" fill="#dda6a0" />
        </>
      )}
      {motif === "planet" && (
        <>
          <circle
            cx="80"
            cy="80"
            r="42"
            fill="#ded0ec"
            stroke="#ac92bf"
            strokeWidth="2.5"
          />
          <path
            d="M43 62c-53 15-39 41 20 42 52 0 90-17 77-31-3-3-8-5-15-5"
            stroke="#b9a683"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="m105 42 8-10m17 76 7 8M32 37l6 4"
            stroke="#b8c8b6"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {face}
        </>
      )}
      {motif === "leaf" && (
        <>
          <path
            d="M80 135V75"
            stroke="#879c72"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M78 92C24 96 26 37 26 37s63-4 52 55Z"
            fill="#c4d4ae"
            stroke="#8fa477"
            strokeWidth="2.5"
          />
          <path
            d="M82 112c-9-57 50-64 50-64s12 63-50 64Z"
            fill="#d9dfb6"
            stroke="#9eae7c"
            strokeWidth="2.5"
          />
          <path d="m45 55 32 37m6 18 32-42" stroke="#9aaf81" strokeWidth="2" />
          <circle cx="53" cy="65" r="2.5" fill="#70805f" />
          <circle cx="68" cy="73" r="2.5" fill="#70805f" />
          <path
            d="m52 77 7 5 6-2"
            stroke="#70805f"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      )}
      <path
        d="m20 124 3 4 5-1-2 5 2 4-5-1-4 3 0-5-4-3 5-1Z"
        fill="currentColor"
        opacity=".3"
      />
    </svg>
  );
}
