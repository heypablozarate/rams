"use client";
import "./motion-fields.css";

import { Dialog as DialogPrimitive } from "radix-ui";
import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ComponentPropsWithoutRef, ReactNode, RefObject } from "react";
import { AnimatePresence, animate, motion, useMotionValue } from "motion/react";
import { useReducedMotion } from "./use-motion-preference";
import { MotionRegion, MotionSwap } from "./motion-swap";
import type { PanInfo, Transition } from "motion/react";
import { X } from "lucide-react";
import { Button } from "./button";
import { motionTokens } from "./motion-tokens";
import styles from "./motion-drawer.module.css";

/**
 * The last item a drawer showed. Pass the selected item (or null when nothing is open) and render the drawer's content
 * from the result, so the content stays on screen while the panel slides out instead of vanishing the moment it closes.
 */
export function useDrawerItem<T>(item: T | null | undefined): T | null | undefined {
  const [last, setLast] = useState(item);
  if (item != null && item !== last) setLast(item);
  return item ?? last;
}

/** Mirrors the open state so the panel can stay mounted while it slides out, retarget mid-flight, and close itself after a drag. */
const DrawerContext = createContext<{ open: boolean; flung: boolean; setOpen: (open: boolean) => void; fling: () => void; openedAt: RefObject<number> } | null>(null);

export function Drawer({ open: openProp, defaultOpen = false, onOpenChange, ...props }: ComponentPropsWithoutRef<typeof DialogPrimitive.Root>) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  // A drag that dismisses the panel hands its velocity to the exit spring; every other close uses the shorter tween.
  const [flung, setFlung] = useState(false);
  // When the drawer last opened, so a click that reopens it mid-close is not also read as a click outside the leaving panel.
  const openedAt = useRef(0);
  const open = openProp ?? uncontrolled;
  const setOpen = useCallback((next: boolean) => {
    setFlung(false);
    if (next) openedAt.current = performance.now();
    if (openProp === undefined) setUncontrolled(next);
    onOpenChange?.(next);
  }, [openProp, onOpenChange]);
  const fling = useCallback(() => { setOpen(false); setFlung(true); }, [setOpen]);
  const value = useMemo(() => ({ open, flung, setOpen, fling, openedAt }), [open, flung, setOpen, fling]);
  return <DrawerContext.Provider value={value}><DialogPrimitive.Root {...props} open={open} onOpenChange={setOpen} /></DrawerContext.Provider>;
}

export const DrawerTrigger = DialogPrimitive.Trigger;
export const DrawerClose = DialogPrimitive.Close;

export interface DrawerContentProps
  extends ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  title: string;
  description?: string;
  children: ReactNode;
  /** Actions share the surface footer gap; the surrounding shell owns inset. */
  footer?: ReactNode;
  side?: "left" | "right" | "top" | "bottom";
  /** Renders the drawer inside this element instead of the page body, anchored to its edges. The element needs position: relative and overflow: hidden. */
  container?: HTMLElement | null;
}

const { exitFadeStart, textTravelEm, unmeasuredPanelSizePx, dismissTravelDivisor, dismissSpeedPxPerSecond } = motionTokens.keyframes.drawerPresentation;
/* A click or Escape returns the panel quickly; a flick keeps its velocity in a spring of the same length. The shadow fades over the last stretch so it leaves with the panel instead of popping away at unmount. */
const shadowOut: Transition = { duration: motionTokens.duration.standard, times: [0, exitFadeStart, 1], ease: "linear" };
const leave: Transition = { default: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.standard] }, opacity: shadowOut };
const flingOut: Transition = { default: { ...motionTokens.spring.smooth, visualDuration: motionTokens.duration.standard }, opacity: shadowOut };

/** When the title or description changes while open, the new copy rises in and the old copy leaves upward. */
function SwapText({ text }: { text: string }) {
  const reduced = useReducedMotion();
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <MotionSwap
        key={text}
        className={styles.swap}
        initial={reduced ? false : { opacity: 0, y: `${textTravelEm}em`, filter: `blur(${motionTokens.blur.soft}px)` }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={reduced ? { opacity: 0, transition: { duration: motionTokens.reduced.duration } } : { opacity: 0, y: `-${textTravelEm}em`, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } }}
        transition={reduced ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] }}
      >
        {text}
      </MotionSwap>
    </AnimatePresence>
  );
}

export function DrawerContent({
  title,
  description,
  children,
  footer,
  side = "right",
  container,
  className,
  onInteractOutside,
  ...props
}: DrawerContentProps) {
  const drawer = useContext(DrawerContext);
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreTrigger = useRef<HTMLElement | null>(null);
  const restoreFocus = useCallback(() => {
    const panel = panelRef.current;
    const owner = panel?.ownerDocument;
    if (owner && restoreTrigger.current?.isConnected && (panel.contains(owner.activeElement) || owner.activeElement === owner.body)) {
      restoreTrigger.current.focus({ preventScroll: true });
    }
  }, []);
  useLayoutEffect(() => {
    if (!drawer?.open && !props.onCloseAutoFocus) restoreFocus();
  }, [drawer?.open, props.onCloseAutoFocus, restoreFocus]);
  const offset = useMotionValue<number | string>(0);
  const pan = useRef<number | null>(null);
  const axis = side === "left" || side === "right" ? "x" : "y";
  const sign = side === "right" || side === "bottom" ? 1 : -1;
  const offscreen = { [axis]: `${sign * 100}%` };
  const classes = [styles.content, className].filter(Boolean).join(" ");
  const draggable = drawer !== null && !reduced;

  useLayoutEffect(() => {
    if (!reduced) return;
    pan.current = null;
    offset.jump(0);
  }, [offset, reduced]);

  const panelSize = () => (axis === "x" ? panelRef.current?.offsetWidth : panelRef.current?.offsetHeight) ?? unmeasuredPanelSizePx;

  // The header is the grab handle. It follows the pointer toward the edge and rubber-bands the other way.
  function panStart(event: PointerEvent) {
    const target = event.target instanceof Element ? event.target : null;
    if (!draggable || target?.closest("button, a, input, select, textarea, [role='button']")) return;
    // The entrance animates in percent of the panel, so a grab mid-flight converts it to pixels.
    const value = offset.get();
    pan.current = typeof value === "number" ? value : parseFloat(value) / 100 * panelSize();
    offset.stop();
  }
  function panMove(_: PointerEvent, info: PanInfo) {
    if (pan.current === null) return;
    const toward = (pan.current + info.offset[axis]) * sign;
    offset.set(sign * (toward >= 0 ? toward : -Math.sqrt(-toward)));
  }
  // Past a third of the panel, or on a quick flick toward the edge, the drawer closes and keeps its velocity; otherwise it springs back.
  function panEnd(_: PointerEvent, info: PanInfo) {
    if (pan.current === null) return;
    pan.current = null;
    const toward = Number(offset.get()) * sign;
    if (toward > panelSize() / dismissTravelDivisor || (toward > 0 && info.velocity[axis] * sign > dismissSpeedPxPerSecond)) drawer?.fling();
    else animate(offset, 0, motionTokens.spring.snappy);
  }

  const inner = <>
    <motion.div className={["rams-surface__header-gap", styles.header, draggable ? styles.handle : ""].filter(Boolean).join(" ")} onPanStart={panStart} onPan={panMove} onPanEnd={panEnd}>
      <DialogPrimitive.Title className={styles.title}><SwapText text={title} /></DialogPrimitive.Title>
      <DialogPrimitive.Close asChild>
        <Button type="button" variant="ghost" size="icon-sm" className={styles.close} aria-label="Close drawer">
          <X size="var(--rams-detail-motion-button-glyph-size)" strokeWidth="var(--rams-detail-motion-button-glyph-stroke)" aria-hidden="true" />
        </Button>
      </DialogPrimitive.Close>
      {description ? (
        <DialogPrimitive.Description className={styles.description}>
          <SwapText text={description} />
        </DialogPrimitive.Description>
      ) : null}
    </motion.div>
    <div className={["rams-surface__body", styles.body].join(" ")} data-slot="drawer-body">{children}</div>
    {footer != null && <div className={["rams-surface__footer", styles.footer].join(" ")} data-slot="drawer-footer">{footer}</div>}
  </>;

  // Under a bare Radix root the open state is unknown here, so CSS keyframes keyed off data-state animate the layers instead.
  if (drawer === null) {
    return (
      <DialogPrimitive.Portal container={container}>
        <DialogPrimitive.Overlay className={`${styles.overlay} ${styles.keyframes}`} data-contained={container ? "" : undefined} />
        <DialogPrimitive.Content {...props} onInteractOutside={onInteractOutside} data-side={side} data-contained={container ? "" : undefined} className={`${classes} ${styles.keyframes}`}>{inner}</DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    );
  }

  // The panel springs fully opaque from its own edge and returns to it faster than it arrived, from wherever it is.
  return (
    <AnimatePresence custom={drawer.flung}>
      {drawer.open && (
        <DialogPrimitive.Portal key="drawer" forceMount container={container}>
          <DialogPrimitive.Overlay asChild forceMount>
            <MotionRegion
              className={styles.overlay}
              data-contained={container ? "" : undefined}
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: reduced ? ({ duration: motionTokens.reduced.duration }) : { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } }}
              transition={reduced ? ({ duration: motionTokens.reduced.duration }) : { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] }}
            />
          </DialogPrimitive.Overlay>
          <DialogPrimitive.Content
            {...props}
            asChild
            forceMount
            onOpenAutoFocus={event => {
              const panel = panelRef.current;
              restoreTrigger.current = panel ? Array.from(panel.ownerDocument.querySelectorAll<HTMLElement>('[aria-controls]')).find(node => node.getAttribute("aria-controls") === panel.id) ?? null : null;
              props.onOpenAutoFocus?.(event);
            }}
            // Radix reads a click outside on click, so the press that reopens a closing drawer would dismiss it again.
            onInteractOutside={event => {
              onInteractOutside?.(event);
              if (event.detail.originalEvent.timeStamp < drawer.openedAt.current) event.preventDefault();
            }}
          >
            <MotionRegion
              ref={panelRef}
              className={classes}
              data-side={side}
              data-contained={container ? "" : undefined}
              style={{ [axis]: offset }}
              variants={{ exit: (flung: boolean) => reduced ? { opacity: 0, transition: ({ duration: motionTokens.reduced.duration }) } : { ...offscreen, opacity: [1, 1, 0], transition: flung ? flingOut : leave } }}
              initial={reduced ? false : { ...offscreen, opacity: 1 }}
              animate={{ [axis]: 0, opacity: 1 }}
              exit="exit"
              transition={reduced ? ({ duration: motionTokens.reduced.duration }) : motionTokens.spring.smooth}
            >
              {inner}
            </MotionRegion>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

export default Drawer;
