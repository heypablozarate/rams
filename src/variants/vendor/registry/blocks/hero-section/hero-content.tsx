"use client";

import { heroRuntime } from "./hero-runtime";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { MotionConfig, motion, visualElementStore } from "motion/react";
import { ArrowRight, ArrowUpRight, Check } from "rams-icons";
import { Button } from "@/variants/vendor/registry/components/button/button";
import { Button as LinkButton } from "@/primitives/button";
import { CopyButton } from "@/variants/vendor/registry/components/copy-button/copy-button";
import { heroGroup, heroRise, heroFade, useHeroReducedMotion } from "./hero-motion";
import { motionTokens } from "@/variants/vendor/lib/motion-tokens";
import shell from "./hero-section.module.css";
import styles from "./hero-content.module.css";

export interface HeroAction {
  label: string;
  href?: string;
  onClick?: () => void;
  /** Opens in a new tab and shows an outward arrow. */
  external?: boolean;
  /** Shown in place of the label for a moment after a press, such as "Trial started". Buttons only. */
  doneLabel?: string;
}

export interface HeroInstallCommand {
  /** Short label, such as npm or pnpm. The first command is shown. */
  label: string;
  command: string;
}

export interface HeroContentProps {
  layout: "centered" | "split" | "minimal";
  announcement?: HeroAction | null;
  title: string;
  description?: string;
  primaryAction?: HeroAction | null;
  secondaryAction?: HeroAction | null;
  install?: HeroInstallCommand[] | null;
  media?: ReactNode;
  meta?: string[];
  animateIn?: boolean;
  className?: string;
}

/** A link or button that looks like an RAMS button. Links keep native navigation; a button with `doneLabel` confirms in place. */
export function ActionLink({ action, kind, className }: { action: HeroAction; kind: "primary" | "secondary"; className?: string }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!done) return;
    const timer = window.setTimeout(() => setDone(false), heroRuntime.actionFeedbackMs);
    return () => window.clearTimeout(timer);
  }, [done]);
  const icon = action.external ? <ArrowUpRight size={heroRuntime.actionIconPx} strokeWidth={heroRuntime.iconStroke} aria-hidden="true" /> : kind === "primary" ? <ArrowRight className={styles.arrow} size={heroRuntime.actionIconPx} strokeWidth={heroRuntime.iconStroke} aria-hidden="true" /> : null;
  if (action.href) return <LinkButton asChild variant={kind === "primary" ? "default" : "outline"} size="lg" className={[styles.link, className].filter(Boolean).join(" ")}><a href={action.href} onClick={action.onClick} {...(action.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}><span className={styles.linkLabel}>{action.label}</span>{icon}</a></LinkButton>;
  return <Button variant={kind === "primary" ? "default" : "outline"} size="lg" className={[styles.button, className].filter(Boolean).join(" ")} onClick={() => { action.onClick?.(); if (action.doneLabel) setDone(true); }}>
    {done ? <><Check size={heroRuntime.actionIconPx} strokeWidth={heroRuntime.iconStroke} aria-hidden="true" />{action.doneLabel}</> : <>{action.label}{icon}</>}
  </Button>;
}

/**
 * The hero with your own content: announcement, headline, description, actions, an optional install line, and an
 * optional visual beside the copy. Use it when none of the three designed variants fits the product.
 */
export function HeroContent({ layout, announcement, title, description, primaryAction, secondaryAction, install, media, meta, animateIn = true, className }: HeroContentProps) {
  const reduced = useHeroReducedMotion();
  const copy = useRef<HTMLDivElement>(null);
  const visual = useRef<HTMLDivElement>(null);
  const [entranceSettled, setEntranceSettled] = useState(false);
  const settle = reduced || entranceSettled;
  useLayoutEffect(() => {
    if (!reduced) return;
    setEntranceSettled(true);
    const nodes = [...(copy.current?.children ?? []), ...(visual.current ? [visual.current] : [])];
    for (const node of nodes) {
      const element = visualElementStore.get(node);
      element?.getValue("opacity")?.jump(1);
      element?.getValue("y")?.jump(0);
      element?.getValue("filter")?.jump("none");
      element?.render();
    }
  }, [reduced]);
  const item = settle ? heroFade : heroRise;
  const command = install?.[0];
  const copyItemCount = 1 + [announcement, description, primaryAction || secondaryAction, command, meta?.length].filter(Boolean).length;
  // Reduced motion reaches the final content state immediately.
  return <MotionConfig reducedMotion="user"><section data-hero-entrance-settled={settle || undefined} className={["rams-hero-section", shell.hero, styles.hero, styles[layout], className].filter(Boolean).join(" ")}>
    <div className={styles.inner}>
      <motion.div ref={copy} className={styles.copy} variants={heroGroup(copyItemCount, settle)} initial={settle ? false : animateIn ? "hidden" : false} animate="shown" transition={settle ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : undefined}>
        {announcement && <motion.div variants={item} transition={settle ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : undefined}>
          {announcement.href
            ? <a className={styles.announcement} href={announcement.href} onClick={announcement.onClick}>{announcement.label}<ArrowRight className={styles.arrow} size={heroRuntime.announcementIconPx} strokeWidth={heroRuntime.iconStroke} aria-hidden="true" /></a>
            : <button type="button" className={styles.announcement} onClick={announcement.onClick}>{announcement.label}<ArrowRight className={styles.arrow} size={heroRuntime.announcementIconPx} strokeWidth={heroRuntime.iconStroke} aria-hidden="true" /></button>}
        </motion.div>}
        <motion.h1 variants={item} className={[shell.title, styles.title].join(" ")} transition={settle ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : undefined}>{title}</motion.h1>
        {description && <motion.p variants={item} className={[shell.description, styles.description].join(" ")} transition={settle ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : undefined}>{description}</motion.p>}
        {(primaryAction || secondaryAction) && <motion.div variants={item} className={styles.actions} transition={settle ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : undefined}>
          {primaryAction && <ActionLink action={primaryAction} kind="primary" />}
          {secondaryAction && <ActionLink action={secondaryAction} kind="secondary" />}
        </motion.div>}
        {command && <motion.div variants={item} className={styles.install} transition={settle ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : undefined}>
          <span className={styles.prompt} aria-hidden="true">$</span>
          <code className={styles.command}>{command.command}</code>
          <CopyButton value={command.command} label="Copy install command" iconOnly variant="ghost" />
        </motion.div>}
        {meta && meta.length > 0 && <motion.ul variants={item} className={styles.meta} transition={settle ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : undefined}>{meta.map(entry => <li key={entry}>{entry}</li>)}</motion.ul>}
      </motion.div>
      {media && <motion.div ref={visual} className={styles.media} variants={item} initial={settle ? false : animateIn ? "hidden" : false} animate="shown" transition={settle ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : undefined}>{media}</motion.div>}
    </div>
  </section></MotionConfig>;
}

export default HeroContent;
