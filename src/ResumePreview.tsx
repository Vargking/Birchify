import { type CSSProperties } from "react";
import {
  Globe2,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { backgrounds, templates } from "./data";
import { BirchLogo } from "./icons";
import { Artwork } from "./Artwork";
import { DecorationIcon } from "./IconLibrary";
import type { ResumeComponent, ResumeData } from "./types";
import { designVariables, designFor } from "./designs";

export const PAGE_WIDTH = 794;
export const PAGE_HEIGHT = 1123;
const fonts = {
  sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif',
  serif: 'Georgia, "Noto Serif SC", "Songti SC", SimSun, serif',
  mono: '"SFMono-Regular", Consolas, "Microsoft YaHei", monospace',
};

export function resumeStyle(data: ResumeData): CSSProperties {
  const cartoon = templates.find(t => t.id === data.template)?.motif;
  return {
    ...designVariables(data.template),
    "--resume-accent": data.accent,
    "--resume-font-size": `${data.fontSize}px`,
    "--resume-line-height": data.lineHeight,
    "--resume-padding": `${data.pagePadding}px`,
    fontFamily: cartoon && data.font === "sans"
      ? '"Chalkboard SE", "Comic Sans MS", "YouYuan", "Microsoft YaHei", sans-serif'
      : fonts[data.font],
    background: data.exportSettings.background
      ? (data.background === "template" ? designFor(data.template).paper : undefined) || backgrounds.find((b) => b.id === data.background)?.value || "#fff"
      : "#fff",
  } as CSSProperties;
}

export function Identity({ data }: { data: ResumeData }) {
  const motif = templates.find((t) => t.id === data.template)?.motif;
  return (
    <div className="resume-identity">
      {data.exportSettings.watermark && (
        <div className="paper-brand">
          <span>
            <BirchLogo size={19} />
            <b>Birchify</b>
          </span>
          <span className="paper-kicker">A LITTLE ABOUT MY JOURNEY</span>
        </div>
      )}
      <div className="identity-main">
        <div>
          <div className="resume-eyebrow">HELLO, I'M</div>
          <h1 className={!data.name ? "empty-name" : undefined}>
            {data.name}
            <span className="name-dot">.</span>
          </h1>
          <p className="resume-role">{data.role}</p>
        </div>
        {data.photo ? (
          <img
            className={`resume-photo photo-${data.photoShape}`}
            src={data.photo}
            alt="个人照片"
          />
        ) : motif ? (
          <Artwork
            motif={motif}
            size={112}
            className="identity-mascot"
            style={{ color: data.accent }}
          />
        ) : data.template !== "blank" ? (
          <div className="identity-art" aria-hidden="true">
            <div />
            <div />
            <span>
              let's
              <br />
              grow.
            </span>
            <svg width="72" height="68" viewBox="0 0 72 68">
              <path
                d="M36 62V27M35 39C13 41 13 15 13 15s24-2 22 24ZM37 47c0-25 25-28 25-28s4 27-25 28Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              />
            </svg>
          </div>
        ) : null}
      </div>
      <div className="resume-contact">
        {data.email && (
          <span>
            <Mail />
            {data.email}
          </span>
        )}
        {data.phone && (
          <span>
            <Phone />
            {data.phone}
          </span>
        )}
        {data.location && (
          <span>
            <MapPin />
            {data.location}
          </span>
        )}
        {data.website && (
          <span>
            <Globe2 />
            {data.website}
          </span>
        )}
      </div>
    </div>
  );
}

function safeLink(value: string) {
  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);
    return ["http:", "https:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export function ComponentContent({
  item,
  accent,
}: {
  item: ResumeComponent;
  accent: string;
}) {
  const color = item.color || accent;
  return (
    <div
      className={`component-layout ${item.icon && !["spacer", "divider"].includes(item.type) ? "component-with-icon" : ""}`}
      style={
        {
          width: `min(${item.width}%, calc(100% - ${item.indent}px))`,
          marginLeft: item.indent,
          "--item-color": color,
        } as CSSProperties
      }
    >
      {item.icon && !["spacer", "divider"].includes(item.type) && (
        <span
          className={`component-decoration decoration-${item.iconStyle}`}
          style={{
            color:
              item.iconStyle === "badge" && !item.icon.startsWith("original-")
                ? "#fff"
                : color,
            background:
              item.iconStyle === "badge"
                ? color
                : item.iconStyle === "soft"
                  ? `${color}18`
                  : undefined,
          }}
        >
          <DecorationIcon
            name={item.icon}
            size={item.icon.startsWith("original-") ? 38 : 21}
          />
        </span>
      )}
      <ComponentBody item={item} accent={accent} />
    </div>
  );
}

function ComponentBody({
  item,
  accent,
}: {
  item: ResumeComponent;
  accent: string;
}) {
  const color = item.color || accent;
  const style = {
    "--item-color": color,
    fontSize: item.fontSize,
    marginBottom: item.spacing,
    textAlign: item.align,
    fontWeight: item.bold ? 650 : undefined,
  } as CSSProperties;
  if (item.type === "spacer")
    return (
      <div
        className="resume-component component-spacer"
        style={{ ...style, height: item.value, marginBottom: 0 }}
      />
    );
  if (item.type === "divider")
    return (
      <div
        className="resume-component component-divider"
        style={{
          ...style,
          borderTop: `1px ${item.style === "dots" ? "dotted" : item.style} ${color}`,
        }}
      />
    );
  if (item.type === "progress")
    return (
      <div
        className={`resume-component component-progress progress-${item.style}`}
        style={style}
      >
        {item.style === "circle" ? (
          <>
            <div className="progress-ring">
              <svg viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="27"
                  fill="none"
                  stroke="#e8ece7"
                  strokeWidth="5"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="27"
                  fill="none"
                  stroke={color}
                  strokeWidth="5"
                  strokeDasharray={`${item.value * 1.6965} 169.65`}
                  strokeLinecap="round"
                  transform="rotate(-90 32 32)"
                />
              </svg>
              <span>
                {item.value}
                <small>%</small>
              </span>
            </div>
            <b>{item.title}</b>
          </>
        ) : (
          <>
            <div className="progress-label">
              <span>{item.title}</span>
              <span>{item.value}%</span>
            </div>
            {item.style === "bar" ? (
              <div className="progress-track">
                <div style={{ width: `${item.value}%`, background: color }} />
              </div>
            ) : (
              <div className={`progress-segments segments-${item.style}`}>
                {Array.from({ length: 20 }, (_, i) => (
                  <i
                    key={i}
                    style={{
                      background:
                        i < Math.round(item.value / 5) ? color : "#e8ece7",
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  if (item.type === "tags")
    return (
      <div
        className={`resume-component component-tags tags-${item.style}`}
        style={style}
      >
        {item.title
          .split(/[,，\n]/)
          .filter(Boolean)
          .map((tag, i) => (
            <span key={i}>{tag.trim()}</span>
          ))}
      </div>
    );
  if (item.type === "image")
    return (
      <figure
        className={`resume-component component-image image-${item.style}`}
        style={style}
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.title || "简历图片"}
            style={{ maxHeight: Math.min(item.value * 3 + 40, 340) }}
          />
        ) : (
          <div className="paper-image-placeholder">在编辑器中上传你的图片</div>
        )}
        {item.title && <figcaption>{item.title}</figcaption>}
      </figure>
    );
  if (item.type === "quote")
    return (
      <blockquote
        className={`resume-component component-quote quote-${item.style}`}
        style={style}
      >
        <span className="quotation-mark">“</span>
        <p>{item.title}</p>
        {item.subtitle && <cite>— {item.subtitle}</cite>}
      </blockquote>
    );
  if (item.type === "links")
    return (
      <div
        className={`resume-component component-links item-${item.style}`}
        style={style}
      >
        <a href={safeLink(item.description)} target="_blank" rel="noreferrer">
          {item.title}
          <span>↗</span>
        </a>
        <small>{item.description}</small>
      </div>
    );
  return (
    <div
      className={`resume-component component-${item.type} item-${item.style} align-${item.align} ${item.color ? "has-custom-color" : ""}`}
      style={style}
    >
      {item.type === "timeline" && item.style === "line" && (
        <i className="timeline-dot" />
      )}
      {(item.title || item.date) && (
        <div className="item-title-row">
          <h3>{item.title}</h3>
          {item.date && <time>{item.date}</time>}
        </div>
      )}
      {item.subtitle && <div className="item-subtitle">{item.subtitle}</div>}
      {item.description && (
        <p className="item-description">{item.description}</p>
      )}
    </div>
  );
}

export { default } from "./PagedResume";
