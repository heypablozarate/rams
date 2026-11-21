"use client";
import "./motion-fields.css";

import { Dialog as DialogPrimitive } from "radix-ui";
import { createContext, useCallback, useContext, useLayoutEffect, useRef, useState } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "./use-motion-preference";
import type { Transition } from "motion/react";
import { X } from "lucide-react";
import { Button as RamsButton } from "./button";
import { DialogHeader as RamsDialogHeader, DialogTitle as RamsDialogTitle, DialogDescription as RamsDialogDescription } from "./dialog";
import { motionTokens } from "./motion-tokens";
import styles from "./motion-dialog.module.css";

/** Mirrors the open state so the content can stay mounted while it animates out, and retarget mid-flight if it is reopened or closed early. */
const OpenContext = createContext<boolean | null>(null);

export function Dialog({ open: openProp, defaultOpen = false, onOpenChange, ...props }: ComponentPropsWithoutRef<typeof DialogPrimitive.Root>) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const open = openProp ?? uncontrolled;
  const setOpen = useCallback((next: boolean) => { if (openProp === undefined) setUncontrolled(next); onOpenChange?.(next); }, [openProp, onOpenChange]);
  return <OpenContext.Provider value={open}><DialogPrimitive.Root {...props} open={open} onOpenChange={setOpen}/></OpenContext.Provider>;
}

export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export interface DialogContentProps extends ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  title: string;
  description?: string;
  children: ReactNode;
  /** Actions share the surface footer gap; the surrounding shell owns inset. */
  footer?: ReactNode;
}

const fade: Transition = { duration: motionTokens.duration.instant };
const leave: Transition = { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] };

/** When the title or description changes while open, the new copy rises in and the old copy leaves upward. */
function SwapText({ text }: { text: string }) {
  const reduced = useReducedMotion();
  return <>
    <span className={styles.semanticText}>{text}</span>
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span key={text} className={styles.swap} aria-hidden="true" initial={reduced ? false : { opacity: 0, y: `${motionTokens.keyframes.statusSwap.textOffsetEm}em`, filter: `blur(${motionTokens.blur.soft}px)` }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={reduced ? { opacity: 0, transition: { duration: motionTokens.reduced.duration } } : { opacity: 0, y: `-${motionTokens.keyframes.statusSwap.textOffsetEm}em`, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } }} transition={reduced ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] }}>{text}</motion.span>
    </AnimatePresence>
  </>;
}

export function DialogContent({ title, description, children, footer, className, onPointerDownOutside, ...props }: DialogContentProps) {
  const open = useContext(OpenContext);
  const reduced = useReducedMotion();
  // When the open state last changed. Radix waits for the click before treating a press as outside, and a press on the trigger
  // while the dialog leaves reopens it first, so that press must not close it again.
  const change = useRef({ open, at: 0 });
  useLayoutEffect(() => { change.current = { open, at: performance.now() }; }, [open]);
  const pressOutside: DialogContentProps["onPointerDownOutside"] = event => {
    onPointerDownOutside?.(event);
    if (open !== null && (!change.current.open || event.detail.originalEvent.timeStamp < change.current.at)) event.preventDefault();
  };
  const classes = [styles.content, className].filter(Boolean).join(" ");
  const inner = <>
    <RamsDialogHeader className={styles.header}>
      <RamsDialogTitle className={styles.title}><SwapText text={title}/></RamsDialogTitle>
      <DialogPrimitive.Close asChild><RamsButton type="button" data-slot="dialog-close" variant="ghost" size="icon-sm" className={styles.close} aria-label="Close"><X aria-hidden="true"/></RamsButton></DialogPrimitive.Close>
      {description ? <RamsDialogDescription className={styles.description}><SwapText text={description}/></RamsDialogDescription> : null}
    </RamsDialogHeader>
    <div className={["rams-surface__body", styles.body].join(" ")} data-slot="dialog-body">{children}</div>
    {footer != null && <div className={["rams-surface__footer", styles.footer].join(" ")} data-slot="dialog-footer">{footer}</div>}
  </>;
  // Under a bare Radix root the open state is unknown here, so CSS keyframes keyed off data-state animate the layers instead.
  if (open === null) return <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className={`${styles.overlay} ${styles.keyframes}`}/>
    <DialogPrimitive.Content data-slot="dialog-content" {...props} onPointerDownOutside={pressOutside} className={`${classes} ${styles.keyframes}`}>{inner}</DialogPrimitive.Content>
  </DialogPrimitive.Portal>;
  // The overlay fades while the dialog rises 8px and scales up on a spring. Closing is shorter and quieter, and starts from wherever the entrance is.
  return <AnimatePresence>
    {open && <DialogPrimitive.Portal key="dialog" forceMount>
      <DialogPrimitive.Overlay asChild forceMount><motion.div className={styles.overlay} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: reduced ? ({ duration: motionTokens.reduced.duration }) : leave }} transition={reduced ? ({ duration: motionTokens.reduced.duration }) : { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] }}/></DialogPrimitive.Overlay>
      <DialogPrimitive.Content {...props} onPointerDownOutside={pressOutside} asChild forceMount>
        <motion.div data-slot="dialog-content" className={classes} initial={reduced ? { opacity: 0 } : { opacity: 0, y: motionTokens.keyframes.dialog.enterOffsetPx, scale: motionTokens.keyframes.dialog.enterScale }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduced ? { opacity: 0, transition: ({ duration: motionTokens.reduced.duration }) } : { opacity: 0, y: motionTokens.keyframes.dialog.exitOffsetPx, scale: motionTokens.keyframes.dialog.exitScale, transition: leave }} transition={reduced ? ({ duration: motionTokens.reduced.duration }) : { default: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.enter] } }}>{inner}</motion.div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>}
  </AnimatePresence>;
}
