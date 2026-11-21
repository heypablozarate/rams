"use client";
import "./motion-fields.css";

import { contentPresentation } from "./content-presentation";
import { forwardRef, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { AnimatePresence, motion, useAnimate, useAnimationControls, usePresence } from "motion/react";
import { useReducedMotion } from "./use-motion-preference";
import type { TargetAndTransition } from "motion/react";
import { ArrowRight } from "lucide-react";
import AnimatedCounter from "./motion-animated-counter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Button } from "./motion-button";
import { motionTokens } from "./motion-tokens";
import { newsletterCopy, newsletterPublication, newsletterReaders } from "./motion-newsletter-signup-data";
import type { NewsletterIssue, NewsletterPublication } from "./motion-newsletter-signup-data";
import { InputGroup, InputGroupInput } from "./input-group";
import styles from "./motion-newsletter-signup.module.css";

export type { NewsletterIssue, NewsletterPublication, NewsletterStory } from "./motion-newsletter-signup-data";
export type NewsletterVariant = "inline" | "card";

export interface NewsletterSignupProps {
  /** `inline` puts the copy and form beside the issue stack; `card` is a self-contained card with the stack in a tray on top. */
  variant?: NewsletterVariant;
  title?: string;
  description?: string;
  placeholder?: string;
  buttonLabel?: string;
  /** Short line under the form about frequency and privacy. */
  privacyNote?: ReactNode;
  /** Link after the privacy note. Pass null to hide it. */
  privacyLink?: { label: string; href: string } | null;
  /** Reader count and up to three faces. The count ticks up by one when someone subscribes. Pass null to hide it. */
  readers?: { count: number; faces: string[] } | null;
  /** The issue stack. On success the upcoming issue, addressed to the new reader, lands on top. Pass null for a form without the stack. */
  publication?: NewsletterPublication | null;
  /** Called with a valid, trimmed email. Reject to show an error and keep the email; resolve to show the success state. */
  onSubscribe?: (email: string) => void | Promise<void>;
  className?: string;
}

type Phase = "idle" | "sending" | "done";
type Problem = { kind: "invalid" | "failed"; text: string };
type Bezier = [number, number, number, number];
const enter = [...motionTokens.ease.enter] as Bezier;
const standard = [...motionTokens.ease.standard] as Bezier;
const MotionInputGroup = motion.create(InputGroup);
const MESSAGES = {
  empty: "Enter your email address",
  format: "Enter an email like name@company.com",
  failed: "That didn't go through. Your email is kept, so try again.",
};
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const newsletterMotion = motionTokens.keyframes.newsletter;
const maximumVisibleIssues = contentPresentation.newsletter.visibleIssues;

function validate(value: string): Problem | null {
  const email = value.trim();
  if (!email) return { kind: "invalid", text: MESSAGES.empty };
  if (!EMAIL.test(email)) return { kind: "invalid", text: MESSAGES.format };
  return null;
}

const swapIn = { opacity: 0, y: newsletterMotion.messageTravelPx, filter: `blur(${motionTokens.blur.subtle}px)` };
const swapShown = { opacity: 1, y: 0, filter: "blur(0px)" };
const swapOut = { opacity: 0, y: -newsletterMotion.messageTravelPx, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease: standard } };
const swapEnter = { ...swapShown, transition: { duration: motionTokens.duration.standard, ease: enter } };

function useNewsletterPresence(enterTarget: TargetAndTransition, exitTarget: TargetAndTransition) {
  const reduce = useReducedMotion();
  const [present, safeToRemove] = usePresence();
  const controls = useAnimationControls();

  useLayoutEffect(() => {
    const target = present ? enterTarget : exitTarget;
    controls.stop();
    if (reduce) {
      controls.set(target);
      return;
    }
    let current = true;
    void controls.start(target).then(() => {
      if (current && !present) safeToRemove?.();
    });
    return () => { current = false; controls.stop(); };
  }, [controls, enterTarget, exitTarget, present, reduce, safeToRemove]);

  useEffect(() => {
    if (reduce && !present) safeToRemove?.();
  }, [present, reduce, safeToRemove]);

  return { controls, present };
}

const NewsletterSwapItem = forwardRef<HTMLDivElement, { initial: boolean; children: ReactNode }>(
  function NewsletterSwapItem({ initial, children }, ref) {
    const { controls, present } = useNewsletterPresence(swapEnter, swapOut);
    return <motion.div ref={ref} initial={initial ? swapIn : swapShown} animate={controls} inert={!present} aria-hidden={!present || undefined}>
      {children}
    </motion.div>;
  },
);

/** A line that swaps in place: the old text lifts away and the new one rises out of a soft blur. */
function Swap({ id, descriptionId, children, className, live }: { id: string; descriptionId: string; children: ReactNode; className?: string; live?: "polite" }) {
  const reduced = useReducedMotion();
  const mounted = useRef(false);
  useLayoutEffect(() => { mounted.current = true; }, []);
  return <div id={descriptionId} className={className} aria-live={live}>
    <AnimatePresence initial={false} mode="popLayout">
      <NewsletterSwapItem key={id} initial={mounted.current && !reduced}>{children}</NewsletterSwapItem>
    </AnimatePresence>
  </div>;
}

/** One issue: masthead, recipient line, subject, and three stories with thumbnails. */
function IssueCard({ issue, name, to }: { issue: NewsletterIssue; name: string; to?: string }) {
  return <>
    <header className={styles.issueHead}>
      <span className={styles.masthead}>{name}</span>
      <span className={styles.issueNumber}>Issue {issue.number}</span>
    </header>
    <p className={styles.issueMeta}>
      <span className={styles.issueDate}>{issue.date}</span>
      {to && <><span aria-hidden="true">&middot;</span><span className={styles.recipient}>For <span className={styles.recipientEmail}>{to}</span></span></>}
    </p>
    <h3 className={styles.subject}>{issue.subject}</h3>
    <ul className={styles.stories}>
      {issue.stories.slice(0, contentPresentation.newsletter.visibleIssueStories).map(story => <li key={story.title} className={styles.story}>
        <img className={styles.thumb} src={story.image} alt="" />
        <span className={styles.storyTitle}>{story.title}</span>
        <span className={styles.minutes}>{story.minutes} min</span>
      </li>)}
    </ul>
  </>;
}

/** The front issue sits flat; each one behind steps up and shrinks a little so its top edge shows. */
function issuePlacement(depth: number) {
  return { y: -depth * newsletterMotion.issueDepthStepPx, scale: 1 - depth * newsletterMotion.issueDepthScaleLoss };
}

/** Position rides the no-overshoot spring; opacity resolves fast so two issues never read through each other. */
const settle = { ...motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.instant, ease: standard } };

function StackIssue({ issue, depth, layer, name, to, upcoming, initial }: {
  issue: NewsletterIssue; depth: number; layer: number; name: string; to?: string; upcoming: boolean; initial: boolean;
}) {
  const placed = useMemo(() => ({ ...issuePlacement(depth), opacity: 1, transition: settle }), [depth]);
  const away = useMemo(() => ({
    ...(upcoming ? { y: newsletterMotion.upcomingEnterTravelPx, scale: 1 } : issuePlacement(maximumVisibleIssues)),
    opacity: 0,
    transition: settle,
  }), [upcoming]);
  const { controls, present } = useNewsletterPresence(placed, away);
  return <motion.article
    className={styles.issue}
    data-depth={depth}
    aria-hidden={!present || depth > 0 || undefined}
    aria-label={present && depth === 0 ? `${name}, issue ${issue.number}` : undefined}
    inert={!present}
    initial={initial ? away : placed}
    animate={controls}
    style={{ zIndex: layer }}
  >
    <IssueCard issue={issue} name={name} to={to} />
  </motion.article>;
}

/**
 * A stack of recent issues. When someone subscribes, the upcoming issue, addressed to them, lands on the front
 * and the older ones step back; the oldest drops away.
 */
function IssueStack({ publication, delivered, to, reduced, compact }: { publication: NewsletterPublication; delivered: boolean; to: string; reduced: boolean; compact?: boolean }) {
  const issues = (delivered ? [publication.upcoming, ...publication.recent] : publication.recent).slice(0, maximumVisibleIssues);
  const mounted = useRef(false);
  useLayoutEffect(() => { mounted.current = true; }, []);
  return <div className={styles.stack} data-compact={compact ? "" : undefined}>
    {/* An unseen copy of the upcoming issue keeps the stack as tall as the tallest issue it will ever hold. */}
    <div className={`${styles.issue} ${styles.issueSizer}`} aria-hidden="true"><IssueCard issue={publication.upcoming} name={publication.name} to={to || " "} /></div>
    <AnimatePresence initial={false}>
      {issues.map((issue, depth) => {
        const upcoming = issue === publication.upcoming;
        return <StackIssue key={issue.number} issue={issue} depth={depth} layer={issues.length - depth} name={publication.name} to={upcoming ? to : undefined}
          upcoming={upcoming} initial={mounted.current && !reduced} />;
      })}
    </AnimatePresence>
  </div>;
}

const readerHidden = { opacity: 0, width: 0 };
const readerShown = { opacity: 1, width: "auto" };
const readerTransition = { width: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.standard, ease: enter, delay: motionTokens.sequence.settle } };
const readerEnter = { ...readerShown, transition: readerTransition };
const readerExit = { ...readerHidden, transition: readerTransition };

function ReaderSuffix() {
  const reduced = useReducedMotion();
  const { controls, present } = useNewsletterPresence(readerEnter, readerExit);
  return <motion.span className={styles.you} initial={reduced ? readerShown : readerHidden} animate={controls}
    aria-hidden={!present || undefined}>, including you</motion.span>;
}

/** Faces and a reader count that ticks up by one when you join. */
function Readers({ readers, done }: { readers: { count: number; faces: string[] }; done: boolean }) {
  return <div className={styles.readers}>
    <span className={styles.faces} aria-hidden="true">
      {readers.faces.slice(0, contentPresentation.newsletter.visibleReaderFaces).map(src => <img key={src} src={src} alt="" />)}
    </span>
    <span className={styles.readerLine}>
      <span className={styles.count}><AnimatedCounter value={readers.count + (done ? 1 : 0)} /></span>
      {" "}readers
      <AnimatePresence initial={false}>
        {/* The phrase opens its own width on the no-overshoot spring, so the centred line glides instead of jumping sideways. */}
        {done && <ReaderSuffix key="you" />}
      </AnimatePresence>
    </span>
  </div>;
}

/**
 * A newsletter signup framed by the newsletter itself: a stack of recent issues. Subscribing drops the next issue,
 * addressed to the new reader, onto the front of the stack and ticks the reader count up by one.
 * Comes as an inline page section or a self-contained card.
 */
export const NewsletterSignup = forwardRef<HTMLElement, NewsletterSignupProps>(function NewsletterSignup({
  variant = "inline",
  title,
  description,
  placeholder = "you@company.com",
  buttonLabel = "Keep this address",
  privacyNote = newsletterCopy.privacy,
  privacyLink = newsletterCopy.privacyLink,
  readers = newsletterReaders,
  publication = newsletterPublication,
  onSubscribe,
  className,
}, ref) {
  const id = useId();
  const reduced = !!useReducedMotion();
  const [email, setEmail] = useState("");
  const [problem, setProblem] = useState<Problem | null>(null);
  const [tried, setTried] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [sentTo, setSentTo] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const pendingSuccessFocus = useRef(false);
  const again = useRef<HTMLButtonElement>(null);
  const busy = useRef(false);
  const refocus = useRef(false);
  const [pill, animatePill] = useAnimate<HTMLDivElement>();
  useLayoutEffect(() => {
    const group = pill.current;
    if (!group) return;
    const measureCorners = () => {
      const style = getComputedStyle(group);
      if (Number.parseFloat(style.borderRightWidth) === 0) {
        group.style.removeProperty("--rams-detail-newsletter-inner-radius");
        return;
      }
      const radius = Number.parseFloat(style.borderTopRightRadius);
      const horizontal = Math.max(0, radius - Number.parseFloat(style.borderRightWidth) - Number.parseFloat(style.paddingRight));
      const vertical = Math.max(0, radius - Number.parseFloat(style.borderTopWidth) - Number.parseFloat(style.paddingTop));
      group.style.setProperty("--rams-detail-newsletter-inner-radius", `${horizontal}px / ${vertical}px`);
    };
    measureCorners();
    const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measureCorners);
    resize?.observe(group);
    if (!resize) window.addEventListener("resize", measureCorners);
    const rootChanges = typeof MutationObserver === "undefined" ? null : new MutationObserver(measureCorners);
    rootChanges?.observe(document.documentElement, { attributes: true });
    return () => { resize?.disconnect(); rootChanges?.disconnect(); if (!resize) window.removeEventListener("resize", measureCorners); };
  }, [pill, variant]);
  useEffect(() => { if (reduced) for (const controls of pill.animations) controls.complete(); }, [reduced, pill]);
  const copy = newsletterCopy[variant];

  useEffect(() => {
    if (phase === "idle" && refocus.current) { refocus.current = false; input.current?.focus(); }
    if (phase === "done" && pendingSuccessFocus.current) {
      pendingSuccessFocus.current = false;
      if (formRef.current?.contains(document.activeElement)) again.current?.focus();
    }
  }, [phase]);

  function shake() {
    if (reduced || !pill.current) return;
    animatePill(pill.current, { x: [...newsletterMotion.invalidShake] }, { duration: motionTokens.duration.considered, ease: newsletterMotion.invalidShakeEase });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy.current || phase !== "idle") return;
    setTried(true);
    const found = validate(email);
    setProblem(found);
    if (found) { shake(); input.current?.focus(); return; }
    const value = email.trim();
    busy.current = true;
    setPhase("sending");
    try {
      await onSubscribe?.(value);
      pendingSuccessFocus.current = !!formRef.current?.contains(document.activeElement);
      setSentTo(value);
      setPhase("done");
    } catch {
      setPhase("idle");
      setProblem({ kind: "failed", text: MESSAGES.failed });
      shake();
    } finally {
      busy.current = false;
    }
  }

  function reset() {
    setEmail("");
    setProblem(null);
    setTried(false);
    refocus.current = true;
    setPhase("idle");
  }

  const done = phase === "done";
  const sending = phase === "sending";
  const messageId = `${id}-message`;
  const labelKey = done ? "done" : sending ? "sending" : problem?.kind === "failed" ? "retry" : "idle";
  const capturedLabel = "Address captured";
  const resetLabel = "Change email";
  const label = problem?.kind === "failed" ? "Try again" : buttonLabel;

  const doneText = "Address captured.";
  const note = <>{privacyNote}{privacyLink && <> <a className={styles.link} href={privacyLink.href}>{privacyLink.label}</a></>}</>;
  // Reserve the visible confirmation's reset anatomy, including its own text line and margins.
  const measures = [<>{privacyNote}{privacyLink && ` ${privacyLink.label}`}</>, <>{doneText} <span className={styles.textButton}>{resetLabel}</span></>, MESSAGES.empty, MESSAGES.format, MESSAGES.failed];
  const form = <form ref={formRef} className={styles.form} onSubmit={submit} noValidate aria-label={title ?? copy.title}>
    <MotionInputGroup ref={pill} className={styles.pill} data-invalid={problem ? "" : undefined} data-done={done ? "" : undefined}>
      <label htmlFor={`${id}-email`} className={styles.srOnly}>Email address</label>
      <InputGroupInput
        ref={input}
        id={`${id}-email`}
        className={styles.input}
        type="email"
        name="email"
        inputMode="email"
        autoComplete="email"
        enterKeyHint="send"
        autoCapitalize="off"
        spellCheck={false}
        placeholder={placeholder}
        value={email}
        readOnly={phase !== "idle"}
        aria-invalid={problem?.kind === "invalid" ? true : undefined}
        aria-describedby={messageId}
        onBlur={() => { if (email.trim() && !tried && phase === "idle") { setTried(true); setProblem(validate(email)); } }}
        onChange={event => { setEmail(event.target.value); if (tried) setProblem(validate(event.target.value)); else if (problem) setProblem(null); }}
      />
      <Button type={done ? "button" : "submit"} className={styles.submit} data-state={labelKey}
        loading={sending} aria-disabled={sending || done || undefined} aria-label={done ? capturedLabel : undefined} tabIndex={done ? -1 : undefined}>
        {done ? <>
          <span className={styles.successLabelWide} aria-hidden="true">{capturedLabel}</span>
          <span className={styles.successLabelCompact} aria-hidden="true">Captured</span>
        </> : <>{label}<ArrowRight className={styles.submitArrow} size="var(--rams-detail-motion-button-glyph-size)" strokeWidth="var(--rams-detail-motion-button-glyph-stroke)" aria-hidden="true" /></>}
      </Button>
    </MotionInputGroup>
    <div className={styles.message}>
      {/* Every message the line can show sits here unseen, so the line is always as tall as the longest one and nothing below it moves. */}
      {measures.map((text, index) => <p key={index} className={`${styles.note} ${styles.sizer}`} aria-hidden="true">{text}</p>)}
      <Swap id={problem ? `problem-${problem.text}` : done ? "done" : "note"} descriptionId={messageId} className={styles.messageLive} live="polite">
        <p className={styles.note} data-tone={problem ? "error" : done ? "success" : undefined} role={problem ? "alert" : undefined}>
          {problem?.text ?? (done
            ? <>{doneText}<span className={styles.srOnly}> Address: {sentTo}.</span> <button ref={again} type="button" className={styles.textButton} onClick={reset}>{resetLabel}</button></>
            : note)}
        </p>
      </Swap>
    </div>
  </form>;

  const root = [styles.newsletter, className].filter(Boolean).join(" ");

  if (variant === "card") {
    return <section ref={ref} className={root} data-variant="card" aria-labelledby={`${id}-title`}>
      {/* The shell spans the section so a host layout can set its gutter without reaching into the card. */}
      <div className={styles.cardShell}>
      <div className={styles.card}>
        {publication && <div className={styles.tray}>
          <IssueStack publication={publication} delivered={done} to={sentTo} reduced={reduced} compact />
        </div>}
        <div className={styles.cardBody}>
          <h2 id={`${id}-title`} className={styles.cardTitle}>{title ?? copy.title}</h2>
          <p className={styles.description}>{description ?? copy.description}</p>
          {form}
          {readers && <Readers readers={readers} done={done} />}
        </div>
      </div>
      </div>
    </section>;
  }

  return <section ref={ref} className={root} data-variant="inline" data-aside={publication || readers ? "" : undefined} aria-labelledby={`${id}-title`}>
    <div className={styles.inline}>
      <div className={styles.intro}>
        <h2 id={`${id}-title`} className={styles.title}>{title ?? copy.title}</h2>
        <p className={styles.description}>{description ?? copy.description}</p>
        {form}
      </div>
      {(publication || readers) && <div className={styles.aside}>
        {publication && <IssueStack publication={publication} delivered={done} to={sentTo} reduced={reduced} />}
        {readers && <Readers readers={readers} done={done} />}
      </div>}
    </div>
  </section>;
});

NewsletterSignup.displayName = "NewsletterSignup";

const variantOptions = [{ value: "inline", label: "Inline" }, { value: "card", label: "Card" }];

/** Both layouts share the entered address and use the real callback boundary. */
export function NewsletterSignupBlock() {
  const [variant, setVariant] = useState<NewsletterVariant>("inline");
  return <div className={styles.preview}>
    <Select value={variant} onValueChange={next => setVariant(next as NewsletterVariant)}><SelectTrigger aria-label="Newsletter layout"><SelectValue /></SelectTrigger><SelectContent>{variantOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>
    <NewsletterSignup variant={variant} />
  </div>;
}

export default NewsletterSignupBlock;
