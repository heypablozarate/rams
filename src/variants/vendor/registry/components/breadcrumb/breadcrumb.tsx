"use client";
import { ButtonBase as OwnButton } from "@/primitives/button";
import { forwardRef, useImperativeHandle, useLayoutEffect, useRef, type MouseEvent } from "react";
import { ChevronRight as NavArrowRight } from "rams-icons";
import { AnimatePresence, motion, useIsPresent, visualElementStore } from "motion/react";
import { useReducedMotion } from "@/variants/use-motion-preference";
import { BreadcrumbLink as OwnBreadcrumbLink } from "@/primitives/breadcrumb";
import { motionTokens } from "@/variants/vendor/lib/motion-tokens";
import { RamsText } from "@/brand/RamsName";
import styles from "./breadcrumb.module.css";
export interface BreadcrumbItem {
  label: string;
  href?: string;
  /** Runs when the crumb is chosen. Without an href the crumb renders as a button, for paths that live in local state. */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
}
export interface BreadcrumbProps { items: BreadcrumbItem[]; ariaLabel?: string }
type CrumbProps = { item: BreadcrumbItem; index: number; current: boolean; path: string };
const crumbMotion = motionTokens.keyframes.breadcrumb;
const Crumb = forwardRef<HTMLLIElement, CrumbProps>(function Crumb({ item, index, current, path }, ref) {
  const present = useIsPresent();
  const reduced = useReducedMotion() ?? false;
  const node = useRef<HTMLLIElement>(null);
  useImperativeHandle(ref, () => node.current!, []);
  // A retained crumb still receives the live preference while AnimatePresence holds its old props.
  useLayoutEffect(() => {
    if (!reduced || !node.current) return;
    const visual = visualElementStore.get(node.current);
    visual?.projection?.finishAnimation();
    for (const key of ["opacity", "x", "filter"]) {
      const animation = visual?.getValue(key)?.animation;
      if (animation && "complete" in animation && typeof animation.complete === "function") animation.complete();
    }
  }, [reduced]);
  return <motion.li
    ref={node}
    aria-hidden={present ? undefined : true}
    inert={!present}
    layout={reduced ? false : "position"} layoutDependency={path}
    initial={reduced ? false : { opacity: 0, x: crumbMotion.crumbEnterOffsetPx, filter: `blur(${motionTokens.blur.subtle}px)` }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
    exit={reduced ? { opacity: 0, transition: ({ duration: motionTokens.reduced.duration }) } : { opacity: 0, x: crumbMotion.crumbExitOffsetPx, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.instant, ease: [...motionTokens.ease.standard] } }}
    transition={reduced ? ({ duration: motionTokens.reduced.duration }) : { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter], layout: motionTokens.spring.smooth }}>
    {index > 0 && <NavArrowRight aria-hidden="true"/>}
    {!current && item.href ? <OwnBreadcrumbLink href={item.href} data-label={item.label} onClick={item.onClick}><span><RamsText>{item.label}</RamsText></span></OwnBreadcrumbLink>
      : !current && item.onClick ? <OwnButton variant="ghost" type="button" data-label={item.label} onClick={item.onClick}><span><RamsText>{item.label}</RamsText></span></OwnButton>
      : <span aria-current={current && present ? "page" : undefined} data-label={item.label}><span><RamsText>{item.label}</RamsText></span></span>}
  </motion.li>;
});
/** Crumbs present on first render stay still; crumbs added later slide in from the path before them. */
export function Breadcrumb({ items, ariaLabel = "Breadcrumb" }: BreadcrumbProps) {
  const path = items.map(item => item.label).join("/");
  return <nav aria-label={ariaLabel}><ol className={styles.list}><AnimatePresence mode="popLayout" initial={false}>{items.map((item, index) =>
    <Crumb key={`${item.label}-${index}`} item={item} index={index} current={index === items.length - 1} path={path} />
  )}</AnimatePresence></ol></nav>;
}
