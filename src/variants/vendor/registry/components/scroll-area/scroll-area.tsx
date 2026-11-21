"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef } from "react";
import type { CSSProperties, HTMLAttributes, PointerEvent as ReactPointerEvent, ReactNode, Ref, UIEvent } from "react";
import { useReducedMotion } from "@/variants/use-motion-preference";
import { scrollAreaGeometry } from "@/primitives/scroll-area-geometry";
import { motionTokens } from "@/variants/vendor/lib/motion-tokens";
import styles from "./scroll-area.module.css";

type Axis = "y" | "x";

/** Which edges still have content beyond them. */
export interface ScrollAreaEdges { top: boolean; bottom: boolean; left: boolean; right: boolean }

/**
 * A native scroll container with thin overlay scrollbars that appear while scrolling or on hover and fade away at rest.
 * Each edge fades out only when there is more content beyond it, in proportion to how much. Scrolling stays native, so
 * keyboard, touch momentum, and scroll snap all behave as the platform expects.
 */
export interface ScrollAreaProps extends Omit<HTMLAttributes<HTMLDivElement>, "onScroll"> {
  children?: ReactNode;
  /** Axes that scroll. Defaults to vertical. */
  orientation?: "vertical" | "horizontal" | "both";
  /** Length of the edge fade in px. 0 turns the fades off. */
  fade?: number;
  /** "auto" shows scrollbars while scrolling or hovering; "always" keeps them visible when content overflows. */
  scrollbars?: "auto" | "always";
  /** How long scrollbars linger after scrolling stops, in ms. */
  hideDelay?: number;
  /** Maximum height of the viewport, for vertical areas that should grow with their content. */
  maxHeight?: CSSProperties["maxHeight"];
  /** Passed to the viewport's `scroll-snap-type`, for example "x mandatory". Children set their own `scroll-snap-align`. */
  snap?: CSSProperties["scrollSnapType"];
  /** Accessible name. The viewport becomes a labelled, focusable region that arrow and page keys scroll. */
  label?: string;
  /** Turns vertical wheel movement into horizontal scrolling for horizontal areas. Defaults to true. */
  wheelToHorizontal?: boolean;
  viewportClassName?: string;
  viewportStyle?: CSSProperties;
  viewportRef?: Ref<HTMLDivElement>;
  onScroll?: (event: UIEvent<HTMLDivElement>) => void;
  /** Called when content starts or stops extending past an edge. */
  onEdgeChange?: (edges: ScrollAreaEdges) => void;
}

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea({
  children, orientation = "vertical", fade = scrollAreaGeometry.fadePx, scrollbars = "auto", hideDelay = motionTokens.keyframes.scrollArea.hideDelayMs, maxHeight, snap, label,
  wheelToHorizontal = true, viewportClassName, viewportStyle, viewportRef, onScroll, onEdgeChange, className, ...rest
}, forwardedRef) {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const trackTarget = useRef<{ axis: Axis; offset: number } | null>(null);
  const cancelTrackTarget = useCallback(() => { trackTarget.current = null; }, []);
  const viewport = useRef<HTMLDivElement>(null);
  const tracks = useRef<Record<Axis, HTMLDivElement | null>>({ x: null, y: null });
  const thumbs = useRef<Record<Axis, HTMLDivElement | null>>({ x: null, y: null });
  const hideTimer = useRef<number | undefined>(undefined);
  const lastEdges = useRef("");
  const onEdgeRef = useRef(onEdgeChange);
  useImperativeHandle(forwardedRef, () => rootRef.current as HTMLDivElement);
  useImperativeHandle(viewportRef, () => viewport.current as HTMLDivElement);
  useEffect(() => { onEdgeRef.current = onEdgeChange; }, [onEdgeChange]);

  useLayoutEffect(() => {
    const target = trackTarget.current;
    const node = viewport.current;
    if (!reduced || !node || !target) return;
    trackTarget.current = null;
    node.scrollTo({ [target.axis === "y" ? "top" : "left"]: target.offset, behavior: "instant" });
  }, [reduced]);

  const vertical = orientation !== "horizontal", horizontal = orientation !== "vertical";

  /* Everything visual is written straight to the DOM on each scroll frame, so scrolling never re-renders React. */
  const sync = useCallback(() => {
    const node = viewport.current, root = rootRef.current;
    if (!node || !root) return;
    const { scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth } = node;
    const maxY = Math.max(0, scrollHeight - clientHeight), maxX = Math.max(0, scrollWidth - clientWidth);
    // The scrollbar, mask and edge callback describe physical left/right.
    const left = getComputedStyle(node).direction === "rtl"
      ? Math.max(0, Math.min(maxX, maxX + scrollLeft))
      : Math.max(0, Math.min(maxX, scrollLeft));
    const edges: ScrollAreaEdges = { top: vertical && scrollTop > motionTokens.keyframes.scrollArea.edgeTolerancePx, bottom: vertical && maxY - scrollTop > motionTokens.keyframes.scrollArea.edgeTolerancePx, left: horizontal && left > motionTokens.keyframes.scrollArea.edgeTolerancePx, right: horizontal && maxX - left > motionTokens.keyframes.scrollArea.edgeTolerancePx };

    if (fade > 0) {
      node.style.setProperty("--rams-detail-fade-top", `${vertical ? Math.min(fade, scrollTop) : 0}px`);
      node.style.setProperty("--rams-detail-fade-bottom", `${vertical ? Math.min(fade, maxY - scrollTop) : 0}px`);
      node.style.setProperty("--rams-detail-fade-left", `${horizontal ? Math.min(fade, left) : 0}px`);
      node.style.setProperty("--rams-detail-fade-right", `${horizontal ? Math.min(fade, maxX - left) : 0}px`);
    }

    const place = (axis: Axis, scroll: number, max: number, client: number, total: number) => {
      const track = tracks.current[axis], thumb = thumbs.current[axis];
      if (!track || !thumb) return;
      const overflowing = max > motionTokens.keyframes.scrollArea.edgeTolerancePx;
      track.toggleAttribute("data-hidden", !overflowing);
      if (!overflowing) return;
      const length = axis === "y" ? track.clientHeight : track.clientWidth;
      const size = Math.min(length, Math.max(scrollAreaGeometry.minThumbPx, length * client / total));
      const offset = (length - size) * (scroll / max);
      thumb.style[axis === "y" ? "height" : "width"] = `${size}px`;
      thumb.style.transform = axis === "y" ? `translate3d(0, ${offset}px, 0)` : `translate3d(${offset}px, 0, 0)`;
    };
    if (vertical) place("y", scrollTop, maxY, clientHeight, scrollHeight);
    if (horizontal) place("x", left, maxX, clientWidth, scrollWidth);
    root.toggleAttribute("data-overflow", maxY > motionTokens.keyframes.scrollArea.edgeTolerancePx || maxX > motionTokens.keyframes.scrollArea.edgeTolerancePx);

    const key = `${edges.top}${edges.bottom}${edges.left}${edges.right}`;
    if (key !== lastEdges.current) { lastEdges.current = key; onEdgeRef.current?.(edges); }
  }, [fade, horizontal, vertical]);

  useLayoutEffect(() => {
    const node = viewport.current;
    if (!node) return;
    sync();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => sync());
    observer.observe(node);
    Array.from(node.children).forEach(child => observer.observe(child));
    const mutations = new MutationObserver(() => { observer.disconnect(); observer.observe(node); Array.from(node.children).forEach(child => observer.observe(child)); sync(); });
    mutations.observe(node, { childList: true });
    return () => { observer.disconnect(); mutations.disconnect(); };
  }, [sync]);

  useEffect(() => {
    const node = viewport.current;
    if (!node) return;
    node.addEventListener("scrollend", cancelTrackTarget);
    node.addEventListener("wheel", cancelTrackTarget, { passive: true });
    node.addEventListener("pointerdown", cancelTrackTarget);
    node.addEventListener("keydown", cancelTrackTarget);
    return () => {
      node.removeEventListener("scrollend", cancelTrackTarget);
      node.removeEventListener("wheel", cancelTrackTarget);
      node.removeEventListener("pointerdown", cancelTrackTarget);
      node.removeEventListener("keydown", cancelTrackTarget);
    };
  }, [cancelTrackTarget]);

  useEffect(() => () => window.clearTimeout(hideTimer.current), []);

  const wake = () => {
    const root = rootRef.current;
    if (!root) return;
    root.setAttribute("data-scrolling", "");
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => root.removeAttribute("data-scrolling"), hideDelay);
  };

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    sync();
    wake();
    onScroll?.(event);
  };

  // A mouse wheel over a horizontal strip moves it sideways, but only while there is room, so the page still scrolls at the ends.
  useEffect(() => {
    const node = viewport.current;
    if (!node || orientation !== "horizontal" || !wheelToHorizontal) return;
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
      const max = node.scrollWidth - node.clientWidth, at = Math.abs(node.scrollLeft);
      if (max <= 0 || (event.deltaY < 0 && at <= 0) || (event.deltaY > 0 && at >= max - motionTokens.keyframes.scrollArea.edgeTolerancePx)) return;
      event.preventDefault();
      node.scrollLeft += event.deltaY * (getComputedStyle(node).direction === "rtl" ? -1 : 1);
    };
    node.addEventListener("wheel", wheel, { passive: false });
    return () => node.removeEventListener("wheel", wheel);
  }, [orientation, wheelToHorizontal]);

  /* Dragging a thumb maps pointer travel to scroll distance; pressing the track pages toward the pointer. */
  const drag = useRef<{ axis: Axis; start: number; scroll: number; ratio: number } | null>(null);
  const onThumbDown = (event: ReactPointerEvent<HTMLDivElement>, axis: Axis) => {
    const node = viewport.current, track = tracks.current[axis], thumb = thumbs.current[axis];
    if (!node || !track || !thumb || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    cancelTrackTarget();
    event.currentTarget.setPointerCapture(event.pointerId);
    const length = axis === "y" ? track.clientHeight : track.clientWidth, size = axis === "y" ? thumb.offsetHeight : thumb.offsetWidth;
    const max = axis === "y" ? node.scrollHeight - node.clientHeight : node.scrollWidth - node.clientWidth;
    drag.current = { axis, start: axis === "y" ? event.clientY : event.clientX, scroll: axis === "y" ? node.scrollTop : node.scrollLeft, ratio: max / Math.max(1, length - size) };
    rootRef.current?.setAttribute("data-dragging", axis);
    node.style.scrollSnapType = "none";
  };
  const onThumbMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = drag.current, node = viewport.current;
    if (!state || !node) return;
    const delta = ((state.axis === "y" ? event.clientY : event.clientX) - state.start) * state.ratio;
    if (state.axis === "y") node.scrollTop = state.scroll + delta; else node.scrollLeft = state.scroll + delta;
  };
  const onThumbUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    rootRef.current?.removeAttribute("data-dragging");
    if (viewport.current) viewport.current.style.scrollSnapType = "";
    wake();
  };
  const onTrackDown = (event: ReactPointerEvent<HTMLDivElement>, axis: Axis) => {
    const node = viewport.current, thumb = thumbs.current[axis];
    if (!node || !thumb || event.button !== 0 || event.target !== event.currentTarget) return;
    event.preventDefault();
    const rect = thumb.getBoundingClientRect();
    const before = axis === "y" ? event.clientY < rect.top : event.clientX < rect.left;
    const page = (axis === "y" ? node.clientHeight : node.clientWidth) * scrollAreaGeometry.trackPageRatio * (before ? -1 : 1);
    const vertical = axis === "y";
    const start = vertical ? node.scrollTop : node.scrollLeft;
    const extent = vertical ? node.scrollHeight - node.clientHeight : node.scrollWidth - node.clientWidth;
    const rtl = !vertical && getComputedStyle(node).direction === "rtl";
    const offset = Math.max(rtl ? -extent : 0, Math.min(rtl ? 0 : extent, start + page));
    if (offset === start) return;
    trackTarget.current = reduced ? null : { axis, offset };
    node.scrollTo({ [vertical ? "top" : "left"]: offset, behavior: reduced ? "instant" : "smooth" });
  };

  const bar = (axis: Axis) => <div ref={node => { tracks.current[axis] = node; }} className={styles.track} data-axis={axis} data-hidden="" aria-hidden="true"
    onPointerDown={event => onTrackDown(event, axis)}>
    <div ref={node => { thumbs.current[axis] = node; }} className={styles.thumb}
      onPointerDown={event => onThumbDown(event, axis)} onPointerMove={onThumbMove} onPointerUp={onThumbUp} onPointerCancel={onThumbUp} />
  </div>;

  return <div ref={rootRef} className={[styles.root, className].filter(Boolean).join(" ")} data-orientation={orientation} data-scrollbars={scrollbars} {...rest}>
    <div ref={viewport} className={[styles.viewport, viewportClassName].filter(Boolean).join(" ")} data-fade={fade > 0 ? orientation : undefined}
      style={{ maxHeight, scrollSnapType: snap, ...viewportStyle }} tabIndex={0} role={label ? "region" : undefined} aria-label={label} onScroll={handleScroll}>
      {children}
    </div>
    {vertical && bar("y")}
    {horizontal && bar("x")}
  </div>;
});

export default ScrollArea;
