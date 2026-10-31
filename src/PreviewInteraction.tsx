import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { ResumeData } from "./types";

export interface PreviewTarget { section: string; component: string }
export type DragTarget = { section: string; component?: string };

export function reorderResume(data: ResumeData, source: DragTarget, target: DragTarget, after: boolean): ResumeData {
  if (!source.component) {
    if (source.section === target.section) return data;
    const sections = [...data.sections];
    const index = sections.findIndex(s => s.id === source.section);
    if (index < 0 || !sections.some(s => s.id === target.section)) return data;
    const [section] = sections.splice(index, 1);
    const destination = sections.findIndex(s => s.id === target.section) + Number(after);
    if (destination === index) return data;
    sections.splice(destination, 0, section);
    return { ...data, sections };
  }
  if (source.component === target.component) return data;
  const sections = data.sections.map(s => ({ ...s, components: [...s.components] }));
  const from = sections.find(s => s.id === source.section), to = sections.find(s => s.id === target.section);
  const index = from?.components.findIndex(c => c.id === source.component) ?? -1;
  if (!from || !to || index < 0) return data;
  const [component] = from.components.splice(index, 1);
  const destination = target.component ? to.components.findIndex(c => c.id === target.component) : to.components.length;
  const insertion = Math.max(0, destination + (target.component ? Number(after) : 0));
  if (from === to && insertion === index) return data;
  to.components.splice(insertion, 0, component);
  return { ...data, sections };
}

// Clone the real rendered content, including inherited theme styles. The floating
// copy survives React reflows, so changing columns/pages cannot detach the pointer.
function floatingSnapshot(element: HTMLElement, rect: DOMRect) {
  const clone = element.cloneNode(true) as HTMLElement;
  const originals = [element, ...element.querySelectorAll<HTMLElement>("*")];
  const copies = [clone, ...clone.querySelectorAll<HTMLElement>("*")];
  originals.forEach((node, i) => {
    const computed = getComputedStyle(node);
    for (const property of Array.from(computed)) copies[i].style.setProperty(property, computed.getPropertyValue(property));
    for (const attribute of Array.from(copies[i].attributes)) {
      if (attribute.name.startsWith("data-") || attribute.name === "id" || attribute.name === "tabindex") copies[i].removeAttribute(attribute.name);
    }
  });
  clone.querySelectorAll(".preview-unit-tools, .section-drag-tools, .editor-section-handle, .section-tools, .component-actions, .add-component-button").forEach(n => n.remove());
  Object.assign(clone.style, { width: `${element.offsetWidth}px`, height: "auto", margin: "0", transform: "none", opacity: "1", position: "relative", left: "auto", top: "auto" });
  const shell = document.createElement("div");
  shell.className = "drag-content-preview";
  shell.setAttribute("aria-hidden", "true");
  shell.dataset.html2canvasIgnore = "true";
  Object.assign(shell.style, { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` });
  const scaler = document.createElement("div");
  Object.assign(scaler.style, { width: `${element.offsetWidth}px`, transform: `scale(${rect.width / element.offsetWidth})`, transformOrigin: "top left" });
  scaler.append(clone);
  shell.append(scaler);
  document.body.append(shell);
  return shell;
}

export function usePreviewDrag({ data, onCommit, onEdit, surface = "preview" }: {
  data: ResumeData;
  onCommit: (next: ResumeData) => void;
  onEdit?: (target: DragTarget) => void;
  surface?: "preview" | "editor";
}) {
  const [draft, setDraft] = useState<ResumeData | null>(null);
  const [dragging, setDragging] = useState<DragTarget | null>(null);
  const cleanupRef = useRef<() => void>(() => {});
  const callbacks = useRef({ data, onCommit, onEdit });
  callbacks.current = { data, onCommit, onEdit };
  useEffect(() => () => cleanupRef.current(), []);

  const beginDrag = (event: ReactPointerEvent<HTMLButtonElement>, original: DragTarget) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    cleanupRef.current();
    const root = event.currentTarget.closest<HTMLElement>(`[data-drag-surface="${surface}"]`);
    const sourceElement = event.currentTarget.closest<HTMLElement>(original.component ? "[data-edit-unit]" : "[data-drag-section]");
    const visual = original.component ? sourceElement?.querySelector<HTMLElement>(".component-edit-target") : sourceElement;
    if (!root || !visual) return;
    const rect = visual.getBoundingClientRect();
    const scale = rect.width / visual.offsetWidth;
    const scroller = event.currentTarget.closest<HTMLElement>(surface === "preview" ? ".preview-scroll" : ".editor-scroll");
    const base = callbacks.current.data;
    let next = base, source = { ...original }, floating: HTMLElement | null = null;
    let x = event.clientX, y = event.clientY, started = false, frame = 0, ended = false;
    const startX = x, startY = y;
    const pointerId = event.pointerId;
    // Capture on the stable surface, not a handle that can unmount when content
    // crosses a column or page. This is essential for native touch dragging.
    try { root.setPointerCapture(pointerId); } catch { /* Synthetic test pointers have no active capture. */ }
    const hitTest = () => {
      if (!started || ended) return;
      const at = document.elementFromPoint(x, y);
      if (!at || !root.contains(at)) return;
      const unit = original.component ? at.closest<HTMLElement>("[data-edit-unit]") : null;
      const section = at.closest<HTMLElement>("[data-drag-section]");
      if (!unit && !section) return;
      const element = unit || section!;
      const target: DragTarget = { section: unit?.dataset.editSection || section!.dataset.dragSection!, component: unit?.dataset.editUnit };
      if (original.component ? source.component === target.component : source.section === target.section) return;
      const box = element.getBoundingClientRect();
      const updated = reorderResume(next, source, target, y > box.top + box.height / 2);
      if (updated !== next) {
        next = updated;
        if (source.component) source = { ...source, section: target.section };
        setDragging(source);
        setDraft(next);
      }
    };
    const tick = () => {
      if (ended) return;
      if (started && scroller) {
        const box = scroller.getBoundingClientRect();
        const speed = y < box.top + 60 ? -Math.min(16, (box.top + 60 - y) / 4) : y > box.bottom - 60 ? Math.min(16, (y - box.bottom + 60) / 4) : 0;
        if (speed && x >= box.left && x <= box.right) { scroller.scrollBy(0, speed); hitTest(); }
      }
      frame = requestAnimationFrame(tick);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      e.preventDefault();
      x = e.clientX; y = e.clientY;
      if (!started && Math.hypot(x - startX, y - startY) > 5) {
        started = true;
        floating = floatingSnapshot(visual, rect);
        setDragging(source);
        setDraft(next);
        document.body.classList.add("is-dragging-preview");
      }
      if (!started) return;
      Object.assign(floating!.style, { left: `${rect.left + x - startX}px`, top: `${rect.top + y - startY}px` });
      if (source.component && Math.abs(y - startY) < 14 && Math.abs(x - startX) > 8) {
        const initial = base.sections.find(s => s.id === original.section)?.components.find(c => c.id === original.component);
        next = { ...next, sections: next.sections.map(s => ({ ...s, components: s.components.map(c => c.id === source.component ? { ...c, indent: Math.max(0, Math.min(120, Math.round((initial?.indent || 0) + (x - startX) / scale))) } : c) })) };
        setDraft(next);
      } else hitTest();
    };
    const cleanup = () => {
      ended = true;
      cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
      document.removeEventListener("pointercancel", cancel);
      document.removeEventListener("keydown", key);
      window.removeEventListener("blur", cancel);
      floating?.remove();
      setDraft(null); setDragging(null);
      document.body.classList.remove("is-dragging-preview");
      if (root.hasPointerCapture(pointerId)) root.releasePointerCapture(pointerId);
      cleanupRef.current = () => {};
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      cleanup();
      if (started && next !== base) callbacks.current.onCommit(next);
      else if (!started) callbacks.current.onEdit?.(original);
    };
    const cancel = () => cleanup();
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); cleanup(); } };
    document.addEventListener("pointermove", move, { passive: false });
    document.addEventListener("pointerup", up);
    document.addEventListener("pointercancel", cancel);
    document.addEventListener("keydown", key);
    window.addEventListener("blur", cancel);
    frame = requestAnimationFrame(tick);
    cleanupRef.current = cleanup;
  };
  return { beginDrag, draft, dragging };
}
