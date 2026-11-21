"use client";

import { contentPresentation } from "@/primitives/content-presentation";
import { forwardRef, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, animate, motion, useAnimationControls, useInView, useMotionValue } from "motion/react";
import { useReducedMotion } from "@/variants/use-motion-preference";
import { MotionRegion } from "@/variants/motion-swap";
import { ArrowRight, Check, X } from "rams-icons";
import { Button as NativeButton } from "@/primitives/button";
import { Button } from "@/variants/vendor/registry/components/button/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/primitives/select";
import { floatingPlacement } from "@/primitives/floating-placement";
import { motionTokens } from "@/variants/vendor/lib/motion-tokens";
import { ctaCopy, ctaFaces, ctaSetup, type CtaAction } from "./cta-section-data";
import styles from "./cta-section.module.css";

export type { CtaAction } from "./cta-section-data";
export type CtaVariant = "centered" | "split" | "banner";

export interface CtaSectionProps {
  /** `centered` is a closing section, `split` sits beside a product visual, `banner` is one dismissible line. */
  variant?: CtaVariant;
  title?: string;
  description?: string;
  primaryAction?: CtaAction;
  /** Not shown in the banner variant. Pass null to hide it. */
  secondaryAction?: CtaAction | null;
  /** Small print under the actions in the centered variant, such as "No credit card required". */
  note?: string;
  /** Faces beside the note in the centered variant. Pass an empty array to hide them. */
  faces?: string[];
  /** Short benefit lines in the split variant. */
  points?: string[];
  /** Replaces the split variant's worksheet. */
  visual?: ReactNode;
  /** Banner only: shows a dismiss button and calls this after it closes. */
  onDismiss?: () => void;
  className?: string;
}

type Bezier = [number, number, number, number];
const enter = [...motionTokens.ease.enter] as Bezier;
const presentation = motionTokens.keyframes.ctaSection;
const stageRest = { opacity: 1, y: 0 };
const stageStart = { opacity: 0, y: presentation.stageEnterPx };
const standard = [...motionTokens.ease.standard] as Bezier;
const bannerRest = { opacity: 1, height: "auto" };
const bannerExit = {
  opacity: 0,
  height: 0,
  transition: { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast, ease: standard } },
};

/** Native links, real callbacks, or an explicitly labelled local review toggle. */
function Action({ action, variant, size = "lg", arrow }: { action: CtaAction; variant: "default" | "outline"; size?: "xs" | "sm" | "default" | "lg"; arrow?: boolean }) {
  const [confirmed, setConfirmed] = useState(false);
  if (action.href) {
    return <NativeButton asChild variant={variant} size={size} className={styles.action}>
      <a href={action.href} onClick={action.onClick}>{action.label}{arrow && <ArrowRight className={styles.arrow} size="var(--rams-detail-motion-button-glyph-size)" strokeWidth="var(--rams-detail-cta-action-glyph-stroke)" aria-hidden="true" />}</a>
    </NativeButton>;
  }
  const localToggle = !action.onClick && !!action.confirmedLabel;
  return <Button
    className={styles.action}
    variant={variant}
    size={size}
    aria-live={localToggle ? "polite" : undefined}
    aria-pressed={localToggle ? confirmed : undefined}
    disabled={!action.onClick && !localToggle}
    onClick={() => { if (action.onClick) action.onClick(); else if (localToggle) setConfirmed(value => !value); }}
  >
    {confirmed
      ? <><Check size="var(--rams-detail-motion-button-glyph-size)" strokeWidth="var(--rams-detail-cta-confirm-glyph-stroke)" aria-hidden="true" />{action.confirmedLabel ?? action.label}</>
      : <>{action.label}{arrow && <ArrowRight className={styles.arrow} size="var(--rams-detail-motion-button-glyph-size)" strokeWidth="var(--rams-detail-cta-action-glyph-stroke)" aria-hidden="true" />}</>}
  </Button>;
}

function SplitStage({ children }: { children: ReactNode }) {
  const stage = useRef<HTMLDivElement>(null);
  const reduced = !!useReducedMotion();
  const inView = useInView(stage, { once: true, amount: presentation.stageInViewShare });
  const controls = useAnimationControls();

  useLayoutEffect(() => {
    if (reduced) {
      controls.set(stageRest);
    } else if (inView) {
      void controls.start(stageRest);
    }
    return () => controls.stop();
  }, [controls, inView, reduced]);

  return <motion.div ref={stage} className={styles.stage} initial={reduced ? false : stageStart}
    animate={controls} transition={{ duration: motionTokens.duration.considered, ease: enter }}>
    {children}
  </motion.div>;
}

/** Static worksheet facts for the split layout. */
function SetupVisual() {
  return <div className={styles.setup}>
    <h3 className={styles.setupHead}>{ctaSetup.title}</h3>
    <ul className={styles.steps}>{ctaSetup.facts.map(fact => <li className={styles.step} key={fact}>{fact}</li>)}</ul>
  </div>;
}

function Faces({ faces }: { faces: string[] }) {
  if (!faces.length) return null;
  return <span className={styles.faces} aria-hidden="true">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    {faces.slice(0, contentPresentation.callToAction.visibleFaces).map(src => <img key={src} src={src} alt="" className={styles.face} />)}
  </span>;
}

/**
 * A call to action in three shapes: a centered closing section, a split layout beside a print worksheet, and a compact banner that closes its gap when dismissed.
 */
export const CtaSection = forwardRef<HTMLElement, CtaSectionProps>(function CtaSection({
  variant = "centered",
  title,
  description,
  primaryAction,
  secondaryAction,
  note,
  faces = ctaFaces,
  points,
  visual,
  onDismiss,
  className,
}, ref) {
  const id = useId();
  const [open, setOpen] = useState(true);
  const copy = ctaCopy[variant];
  const heading = title ?? copy.title;
  const text = description ?? copy.description;
  const primary = primaryAction ?? copy.primary;
  const secondary = secondaryAction === null ? null : secondaryAction ?? ("secondary" in copy ? copy.secondary : undefined);
  const classes = [styles.cta, className].filter(Boolean).join(" ");

  if (variant === "banner") {
    return <section ref={ref} className={classes} data-variant="banner" aria-labelledby={`${id}-title`}>
      <AnimatePresence initial={false} onExitComplete={onDismiss}>
        {open && <MotionRegion key="banner" className={styles.bannerWrap} animate={bannerRest} exit={bannerExit}>
          <div className={styles.bannerPad}><div className={styles.banner}>
            <p className={styles.bannerText}>
              <strong id={`${id}-title`}>{heading}</strong>
              <span>{text}</span>
            </p>
            <div className={styles.bannerActions}>
              <Action action={primary} variant="default" size="sm" arrow />
              {onDismiss !== undefined && <button type="button" className={styles.dismiss} aria-label="Dismiss" onClick={() => setOpen(false)}>
                <X size="var(--rams-detail-motion-button-glyph-size)" strokeWidth="var(--rams-detail-motion-button-glyph-stroke)" aria-hidden="true" />
              </button>}
            </div>
          </div></div>
        </MotionRegion>}
      </AnimatePresence>
    </section>;
  }

  if (variant === "split") {
    const list = points ?? ctaCopy.split.points;
    return <section ref={ref} className={classes} data-variant="split" aria-labelledby={`${id}-title`}>
      <div className={styles.split}>
        <div className={styles.splitCopy}>
          <h2 id={`${id}-title`} className={styles.title}>{heading}</h2>
          <p className={styles.description}>{text}</p>
          {list.length > 0 && <ul className={styles.points}>
            {list.map(point => <li key={point}><Check size="var(--rams-detail-motion-button-glyph-size)" strokeWidth="var(--rams-detail-cta-action-glyph-stroke)" aria-hidden="true" />{point}</li>)}
          </ul>}
          <div className={styles.actions}>
            <Action action={primary} variant="default" arrow />
            {secondary && <Action action={secondary} variant="outline" />}
          </div>
        </div>
        <SplitStage>{visual ?? <SetupVisual />}</SplitStage>
      </div>
    </section>;
  }

  const small = note ?? ctaCopy.centered.note;
  return <section ref={ref} className={classes} data-variant="centered" aria-labelledby={`${id}-title`}>
    <div className={styles.centeredWrap}>
      <div className={styles.centered}>
        <h2 id={`${id}-title`} className={styles.title}>{heading}</h2>
        <p className={styles.description}>{text}</p>
        <div className={styles.actions}>
          <Action action={primary} variant="default" arrow />
          {secondary && <Action action={secondary} variant="outline" />}
        </div>
        {(small || faces.length > 0) && <p className={styles.note}><Faces faces={faces} />{small}</p>}
      </div>
    </div>
  </section>;
});

CtaSection.displayName = "CtaSection";

const variantOptions = [{ value: "centered", label: "Centered" }, { value: "split", label: "Split" }, { value: "banner", label: "Banner" }];

/** Springs the frame to its content's height after a discrete change (a new layout, a dismissed banner), so the preview never snaps.
 *  Other resizes, such as the banner's own collapse or a parent reflow, follow at once so nothing lags. */
function useFrameHeight(key: string, reduced: boolean) {
  const content = useRef<HTMLDivElement>(null);
  const height = useMotionValue<number | "auto">("auto");
  const lastKey = useRef(key), armedUntil = useRef(0);
  useLayoutEffect(() => {
    if (lastKey.current === key) return;
    lastKey.current = key;
    armedUntil.current = performance.now() + motionTokens.layoutMeasurement.contentChangeWindowMs;
  }, [key]);
  useEffect(() => {
    const node = content.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    let measured = false;
    const observer = new ResizeObserver(() => {
      const next = node.offsetHeight;
      if (!measured || reduced || performance.now() > armedUntil.current) { measured = next > 0; height.jump(next || "auto"); return; }
      animate(height, next, motionTokens.spring.smooth);
    });
    observer.observe(node);
    return () => { observer.disconnect(); height.stop(); };
  }, [height, reduced]);
  return { content, height };
}

/** Three layouts sharing one dismissal/restore focus owner. */
export function CtaSectionBlock(props: Omit<CtaSectionProps, "variant" | "onDismiss"> = {}) {
  const reduced = !!useReducedMotion();
  const [variant, setVariant] = useState<CtaVariant>("centered");
  const [dismissed, setDismissed] = useState(false);
  const showRestore = variant === "banner" && dismissed;
  const view = showRestore ? "restore" : variant;
  const pendingFocus = useRef<{ from: HTMLButtonElement; restore: boolean } | null>(null);
  const restoreButton = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => {
    const pending = pendingFocus.current;
    if (!pending || pending.restore !== showRestore) return;
    const frame = requestAnimationFrame(() => {
      if (pendingFocus.current !== pending) return;
      const target = showRestore ? restoreButton.current : content.current?.querySelector<HTMLButtonElement>('[data-variant="banner"] button');
      if ((document.activeElement === document.body || document.activeElement === pending.from) && target) target.focus({ preventScroll: true });
      pendingFocus.current = null;
    });
    return () => cancelAnimationFrame(frame);
  }, [showRestore]);
  const { content, height } = useFrameHeight(view, reduced);
  // The first layout appears as is; later layouts fade in while the frame springs to their height.
  const [changed, setChanged] = useState(false);
  return <div className={styles.preview}>
    <Select value={variant} onValueChange={next => { setChanged(true); setVariant(next as CtaVariant); setDismissed(false); }}><SelectTrigger aria-label="Call to action layout" data-preview-variable="Call to action layout"><SelectValue /></SelectTrigger><SelectContent position="popper" collisionPadding={floatingPlacement.motionSelect.collisionInsetPx}>{variantOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>
    <motion.div className={styles.frame} style={{ height: reduced ? "auto" : height }}>
      <div ref={content} onClickCapture={event => {
        const target = (event.target as HTMLElement).closest<HTMLButtonElement>('button[aria-label="Dismiss"]');
        if (target) pendingFocus.current = document.activeElement === target ? { from: target, restore: true } : null;
      }}>
        <motion.div key={view} className={styles.previewView} initial={reduced || !changed ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={reduced ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : { duration: motionTokens.duration.standard, ease: standard }}>
          {showRestore
            ? <div className={styles.restore}><Button ref={restoreButton} variant="outline" size="sm" onClick={event => { pendingFocus.current = document.activeElement === event.currentTarget ? { from: event.currentTarget, restore: false } : null; setDismissed(false); }}>Show banner</Button></div>
            : <CtaSection {...props} variant={variant} onDismiss={variant === "banner" ? () => { setChanged(true); setDismissed(true); } : undefined} />}
        </motion.div>
      </div>
    </motion.div>
  </div>;
}

export default CtaSectionBlock;
