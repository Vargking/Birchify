import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

export function IconButton({
  children,
  label,
  onClick,
  disabled,
  className = "",
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      className={`icon-button ${className}`}
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export function Modal({
  title,
  subtitle,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const root = ref.current;
    root?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
      if (event.key === "Tab" && root) {
        const focusable = Array.from(
          root.querySelectorAll<HTMLElement>(
            'button:not(:disabled), input, textarea, select, a[href], [tabindex="0"]',
          ),
        );
        const first = focusable[0],
          last = focusable[focusable.length - 1];
        if (
          event.shiftKey &&
          (document.activeElement === first || document.activeElement === root)
        ) {
          event.preventDefault();
          last?.focus();
        } else if (
          !event.shiftKey &&
          (document.activeElement === last || document.activeElement === root)
        ) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        className={`modal ${wide ? "modal-wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <header className="modal-header">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <IconButton label="关闭弹窗" onClick={onClose}>
            <X size={19} />
          </IconButton>
        </header>
        {children}
      </div>
    </div>
  );
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  maxLength,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
  type?: string;
}) {
  return (
    <label className={`field ${multiline ? "field-textarea" : ""}`}>
      <span>{label}</span>
      {multiline ? (
        <textarea
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          maxLength={maxLength || 20000}
        />
      ) : (
        <input
          aria-label={label}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength || 160}
        />
      )}
    </label>
  );
}

export function RangeControl({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="range-control">
      <span>
        {label}
        <output aria-hidden="true">
          {Number(value.toFixed(2))}
          {suffix}
        </output>
      </span>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          backgroundSize: `${((value - min) / (max - min)) * 100}% 100%`,
        }}
      />
    </label>
  );
}

export function readImage(
  file: File | undefined,
  onLoad: (data: string) => void,
  onError: (message: string) => void,
) {
  if (!file) return;
  if (
    !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)
  ) {
    onError("请选择 JPG、PNG、WebP 或 GIF 图片");
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    onError("图片请控制在 5 MB 以内");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => onLoad(reader.result as string);
  reader.onerror = () => onError("图片读取失败，请重试");
  reader.readAsDataURL(file);
}
