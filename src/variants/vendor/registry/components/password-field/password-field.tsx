"use client";
import { useComposedRefs } from "@radix-ui/react-compose-refs";
import { forwardRef, useLayoutEffect, useEffect, useId, useMemo, useRef, useState } from "react";
import type { InputHTMLAttributes } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { TargetAndTransition } from "motion/react";
import { useReducedMotion } from "@/variants/use-motion-preference";
import { MotionSwap } from "@/variants/motion-swap";
import { motionTokens } from "@/variants/vendor/lib/motion-tokens";
import { Input as RamsInput } from "@/primitives/input";
import styles from "./password-field.module.css";

const fieldMotion = motionTokens.keyframes.fieldMessage;
/** The toggle's names. Both have English defaults; pass the ones you translate. */
export interface PasswordFieldMessages { showPassword: string; hidePassword: string }
export const defaultPasswordFieldMessages: PasswordFieldMessages = { showPassword: "Show password", hidePassword: "Hide password" };
export interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  description?: string;
  /** Translated or reworded toggle names. */
  messages?: Partial<PasswordFieldMessages>;
}
/** One eye that a slash draws across, cutting the outline beneath it, instead of swapping two icons. */
function EyeMorph({ slashed }: { slashed: boolean }) {
  const reduced = useReducedMotion(); const maskId = `eye-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const slash = { pathLength: slashed ? 1 : 0, opacity: slashed ? 1 : 0 };
  const transition = reduced ? { duration: motionTokens.reduced.duration } : { pathLength: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.standard] }, opacity: { duration: motionTokens.duration.instant } };
  return <svg width="var(--rams-detail-password-field-reveal-glyph-size)" height="var(--rams-detail-password-field-reveal-glyph-size)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="var(--rams-detail-motion-button-glyph-stroke)" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24"><rect width="24" height="24" fill="white" stroke="none" /><motion.path data-rams-password-eye-slash="" d="M2 2l20 20" stroke="black" strokeWidth={5} initial={false} animate={slash} transition={reduced ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : transition} /></mask>
    <g mask={`url(#${maskId})`}><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></g>
    <motion.path data-rams-password-eye-slash="" d="M2 2l20 20" initial={false} animate={slash} transition={reduced ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : transition} />
  </svg>;
}
/** Changed words rise in and unblur while unchanged words hold still. Assistive tech reads the plain copy. */
const wordEnter = { opacity: 0, y: `${fieldMotion.wordTravelEm}em`, filter: `blur(${motionTokens.blur.soft}px)` };
const wordRest = { opacity: 1, y: 0, filter: "blur(0px)" };
const wordExit: TargetAndTransition = { opacity: 0, y: `${-fieldMotion.wordTravelEm}em`, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.exit, ease: [...motionTokens.ease.exit] } };

function MotionText({ text }: { text: string }) {
  const reduced = useReducedMotion();
  const words = text.split(" ");
  return <><span className={styles.srOnly}>{text}</span><span className={styles.words} aria-hidden="true"><AnimatePresence initial={false} mode="popLayout">{words.map((word, index) => <MotionSwap key={`${index}:${word}`} className={styles.word}
    initial={reduced ? false : wordEnter} animate={wordRest} exit={wordExit}
    transition={reduced ? { duration: motionTokens.reduced.duration } : { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] }}>{index < words.length - 1 ? `${word} ` : word}</MotionSwap>)}</AnimatePresence></span></>;
}

/** Helper and error copy: the row opens its height on a spring, then the words settle in. */
function FieldMessage({ id, text, className, alert }: { id?: string; text?: string; className?: string; alert?: boolean }) {
  return <AnimatePresence initial={false}>{text ? <MessageRow key="message" id={id} text={text} className={className} alert={alert} /> : null}</AnimatePresence>;
}

/** The row tracks the measured copy, so a longer message that wraps opens its next line instead of snapping. */
const messageEnter = { height: 0, opacity: 0 };
const messageExit: TargetAndTransition = { height: 0, opacity: 0, transition: { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.instant } } };

function MessageRow({ id, text, className, alert }: { id?: string; text: string; className?: string; alert?: boolean }) {
  const reduced = useReducedMotion();
  const copyRef = useRef<HTMLSpanElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");
  useEffect(() => {
    const node = copyRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => { if (entry) setHeight(entry.borderBoxSize?.[0]?.blockSize ?? node.offsetHeight); });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const messageRest = useMemo(() => ({ height, opacity: 1 }), [height]);
  return <MotionSwap className={styles.messageSlot} initial={reduced ? false : messageEnter} animate={messageRest} exit={messageExit} transition={reduced ? { duration: motionTokens.reduced.duration } : { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast } }}>
    <motion.span ref={copyRef} id={id} className={className} role={alert ? "alert" : undefined} initial={reduced ? false : { y: `${fieldMotion.wordTravelEm}em`, filter: `blur(${motionTokens.blur.soft}px)` }} animate={{ y: 0, filter: "blur(0px)" }} transition={{ duration: reduced ? motionTokens.reduced.duration : motionTokens.duration.standard, ease: [...motionTokens.ease.enter] }}><MotionText text={text} /></motion.span>
  </MotionSwap>;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(function PasswordField({ label, description, messages: messagesProp, id, className, ...props }, ref) {
  const messages = { ...defaultPasswordFieldMessages, ...messagesProp };
  const generated = useId(), controlId = id ?? generated;
  const [visible, setVisible] = useState(false), [toggled, setToggled] = useState(false);
  const input = useRef<HTMLInputElement>(null), composedRef = useComposedRefs(input, ref);
  const selection = useRef<{value:string;start:number;end:number;direction:"forward"|"backward"|"none"|null}|null>(null);
  const hintId = description ? controlId + "-description" : undefined;
  useLayoutEffect(() => {
    const current = input.current, pending = selection.current;
    if (!current || !pending) return;
    const owner = document.activeElement;
    // Chromium finishes the native click/type change after this commit. Restore once
    // in the next frame, unless an edit, focus move, newer reveal or unmount supersedes it.
    const frame = requestAnimationFrame(() => {
      if (input.current === current && current.value === pending.value && document.activeElement === owner && current.type === (visible ? "text" : "password")) current.setSelectionRange(pending.start,pending.end,pending.direction ?? undefined);
      if (selection.current === pending) selection.current = null;
    });
    return () => cancelAnimationFrame(frame);
  }, [visible]);
  function reveal() {
    const current = input.current, pending = selection.current;
    selection.current = current && current.selectionStart !== null && current.selectionEnd !== null
      ? pending && pending.value === current.value && current.selectionStart === 0 && current.selectionEnd === 0
        ? pending
        : {value:current.value,start:current.selectionStart,end:current.selectionEnd,direction:current.selectionDirection}
      : null;
    setVisible(value => !value);
    setToggled(true);
  }
  return <div className={styles.field}><label htmlFor={controlId}>{label}</label><div className={styles.shell}><RamsInput {...props} ref={composedRef} id={controlId} type={visible ? "text" : "password"} data-reveal={toggled ? (visible ? "shown" : "hidden") : undefined} aria-describedby={[props["aria-describedby"], hintId].filter(Boolean).join(" ") || undefined} className={[styles.input, className].filter(Boolean).join(" ")} /><button type="button" onClick={reveal} aria-controls={controlId} aria-label={visible ? messages.hidePassword : messages.showPassword} aria-pressed={visible}><EyeMorph slashed={visible} /></button></div><FieldMessage id={hintId} text={description} className={styles.hint} /></div>;
});
