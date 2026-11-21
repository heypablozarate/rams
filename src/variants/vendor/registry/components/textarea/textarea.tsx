"use client";
import { forwardRef, useEffect, useId, useRef, useState } from "react";
import type { TextareaHTMLAttributes } from "react";
import { AnimatePresence, motion } from "motion/react";
import { StaticFieldMessage } from "@/variants/static-field-message";
import { useReducedMotion } from "@/variants/use-motion-preference";
import { motionTokens } from "@/variants/vendor/lib/motion-tokens";
import { Textarea as RamsTextarea } from "@/primitives/textarea";
import styles from "./textarea.module.css";

const fieldMotion = motionTokens.keyframes.fieldMessage;
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> { label: string; description?: string; error?: string }
/* Digits roll up when a number grows and down when it shrinks; `custom` hands the latest direction to digits already leaving. */
const digit = {
  enter: (direction: number) => ({ opacity: 0, y: `${direction * fieldMotion.digitTravelEm}em`, filter: `blur(${motionTokens.blur.subtle}px)` }),
  center: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: (direction: number) => ({ opacity: 0, y: `${-direction * fieldMotion.digitTravelEm}em`, filter: `blur(${motionTokens.blur.subtle}px)` }),
};
const isNumber = (word: string) => /^\d[\d.,/:]*%?$/.test(word);

/** A count in the copy, such as "12 characters", rolls only the digits that changed; a gained or lost digit opens or closes its width. */
function RollingNumber({ word }: { word: string }) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState({ word, direction: 1 });
  if (shown.word !== word) setShown({ word, direction: parseFloat(word.replace(/,/g, "")) < parseFloat(shown.word.replace(/,/g, "")) ? -1 : 1 });
  const characters = word.split("");
  const transition = reduced ? { duration: motionTokens.reduced.duration } : { y: motionTokens.spring.snappy, width: motionTokens.spring.morph, opacity: { duration: motionTokens.duration.fast }, filter: { duration: motionTokens.duration.fast } };
  return <AnimatePresence initial={false}>{characters.map((character, index) => <motion.span key={characters.length - index} className={styles.column} initial={reduced ? false : { width: 0, opacity: 0 }} animate={{ width: "auto", opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={reduced ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : transition}>
    <AnimatePresence initial={false} mode="popLayout" custom={shown.direction}><motion.span key={character} custom={shown.direction} variants={digit} initial="enter" animate="center" exit="exit" transition={reduced ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : transition}>{character}</motion.span></AnimatePresence>
  </motion.span>)}</AnimatePresence>;
}

/** Changed words rise in and unblur while unchanged words hold still, and numbers roll. Assistive tech reads the plain copy. */
function MotionText({ text }: { text: string }) {
  const reduced = useReducedMotion();
  const words = text.split(" ");
  return <><span className={styles.srOnly}>{text}</span><span className={styles.words} aria-hidden="true"><AnimatePresence initial={false} mode="popLayout">{words.map((word, index) => <motion.span key={`${index}:${isNumber(word) ? "#" : word}`} className={styles.word}
    initial={reduced ? { opacity: 0 } : { opacity: 0, y: `${fieldMotion.wordTravelEm}em`, filter: `blur(${motionTokens.blur.soft}px)` }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    exit={reduced ? { opacity: 0, transition: { duration: motionTokens.reduced.duration } } : { opacity: 0, y: `${-fieldMotion.wordTravelEm}em`, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } }}
    transition={reduced ? { duration: motionTokens.reduced.duration } : { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] }}>{isNumber(word) ? <RollingNumber word={word} /> : word}{index < words.length - 1 ? " " : null}</motion.span>)}</AnimatePresence></span></>;
}

/** Helper and error copy: the row opens its height on a spring, then the words settle in. */
function FieldMessage({ id, text, className, alert }: { id?: string; text?: string; className?: string; alert?: boolean }) {
  const reduced = useReducedMotion();
  if (reduced) return <StaticFieldMessage id={id} text={text} alert={alert} slotClassName={styles.messageSlot} copyClassName={className} srOnlyClassName={styles.srOnly} wordsClassName={styles.words} wordClassName={styles.word} />;
  return <AnimatePresence initial={false}>{text ? <MessageRow key="message" id={id} text={text} className={className} alert={alert} /> : null}</AnimatePresence>;
}

/** The row tracks the measured copy, so a longer message that wraps opens its next line instead of snapping. */
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
  return <motion.span className={styles.messageSlot} initial={reduced ? false : { height: 0, opacity: 0 }} animate={{ height, opacity: 1 }} exit={{ height: 0, opacity: 0, transition: reduced ? { duration: motionTokens.reduced.duration } : { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.instant } } }} transition={reduced ? { duration: motionTokens.reduced.duration } : { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast } }}>
    <motion.span ref={copyRef} id={id} className={className} role={alert ? "alert" : undefined} initial={reduced ? false : { y: `${fieldMotion.wordTravelEm}em`, filter: `blur(${motionTokens.blur.soft}px)` }} animate={{ y: 0, filter: "blur(0px)" }} transition={{ duration: reduced ? motionTokens.reduced.duration : motionTokens.duration.standard, ease: [...motionTokens.ease.enter] }}><MotionText text={text} /></motion.span>
  </motion.span>;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ label, description, error, id, className, ...props }, ref) {
  const generatedId = useId(); const controlId = id ?? generatedId;
  const hintId = description ? `${controlId}-description` : undefined; const errorId = error ? `${controlId}-error` : undefined;
  return <div className={styles.field}><label htmlFor={controlId}>{label}</label><RamsTextarea {...props} id={controlId} ref={ref} className={className} aria-invalid={error ? true : props["aria-invalid"]} aria-describedby={[props["aria-describedby"], hintId, errorId].filter(Boolean).join(" ") || undefined} aria-errormessage={error ? errorId : props["aria-errormessage"]}/><FieldMessage id={hintId} text={description} className={styles.hint} /><FieldMessage id={errorId} text={error} className={styles.error} alert /></div>;
});
