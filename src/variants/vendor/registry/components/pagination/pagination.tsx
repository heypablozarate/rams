"use client";
import { ButtonBase as OwnButton } from "@/primitives/button";
import { MotionPresenceButton as MotionOwnButton } from "@/variants/presence-controls";
import { forwardRef, useImperativeHandle, useLayoutEffect, useRef, useState, type ComponentPropsWithoutRef } from "react";
import { ChevronLeft as NavArrowLeft, ChevronRight as NavArrowRight } from "rams-icons";
import { AnimatePresence, animate, motion, useMotionValue, visualElementStore, type Variants } from "motion/react";
import { motionTransition } from "@/variants/motion-policy";
import { useReducedMotion } from "@/variants/use-motion-preference";
import { motionTokens } from "@/variants/vendor/lib/motion-tokens";
import styles from "./pagination.module.css";
export interface PaginationProps { page: number; pageCount: number; onPageChange: (page: number) => void; label?: string }
/** A one-row page window moves by the measured distance between its page buttons. */
const slide: Variants = {
  enter: (travel: number) => ({ opacity: 0, x: travel }),
  center: { opacity: 1, x: 0 },
  exit: (travel: number) => ({ opacity: 0, x: -travel, transition: { x: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.instant, ease: [...motionTokens.ease.standard] } } }),
};
const PageButton = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<typeof MotionOwnButton>>(function PageButton(props, ref) {
  const node = useRef<HTMLButtonElement>(null);
  useImperativeHandle(ref, () => node.current!, []);
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    if (!reduced || !node.current) return;
    const visual = visualElementStore.get(node.current);
    visual?.projection?.finishAnimation();
    for (const key of ["opacity", "x"]) {
      const animation = visual?.getValue(key)?.animation;
      if (animation && "complete" in animation && typeof animation.complete === "function") animation.complete();
    }
  }, [reduced]);
  return <MotionOwnButton {...props} ref={node} />;
});
export function Pagination({ page, pageCount, onPageChange, label = "Pagination" }: PaginationProps) {
  const reduced = useReducedMotion() ?? false;
  const navRef = useRef<HTMLElement>(null);
  const pagesRef = useRef<HTMLDivElement>(null);
  const slotDistance = useRef(0);
  const markX = useMotionValue(0);
  const markY = useMotionValue(0);
  const safePageCount = Math.max(0, Math.floor(pageCount));
  const currentPage = safePageCount > 0 ? Math.min(Math.max(1, Math.floor(page)), safePageCount) : 0;
  const windowSize = motionTokens.keyframes.pagination.visiblePageLimit;
  const start = safePageCount > 0 ? Math.max(1, Math.min(safePageCount - windowSize + 1, currentPage - Math.floor(windowSize / 2))) : 1;
  const [previousStart, setPreviousStart] = useState(start);
  const [travel, setTravel] = useState(0);
  if (previousStart !== start) {
    setTravel(slotDistance.current * (start - previousStart));
    setPreviousStart(start);
  }
  const visible = Array.from({ length: Math.min(safePageCount, windowSize) }, (_, index) => start + index);

  // One mark travels to the current page's final slot. Until it has measured once (and during server render),
  // the current button draws its own border so nothing flashes before hydration.
  useLayoutEffect(() => {
    const nav = navRef.current;
    const pages = pagesRef.current;
    // AnimatePresence keeps outgoing buttons mounted until their exit settles.
    const current = pages?.querySelector<HTMLButtonElement>(":scope > button[aria-current='page']:not([inert])");
    if (!nav || !pages || !current) return;
    const measureSlot = () => {
      const buttons = [...pages.querySelectorAll<HTMLButtonElement>(":scope > button:not([inert])")];
      const [first, second] = buttons;
      slotDistance.current = first && second && buttons.every(button => button.offsetTop === first.offsetTop)
        ? second.offsetLeft - first.offsetLeft
        : 0;
    };
    const place = (instant: boolean) => {
      const x = current.offsetLeft, y = current.offsetTop;
      if (instant || reduced) { markX.jump(x); markY.jump(y); return; }
      const transition = motionTransition("selection");
      animate(markX, x, transition);
      animate(markY, y, transition);
    };
    place(!("markReady" in nav.dataset));
    measureSlot();
    nav.dataset.markReady = "";
    const geometry = () => `${nav.offsetWidth}x${nav.offsetHeight}:${current.offsetLeft},${current.offsetTop}`;
    let size = geometry();
    const observer = new ResizeObserver(() => {
      measureSlot();
      const next = geometry();
      if (next !== size) { size = next; place(true); }
    });
    observer.observe(nav);
    observer.observe(pages);
    observer.observe(current);
    return () => { observer.disconnect(); markX.stop(); markY.stop(); };
  }, [currentPage, start, safePageCount, reduced, markX, markY]);

  if (!safePageCount) return <nav className={styles.nav} aria-label={label} />;
  return <div className={styles.container}><nav ref={navRef} className={styles.nav} aria-label={label}><OwnButton variant="ghost" type="button" className={styles.step} onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1} aria-label="Previous page"><NavArrowLeft aria-hidden="true" /></OwnButton>
    <motion.span aria-hidden="true" className={styles.mark} style={{ x: markX, y: markY }} />
    <div ref={pagesRef} className={styles.pages}><AnimatePresence mode="popLayout" initial={false} custom={travel}>
      {visible.map(number => <PageButton variant="ghost" type="button" key={number} onClick={() => onPageChange(number)} aria-label={`Page ${number}`} aria-current={currentPage === number ? "page" : undefined}
        layout={reduced ? false : "position"} layoutDependency={start} custom={travel} variants={slide}
        initial={reduced ? false : "enter"} animate="center" exit={reduced ? undefined : "exit"}
        transition={reduced ? { duration: motionTokens.reduced.duration } : { x: motionTokens.spring.smooth, layout: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] } }}>{number}</PageButton>)}
    </AnimatePresence></div>
    <OwnButton variant="ghost" type="button" className={styles.step} onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= safePageCount} aria-label="Next page"><NavArrowRight aria-hidden="true" /></OwnButton></nav></div>;
}
