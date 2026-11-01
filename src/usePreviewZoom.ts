import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
const clamp = (n: number) => Math.max(.25, Math.min(2, n));

// Preserve the document coordinate under the two fingers as React resizes it.
export function usePreviewZoom(ref: RefObject<HTMLDivElement | null>, scale: number, setZoom: (n: number | null) => void) {
  const current = useRef(scale); current.current = scale;
  const anchor = useRef<{ x: number; y: number; clientX: number; clientY: number } | null>(null);
  useLayoutEffect(() => {
    const el = ref.current, point = anchor.current;
    if (!el || !point) return;
    const paper = el.querySelector<HTMLElement>(".pages-viewport");
    if (!paper) return;
    const box = paper.getBoundingClientRect();
    el.scrollLeft += box.left + point.x * scale - point.clientX;
    el.scrollTop += box.top + point.y * scale - point.clientY;
    anchor.current = null;
  }, [scale, ref]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let gesture: { distance: number; scale: number; x: number; y: number } | null = null;
    let ignoreClickUntil = 0;
    const centre = (t: TouchList) => ({ x: (t[0].clientX + t[1].clientX) / 2, y: (t[0].clientY + t[1].clientY) / 2 });
    const distance = (t: TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    const start = (e: TouchEvent) => {
      if (e.touches.length !== 2) return;
      e.preventDefault();
      const box = el.querySelector(".pages-viewport")!.getBoundingClientRect(), c = centre(e.touches);
      gesture = { distance: Math.max(1, distance(e.touches)), scale: current.current, x: (c.x - box.left) / current.current, y: (c.y - box.top) / current.current };
      el.dataset.pinching = "true";
    };
    const move = (e: TouchEvent) => {
      if (!gesture || e.touches.length !== 2) return;
      e.preventDefault();
      const c = centre(e.touches), next = clamp(gesture.scale * distance(e.touches) / gesture.distance);
      anchor.current = { x: gesture.x, y: gesture.y, clientX: c.x, clientY: c.y };
      if (next === current.current) {
        const box = el.querySelector(".pages-viewport")!.getBoundingClientRect();
        el.scrollLeft += box.left + gesture.x * next - c.x;
        el.scrollTop += box.top + gesture.y * next - c.y;
      }
      setZoom(next);
    };
    const end = () => { if (gesture) ignoreClickUntil = Date.now() + 350; gesture = null; delete el.dataset.pinching; };
    const click = (e: MouseEvent) => { if (Date.now() < ignoreClickUntil) { e.preventDefault(); e.stopPropagation(); } };
    const wheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const box = el.querySelector(".pages-viewport")!.getBoundingClientRect();
      anchor.current = { x: (e.clientX - box.left) / current.current, y: (e.clientY - box.top) / current.current, clientX: e.clientX, clientY: e.clientY };
      setZoom(clamp(current.current * Math.exp(-e.deltaY * .008)));
    };
    el.addEventListener("touchstart", start, { passive: false }); el.addEventListener("touchmove", move, { passive: false });
    el.addEventListener("touchend", end); el.addEventListener("touchcancel", end); el.addEventListener("click", click, true); el.addEventListener("wheel", wheel, { passive: false });
    return () => { el.removeEventListener("touchstart", start); el.removeEventListener("touchmove", move); el.removeEventListener("touchend", end); el.removeEventListener("touchcancel", end); el.removeEventListener("click", click, true); el.removeEventListener("wheel", wheel); };
  }, [ref, setZoom]);
}
