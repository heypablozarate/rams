"use client";
import "./motion-fields.css";

import { useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Accordion as RamsAccordion, AccordionContent as RamsAccordionContent, AccordionItem as RamsAccordionItem, AccordionTrigger as RamsAccordionTrigger } from "./accordion";
import { motion, useAnimationControls } from "motion/react";
import { useReducedMotion } from "./use-motion-preference";
import type { TargetAndTransition, Variants } from "motion/react";
import { motionTokens } from "./motion-tokens";
import styles from "./motion-accordion.module.css";

export interface AccordionItem { title: string; content: ReactNode; }
export interface AccordionProps {
  items: AccordionItem[];
  defaultOpen?: number;
  /** "lg" suits page-level FAQs: questions at the large text size, answers at body size. */
  size?: "default" | "lg";
}

/** Height follows the content on a spring that never overshoots; closed panels leave the accessibility tree once they finish collapsing. */
const panelOpen: TargetAndTransition = { height: "auto", opacity: 1, visibility: "visible" };
const panelClosed: TargetAndTransition = { height: 0, opacity: 0, transitionEnd: { visibility: "hidden" } };
/** The answer settles down into place with a brief focus pull as the panel opens. */
const contentOpen: TargetAndTransition = { y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } };
const contentClosed: TargetAndTransition = { y: motionTokens.keyframes.accordion.answerEnterOffsetPx, filter: `blur(${motionTokens.blur.subtle}px)` };
const panelMotion: Variants = {
  open: { ...panelOpen, transition: { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] } } },
  closed: { ...panelClosed, transition: { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } } },
};
const contentMotion: Variants = {
  open: { ...contentOpen, transition: { y: motionTokens.spring.smooth, filter: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] } } },
  closed: { ...contentClosed, transition: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } },
};
/** Each panel owns its animations and applies a live reduced target in the same layout effect. */
function AccordionPanel({ open, reduced, children }: { open: boolean; reduced: boolean; children: ReactNode }) {
  const panel = useAnimationControls();
  const content = useAnimationControls();
  const mounted = useRef(false);
  const closed = { height: 0, opacity: 0, visibility: "hidden" as const };
  const initialPanel = open ? panelOpen : closed;
  const initialContent = open ? contentOpen : contentClosed;

  useLayoutEffect(() => {
    panel.stop();
    content.stop();
    if (reduced || !mounted.current) {
      panel.set(open ? panelOpen : closed);
      content.set(reduced ? { y: 0, filter: "none" } : open ? contentOpen : contentClosed);
    } else {
      void panel.start(open ? "open" : "closed");
      void content.start(open ? "open" : "closed");
    }
    mounted.current = true;
    return () => {
      panel.stop();
      content.stop();
    };
  }, [open, reduced, panel, content]);

  return <RamsAccordionContent forceMount asChild>
    <motion.div data-slot="accordion-content" inert={!open} aria-hidden={!open} className={styles.panel} initial={initialPanel} animate={panel} variants={panelMotion}>
      <motion.div className={styles.panelInner} initial={initialContent} animate={content} variants={contentMotion}>{children}</motion.div>
    </motion.div>
  </RamsAccordionContent>;
}

export function Accordion({ items, defaultOpen = 0, size = "default" }: AccordionProps) {
  const initialValue = defaultOpen >= 0 && defaultOpen < items.length ? String(defaultOpen) : "";
  const [openValue, setOpenValue] = useState(initialValue);
  const reduced = useReducedMotion();
  return <RamsAccordion className={[styles.accordion, size === "lg" ? styles.lg : ""].filter(Boolean).join(" ")} type="single" collapsible value={openValue} onValueChange={setOpenValue}>
    {items.map((item, index) => { const open = openValue === String(index); return <RamsAccordionItem value={String(index)} key={`${item.title}-${index}`}>
      <RamsAccordionTrigger><span>{item.title}</span></RamsAccordionTrigger>
      {/* Radix owns semantics and ids; the panel owns and cancels its animation controls. */}
      <AccordionPanel open={open} reduced={reduced}>{item.content}</AccordionPanel>
    </RamsAccordionItem>; })}
  </RamsAccordion>;
}

export default Accordion;
