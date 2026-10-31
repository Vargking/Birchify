import type { CSSProperties } from "react";
import {
  AlignLeft,
  ChartNoAxesColumnIncreasing,
  Clock3,
  Code2,
  FolderOpen,
  Image,
  Link,
  Minus,
  MoveVertical,
  Quote,
  Tags,
  Type,
} from "lucide-react";

export function BirchLogo({
  size = 34,
  className = "",
  style,
}: {
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="19" fill="currentColor" />
      <path
        d="M31 48V23"
        stroke="#e6f0cb"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path d="M31 32C13 33 15 16 15 16c16-2 20 9 16 16Z" fill="#d8e7ad" />
      <path d="M33 40c-2-16 16-21 16-21s5 19-16 21Z" fill="#f0f4dc" />
    </svg>
  );
}

export function ComponentIcon({
  type,
  size = 18,
}: {
  type: string;
  size?: number;
}) {
  const Icon =
    (
      {
        text: AlignLeft,
        timeline: Clock3,
        progress: ChartNoAxesColumnIncreasing,
        tags: Tags,
        project: FolderOpen,
        links: Link,
        link: Link,
        image: Image,
        quote: Quote,
        divider: Minus,
        spacer: MoveVertical,
        code: Code2,
        title: Type,
      } as Record<string, typeof Type>
    )[type] || AlignLeft;
  return <Icon size={size} strokeWidth={1.7} />;
}
