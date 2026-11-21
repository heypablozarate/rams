"use client";

import { Tabs as RamsTabs, TabsContent as RamsTabsContent, TabsList as RamsTabsList, TabsTrigger as RamsTabsTrigger, type TabsContentProps, type TabsListProps, type TabsProps, type TabsTriggerProps } from "@/primitives/tabs";
import { createContext, forwardRef, useCallback, useContext, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { useComposedRefs } from "@radix-ui/react-compose-refs";
import { ChevronLeft as NavArrowLeft, ChevronRight as NavArrowRight } from "rams-icons";
import { AnimatePresence, LayoutGroup, animate, motion, useAnimationControls, usePresence } from "motion/react";
import { motionTransition } from "@/variants/motion-policy";
import { useReducedMotion } from "@/variants/use-motion-preference";
import type { AnimationPlaybackControls } from "motion/react";
import { motionTokens } from "@/variants/vendor/lib/motion-tokens";
import styles from "./tabs.module.css";

type RootProps = TabsProps;
const panelMotion = motionTokens.keyframes.tabs;
/** `direction` is +1 when the new tab sits after the old one; `panelHeightRef` holds the visible panel height so the next panel can morph from it; `leavingRectRef` pins the outgoing panel where it was on screen. */
const TabsContext = createContext<{ active: string; layoutId: string; direction: number; panelHeightRef: RefObject<number | null>; leavingRectRef: RefObject<DOMRect | null>; mountedRef: RefObject<boolean> }>({ active: "", layoutId: "tabs", direction: 1, panelHeightRef: { current: null }, leavingRectRef: { current: null }, mountedRef: { current: false } });

export function Tabs({ value, defaultValue, onValueChange, className, ...props }: RootProps) {
  const [internal, setInternal] = useState(defaultValue ?? "");
  const [direction, setDirection] = useState(1);
  const active = value ?? internal;
  const layoutId = useId();
  const root = useRef<HTMLDivElement>(null);
  const panelHeightRef = useRef<number | null>(null);
  const leavingRectRef = useRef<DOMRect | null>(null);
  const mountedRef = useRef(false);
  useLayoutEffect(() => { mountedRef.current = true; }, []);
  function handleChange(next: string) {
    const frame = root.current;
    leavingRectRef.current = frame?.querySelector(':scope > [role="tabpanel"][data-state="active"]')?.getBoundingClientRect() ?? null;
    const order = frame ? Array.from(frame.querySelectorAll<HTMLElement>('[role="tab"][data-value]')).filter(tab => tab.closest(`.${styles.root}`) === frame).map(tab => tab.dataset.value) : [];
    const from = order.indexOf(active), to = order.indexOf(next);
    if (from >= 0 && to >= 0 && from !== to) setDirection(to > from ? 1 : -1);
    if (value === undefined) setInternal(next); onValueChange?.(next);
  }
  return <TabsContext.Provider value={{ active, layoutId, direction, panelHeightRef, leavingRectRef, mountedRef }}><LayoutGroup id={layoutId}><RamsTabs {...props} data-rams-motion-tabs="" ref={root} className={[styles.root, className].filter(Boolean).join(" ")} value={active} onValueChange={handleChange}/></LayoutGroup></TabsContext.Provider>;
}

// scrollLeft starts at zero on the right in RTL and becomes negative moving
// left. The masks, arrows and tab bounds all use physical left and right.
function scrollEdges(scroll: HTMLDivElement) {
  const max = Math.max(0, scroll.scrollWidth - scroll.clientWidth);
  const offset = scroll.scrollLeft + (getComputedStyle(scroll).direction === "rtl" ? max : 0);
  return { left: offset > panelMotion.scrollEdgeTolerancePx, right: offset < max - panelMotion.scrollEdgeTolerancePx };
}

export function TabsList({ className, ...props }: TabsListProps) {
  const { active } = useContext(TabsContext);
  const reduced = useReducedMotion();
  const shell = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const corridorInset = useRef<HTMLSpanElement>(null);
  const scrollLeft = useRef<HTMLButtonElement>(null);
  const scrollRight = useRef<HTMLButtonElement>(null);
  const [edges, setEdges] = useState({ overflow: false, left: false, right: false });
  const update = useCallback(() => {
    const frame = shell.current;
    const scroll = viewport.current;
    if (!frame || !scroll) return;
    const next = { overflow: scroll.scrollWidth > frame.clientWidth + panelMotion.scrollEdgeTolerancePx, ...scrollEdges(scroll) };
    setEdges(previous => previous.overflow === next.overflow && previous.left === next.left && previous.right === next.right ? previous : next);
  }, []);
  const reveal = useCallback((tab: HTMLElement | null) => {
    const scroll = viewport.current;
    if (!scroll || !tab) return;
    const frame = scroll.getBoundingClientRect();
    const item = tab.getBoundingClientRect();
    const edges = scrollEdges(scroll);
    // One border of clearance beyond the affordance keeps the focused label legible.
    const fringe = parseFloat(getComputedStyle(scroll).getPropertyValue("--rams-detail-primitive-border-width")) || 0;
    const left = frame.left + (edges.left && scrollLeft.current ? scrollLeft.current.offsetWidth + fringe : 0);
    const right = frame.right - (edges.right && scrollRight.current ? scrollRight.current.offsetWidth + fringe : 0);
    const delta = item.left < left ? item.left - left : item.right > right ? item.right - right : 0;
    if (delta) scroll.scrollBy({ left: delta, behavior: reduced ? "instant" : "smooth" });
  }, [reduced]);
  useLayoutEffect(() => {
    const frame = shell.current;
    const scroll = viewport.current;
    const content = list.current;
    if (!frame || !scroll || !content) return;
    const measure = () => {
      if (content.dataset.orientation === "horizontal") {
        // Measure the natural row so wrapping cannot toggle its own condition.
        const offset = scroll.scrollLeft;
        frame.removeAttribute("data-wrap");
        const inlineSize = frame.clientWidth;
        const inset = corridorInset.current?.offsetWidth ?? 0;
        const tabs = Array.from(content.querySelectorAll<HTMLElement>(':scope > [role="tab"]'));
        const limit = Math.max(0, inlineSize - (tabs.length > 1 ? 2 * inset : 0));
        if (scroll.scrollWidth > inlineSize + panelMotion.scrollEdgeTolerancePx && tabs.some(tab => tab.offsetWidth > limit)) {
          frame.style.setProperty("--rams-detail-tabs-readable-inline-size", `${limit}px`);
          frame.setAttribute("data-wrap", "");
        }
        if (offset !== scroll.scrollLeft) scroll.scrollLeft = offset;
      }
      update();
      const focused = document.activeElement;
      if (focused instanceof HTMLElement && focused.parentElement === content && focused.getAttribute("role") === "tab") reveal(focused);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    observer.observe(scroll);
    observer.observe(content);
    if (corridorInset.current) observer.observe(corridorInset.current);
    scroll.addEventListener("scroll", update, { passive: true });
    measure();
    return () => { observer.disconnect(); scroll.removeEventListener("scroll", update); };
  }, [reveal, update]);
  useLayoutEffect(() => { reveal(list.current?.querySelector<HTMLElement>('[role="tab"][data-state="active"]') ?? null); }, [active, reveal]);
  const scrollTabs = (direction: number) => viewport.current?.scrollBy({ left: direction * (viewport.current?.clientWidth ?? 0) * panelMotion.pageScrollShare, behavior: reduced ? "instant" : "smooth" });
  return <div ref={shell} className={styles.listShell} data-overflow={edges.overflow} data-left={edges.left} data-right={edges.right}>
    <span className={styles.corridorProbe} aria-hidden="true"><span ref={corridorInset} className={styles.corridorInset}/></span>
    {edges.overflow && <button ref={scrollLeft} type="button" className={`${styles.scrollButton} ${styles.scrollLeft}`} aria-label="Scroll tabs left" disabled={!edges.left} onClick={() => scrollTabs(-1)}><NavArrowLeft aria-hidden="true"/></button>}
    <motion.div ref={viewport} layoutScroll className={styles.viewport} onFocusCapture={event => { if (event.target instanceof HTMLElement && event.target.getAttribute("role") === "tab") reveal(event.target); }}>
      <RamsTabsList {...props} ref={list} className={[styles.list, className].filter(Boolean).join(" ")}/>
    </motion.div>
    {edges.overflow && <button ref={scrollRight} type="button" className={`${styles.scrollButton} ${styles.scrollRight}`} aria-label="Scroll tabs right" disabled={!edges.right} onClick={() => scrollTabs(1)}><NavArrowRight aria-hidden="true"/></button>}
  </div>;
}

export function TabsTrigger({ className, children, value, style, ...props }: TabsTriggerProps) {
  const { active } = useContext(TabsContext);
  const reduced = useReducedMotion();
  // The LayoutGroup in Tabs scopes the highlight to this instance, so it glides between triggers but never flies in from another tab set.
  return <RamsTabsTrigger {...props} style={{ backgroundColor: "transparent", ...style }} value={value} data-value={value} className={[styles.trigger, className].filter(Boolean).join(" ")}>
    {active === value && (reduced
      ? <span className={styles.selection} aria-hidden="true"/>
      : <motion.span className={styles.selection} layoutId="selection" layoutDependency={active} transition={motionTransition("selection")} aria-hidden="true"/>)}
    <span className={styles.triggerLabel}>{children}</span>
  </RamsTabsTrigger>;
}

type ContentProps = TabsContentProps;

// This node owns opacity/translation for its entire presence lifecycle. Changing
// the system preference stops the existing playback, not just future transitions.
const AnimatedTabsPanel = forwardRef<HTMLDivElement, ContentProps>(function AnimatedTabsPanel({ className, value, children, ...props }, forwardedRef) {
  const { active, direction, panelHeightRef, leavingRectRef, mountedRef } = useContext(TabsContext);
  const reduced = useReducedMotion();
  const [present, safeToRemove] = usePresence();
  const controls = useAnimationControls();
  const panel = useRef<HTMLDivElement>(null);
  const selected = present && active === value;
  const setPanelRef = useComposedRefs(panel, forwardedRef);

  useLayoutEffect(() => {
    const node = panel.current;
    if (!node) return;
    let current = true;
    controls.stop();
    node.inert = !selected;
    if (reduced || !mountedRef.current) {
      controls.set({ opacity: selected ? 1 : 0, x: 0 });
    } else {
      void controls.start(selected
        ? { opacity: 1, x: 0, transition: { opacity: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] }, x: motionTokens.spring.smooth } }
        : { opacity: 0, x: direction * panelMotion.panelExitOffsetPx, transition: { duration: motionTokens.duration.instant, ease: [...motionTokens.ease.standard] } }
      ).then(() => { if (current && !present) safeToRemove?.(); });
    }
    return () => { current = false; controls.stop(); };
  }, [selected, present, reduced, direction, controls, safeToRemove, mountedRef]);

  // Presence records its leaving key in the parent layout pass. Finish an
  // immediate exit after that registration, using the same lifecycle owner.
  useEffect(() => { if (reduced && !present) safeToRemove?.(); }, [reduced, present, safeToRemove]);

  useLayoutEffect(() => {
    const node = panel.current;
    if (!node) return;
    if (!selected) {
      const before = leavingRectRef.current;
      const now = node.getBoundingClientRect();
      if (before) node.style.translate = `${before.left - now.left}px ${before.top - now.top}px`;
      return;
    }
    node.style.translate = "";
    const from = panelHeightRef.current;
    const to = node.offsetHeight;
    let heightControls: AnimationPlaybackControls | undefined;
    const release = () => { node.style.height = ""; node.style.overflow = ""; };
    if (from !== null && Math.abs(from - to) > 1 && !reduced) {
      if (to > from) node.style.overflow = "clip";
      heightControls = animate(node, { height: [from, to] }, { ...motionTokens.spring.smooth, onComplete: release });
    }
    panelHeightRef.current = heightControls && from !== null ? from : to;
    const observer = new ResizeObserver(() => { panelHeightRef.current = node.offsetHeight; });
    observer.observe(node);
    return () => { observer.disconnect(); heightControls?.stop(); release(); };
  }, [selected, reduced, panelHeightRef, leavingRectRef]);

  return <RamsTabsContent {...props} value={value} forceMount asChild>
    <motion.div ref={setPanelRef} className={[styles.content, className].filter(Boolean).join(" ")} inert={!selected} aria-hidden={!selected || undefined}
      initial={reduced || !mountedRef.current ? false : { opacity: 0, x: direction * panelMotion.panelEnterOffsetPx }} animate={controls}>{children}</motion.div>
  </RamsTabsContent>;
});

export function TabsContent({ className, value, forceMount, children, ...props }: ContentProps) {
  const { active } = useContext(TabsContext);
  if (forceMount) return <RamsTabsContent {...props} value={value} forceMount className={[styles.content, className].filter(Boolean).join(" ")}>{children}</RamsTabsContent>;
  return <AnimatePresence initial={false} mode="popLayout">
    {active === value && <AnimatedTabsPanel {...props} key={value} value={value} className={className}>{children}</AnimatedTabsPanel>}
  </AnimatePresence>;
}
