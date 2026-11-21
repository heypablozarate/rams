"use client";
import "./motion-fields.css";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, animate, motion, useMotionValue, type Transition, type Variants } from "motion/react";
import { useReducedMotion } from "./use-motion-preference";
import { MotionRegion, MotionSwap } from "./motion-swap";
import { Button } from "./motion-button";
import { Checkbox } from "./motion-checkbox";
import { Input } from "./motion-input";
import { PasswordField } from "./motion-password-field";
import { motionTokens } from "./motion-tokens";
import styles from "./motion-signup-form.module.css";

export interface SignupDetails {
  name: string;
  email: string;
  password: string;
  productUpdates: boolean;
}

type Provider = "Google" | "Apple" | "GitHub";

export interface SignupFormProps {
  /** Receives valid reader details, including the password, and may submit them to your service. Throw to show an error. When absent, details are captured in this form only. */
  onSubmit?: (details: SignupDetails) => void | Promise<void>;
  /** An error from your API, shown above the submit button. */
  serverError?: string | null;
  /** Called when someone picks a single sign-on provider. The caller owns navigation and provider completion. The provider group is omitted when absent. */
  onProvider?: (provider: Provider) => void;
}

type Field = "name" | "email" | "password";
type Step = "form" | "done";
type StepCustom = { direction: number; reduce: boolean };

const providers: Provider[] = ["Google", "Apple", "GitHub"];
/** Neutral route marks identify choices without reproducing provider artwork. */
function ProviderMark({ index }: { index: number }) {
  return <svg className={styles.providerMark} viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true"><rect x="3" y="3" width="10" height="10" rx={index + 1} /><path d="M5 8h6" /></svg>;
}

function getErrors(name: string, email: string, password: string) {
  return {
    name: name.trim().length < 2 ? "Enter a reader name with at least 2 characters." : "",
    email: !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()) ? "Enter a full reader address, like reader@folio21.example." : "",
    password: password.length < 8 ? "Use at least 8 characters." : "",
  };
}

function passwordScore(password: string) {
  if (!password) return 0;
  return [password.length >= 8, password.length >= 12, /[a-z]/.test(password) && /[A-Z]/.test(password), /\d|[^\w\s]/.test(password)].filter(Boolean).length;
}
const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];

/** Steps cross over sideways out of a small blur; going back, they return from the other side. */
const signupMotion = motionTokens.keyframes.signupForm;
const stepMotion: Variants = {
  enter: ({ direction, reduce }: StepCustom) => reduce ? { opacity: 0 } : { opacity: 0, x: direction * signupMotion.stepEnterTravelPx, filter: `blur(${motionTokens.blur.soft}px)` },
  center: ({ reduce }: StepCustom) => ({ opacity: 1, x: 0, filter: "blur(0px)", transition: reduce ? { duration: motionTokens.reduced.duration } : { x: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.standard, ease: motionTokens.ease.enter, delay: motionTokens.stagger.word }, filter: { duration: motionTokens.duration.standard, ease: motionTokens.ease.enter } } }),
  exit: ({ direction, reduce }: StepCustom) => reduce ? { opacity: 0, transition: { duration: motionTokens.reduced.duration } } : { opacity: 0, x: -direction * signupMotion.stepExitTravelPx, filter: `blur(${motionTokens.blur.soft}px)`, transition: { x: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.exit, ease: motionTokens.ease.standard }, filter: { duration: motionTokens.duration.exit } } },
};
const swap = (reduce: boolean) => ({
  initial: reduce ? { opacity: 0 } : { opacity: 0, y: signupMotion.feedbackEnterTravelPx, filter: `blur(${motionTokens.blur.soft}px)` },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: reduce ? { opacity: 0, transition: { duration: motionTokens.reduced.duration } } : { opacity: 0, y: -signupMotion.feedbackExitTravelPx, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast } },
  transition: (reduce ? { duration: motionTokens.reduced.duration } : { duration: motionTokens.duration.standard, ease: motionTokens.ease.enter }) as Transition,
});

/** The card follows its content on a spring only while the step changes; otherwise it stays auto, so field messages open without lag. */
function useStepHeight(step: Step, reduce: boolean) {
  const track = useRef<HTMLDivElement>(null);
  const height = useMotionValue<number | "auto">("auto");
  const measured = useRef(0);
  const gliding = useRef(false);
  const playback = useRef<{ stop: () => void } | null>(null);
  const generation = useRef(0);
  const lastStep = useRef(step);
  const cancelGlide = useCallback(() => {
    generation.current += 1;
    playback.current?.stop();
    playback.current = null;
    gliding.current = false;
  }, []);
  const glide = useCallback((to: number) => {
    cancelGlide();
    const current = generation.current;
    gliding.current = true;
    playback.current = animate(height, to, { ...motionTokens.spring.smooth, onComplete: () => {
      if (current !== generation.current) return;
      playback.current = null;
      gliding.current = false;
      height.jump("auto");
    } });
  }, [height, cancelGlide]);
  useEffect(() => cancelGlide, [cancelGlide]);
  useEffect(() => {
    const node = track.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      measured.current = entry.borderBoxSize?.[0]?.blockSize ?? node.offsetHeight;
      if (gliding.current) glide(measured.current);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [glide]);
  useLayoutEffect(() => {
    if (reduce) {
      cancelGlide();
      height.jump("auto");
      lastStep.current = step;
      return;
    }
    if (lastStep.current === step) return;
    lastStep.current = step;
    const current = height.get();
    const from = typeof current === "number" ? current : measured.current;
    const to = track.current?.offsetHeight ?? 0;
    if (!from || !to) { cancelGlide(); height.jump("auto"); return; }
    if (current === "auto") height.jump(from);
    glide(to);
  }, [step, reduce, height, glide, cancelGlide]);
  return { track, height };
}

export function SignupForm({ onSubmit, serverError, onProvider }: SignupFormProps) {
  const reduce = !!useReducedMotion();
  const feedbackId = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);
  const rootRef = useRef<HTMLElement>(null);
  const focusNext = useRef<"form" | "done" | null>(null);
  const request = useRef(0);
  const mounted = useRef(true);
  const [step, setStep] = useState<Step>("form");
  const [receiptSettled, setReceiptSettled] = useState(false);
  useLayoutEffect(() => {
    if (reduce && step === "done") setReceiptSettled(true);
  }, [reduce, step]);
  const [direction, setDirection] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [productUpdates, setProductUpdates] = useState(false);
  const [touched, setTouched] = useState<Record<Field, boolean>>({ name: false, email: false, password: false });
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState<null | "form">(null);
  const [submittedToCaller, setSubmittedToCaller] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [status, setStatus] = useState("");
  const { track, height } = useStepHeight(step, reduce);
  const errors = getErrors(name, email, password);
  const score = passwordScore(password);
  const visibleError = (field: Field) => (touched[field] || submitted ? errors[field] : "");
  const passwordError = visibleError("password");
  const custom: StepCustom = { direction, reduce };
  const shownError = submitError || serverError || "";
  const feedback = passwordError ? { key: "error", text: passwordError } : password ? { key: `s${score}`, text: `${strengthLabel[Math.max(score, 1)]} password` } : { key: "hint", text: "Use 8 or more characters." };

  useEffect(() => {
    mounted.current = true;
    const cancelFocusOutside = (event: Event) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) focusNext.current = null;
    };
    document.addEventListener("pointerdown", cancelFocusOutside, true);
    document.addEventListener("focusin", cancelFocusOutside, true);
    return () => {
      mounted.current = false;
      request.current += 1;
      document.removeEventListener("pointerdown", cancelFocusOutside, true);
      document.removeEventListener("focusin", cancelFocusOutside, true);
    };
  }, []);
  useLayoutEffect(() => {
    const next = focusNext.current;
    if (next !== step) return;
    focusNext.current = null;
    if (document.activeElement !== document.body && !rootRef.current?.contains(document.activeElement)) return;
    (next === "done" ? doneRef.current : nameRef.current)?.focus();
  }, [step]);

  function markTouched(field: Field) {
    setTouched(current => ({ ...current, [field]: true }));
  }

  function finish() {
    setBusy(null);
    setDirection(1);
    setStep("done");
    setStatus(onSubmit ? "Reader details submitted to the caller" : "Reader details captured in this form");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setSubmitted(true);
    setSubmitError("");
    const nextErrors = getErrors(name, email, password);
    const firstInvalid = (Object.keys(nextErrors) as Field[]).find(field => nextErrors[field]);
    if (firstInvalid) {
      ({ name: nameRef, email: emailRef, password: passwordRef })[firstInvalid].current?.focus();
      return;
    }
    const current = ++request.current;
    focusNext.current = "done";
    setBusy("form");
    setSubmittedToCaller(Boolean(onSubmit));
    setStatus(onSubmit ? "Submitting reader details" : "Capturing reader details");
    try {
      await onSubmit?.({ name: name.trim(), email: email.trim(), password, productUpdates });
      if (!mounted.current || current !== request.current) return;
      finish();
    } catch (error) {
      if (!mounted.current || current !== request.current) return;
      focusNext.current = null;
      setBusy(null);
      setSubmitError(error instanceof Error && error.message ? error.message : "Reader details could not be submitted. Try again.");
      setStatus("Reader details need another attempt");
    }
  }

  function continueWith(provider: Provider) {
    if (busy || !onProvider) return;
    // A void callback can delegate navigation; it cannot prove an identity or completion.
    try { onProvider(provider); setStatus(`${provider} route handed to the caller`); }
    catch (error) { setSubmitError(error instanceof Error ? error.message : "The reader route could not open."); }
  }

  function reset() {
    setReceiptSettled(false);
    setName("");
    setEmail("");
    setPassword("");
    setProductUpdates(false);
    setTouched({ name: false, email: false, password: false });
    setSubmitted(false);
    setSubmitError("");
    setDirection(-1);
    setStep("form");
    setStatus("Start again with new details");
    focusNext.current = "form";
  }


  return (
    <section ref={rootRef} className={styles.block} aria-label="Folio21 reader registration">
      <motion.div className={styles.viewport} style={{ height }}>
        <div ref={track} className={styles.track}>
          <AnimatePresence mode="popLayout" initial={false} custom={custom}>
            {step === "form" ? (
              <MotionRegion key="form" className={styles.step} custom={custom} variants={stepMotion} initial="enter" animate="center" exit="exit" transition={reduce ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : undefined}>
                <div className={styles.heading}><h2>Join the print readers</h2><p>Folio21 · Buenos Aires. Keep reader details with your edition notes.</p></div>
                {onProvider && <><div className={styles.sso} role="group" aria-label="Connected reader routes">
                  {providers.map((provider, index) => <Button key={provider} type="button" variant="outline" className={styles.ssoButton} aria-label={`Continue via ${provider}`} disabled={!!busy} onClick={() => continueWith(provider)}>
                    <ProviderMark index={index} />{provider}
                  </Button>)}
                </div>
                <div className={styles.divider}>Reader details</div></>}
                <form onSubmit={event => void submit(event)} noValidate className={styles.form}>
                  <Input ref={nameRef} label="Reader name" name="name" autoComplete="name" placeholder="Reader initials or name" value={name} onChange={event => setName(event.target.value)} onBlur={() => { if (name) markTouched("name"); }} error={visibleError("name")} readOnly={!!busy} />
                  <Input ref={emailRef} label="Reader email" name="email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="reader@folio21.example" value={email} onChange={event => setEmail(event.target.value)} onBlur={() => { if (email) markTouched("email"); }} error={visibleError("email")} readOnly={!!busy} />
                  <div className={styles.passwordGroup}>
                    <PasswordField ref={passwordRef} label="Password" name="password" autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} onBlur={() => { if (password) markTouched("password"); }} aria-invalid={passwordError ? true : undefined} aria-describedby={feedbackId} readOnly={!!busy} />
                    <div className={styles.feedback}>
                      <span id={feedbackId} className={styles.feedbackText} data-error={passwordError ? true : undefined} role={passwordError ? "alert" : undefined}>
                        <AnimatePresence mode="popLayout" initial={false}><MotionSwap key={feedback.key} {...swap(reduce)}>{feedback.text}</MotionSwap></AnimatePresence>
                      </span>
                      <span className={styles.meter} data-level={score} aria-hidden="true">{[1, 2, 3, 4].map(bar => <span key={bar} data-on={bar <= score || undefined} />)}</span>
                    </div>
                  </div>
                  <div className={styles.updates}><Checkbox label="Include me in edition notes" checked={productUpdates} onCheckedChange={checked => setProductUpdates(checked === true)} disabled={!!busy} /></div>
                  <AnimatePresence initial={false}>
                    {shownError && <MotionRegion key="error" className={styles.row} initial={reduce ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={reduce ? { duration: motionTokens.reduced.duration } : { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast } }}>
                      <p className={styles.submitError} role="alert">{shownError}</p>
                    </MotionRegion>}
                  </AnimatePresence>
                  <Button className={styles.wide} type="submit" loading={busy === "form"}>Save</Button>
                </form>
                <details className={styles.legal}><summary>Reader terms and privacy</summary><p>This local form keeps the supplied details until you start again or leave. Edition notes are optional. A connected caller is responsible for its own storage and terms.</p></details>
              </MotionRegion>
            ) : (
              <MotionRegion key="done" className={styles.step} custom={custom} variants={stepMotion} initial="enter" animate="center" exit="exit" transition={reduce ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : undefined}>
                <svg className={styles.success} viewBox="0 0 48 48" aria-hidden="true">
                  {reduce || receiptSettled ? <>
                    <g transform="rotate(-90 24 24)"><circle cx="24" cy="24" r="22.25" fill="none" stroke="currentColor" strokeWidth="var(--rams-detail-signup-form-receipt-ring-stroke)" pathLength={1} strokeDasharray="1 1" strokeDashoffset={0} /></g>
                    <path d="M15.5 24.5l5.5 5.5 11.5-12" fill="none" stroke="currentColor" strokeWidth="var(--rams-detail-signup-form-receipt-check-stroke)" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={0} />
                  </> : <>
                  <g transform="rotate(-90 24 24)"><motion.circle cx="24" cy="24" r="22.25" fill="none" stroke="currentColor" strokeWidth="var(--rams-detail-signup-form-receipt-ring-stroke)" initial={reduce ? false : { pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={reduce ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : { pathLength: { duration: motionTokens.duration.considered, ease: motionTokens.ease.inOut, delay: motionTokens.sequence.settle }, opacity: { duration: motionTokens.duration.instant, delay: motionTokens.sequence.settle } }} /></g>
                  <motion.path d="M15.5 24.5l5.5 5.5 11.5-12" fill="none" stroke="currentColor" strokeWidth="var(--rams-detail-signup-form-receipt-check-stroke)" strokeLinecap="round" strokeLinejoin="round" initial={reduce ? false : { pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={reduce ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : { pathLength: { duration: motionTokens.duration.standard + motionTokens.sequence.handoff, ease: motionTokens.ease.enter, delay: motionTokens.sequence.settle }, opacity: { duration: motionTokens.duration.instant, delay: motionTokens.sequence.settle } }} />
                  </>}
                </svg>
                <div className={styles.heading}><h2 ref={doneRef} tabIndex={-1}>Reader details {submittedToCaller ? "submitted" : "captured"}</h2><p>{name.trim()} · <span className={styles.address}>{email.trim()}</span></p></div>
                <dl className={styles.details}>
                  <div><dt>Destination</dt><dd>{submittedToCaller ? "Caller callback" : "This form"}</dd></div>
                  <div><dt>Edition notes</dt><dd>{productUpdates ? "On" : "Off"}</dd></div>
                </dl>
                <Button type="button" variant="outline" className={styles.wide} onClick={reset}>Start over</Button>
              </MotionRegion>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <footer className={styles.footer}>
        <p className={styles.srOnly} role="status" aria-live="polite">{status}</p>
        <span className={styles.status} aria-hidden="true"><AnimatePresence mode="popLayout" initial={false}><MotionSwap key={status} {...swap(reduce)}>{status}</MotionSwap></AnimatePresence></span>
        <span className={styles.switch}>Folio21 · Reader register</span>
      </footer>
    </section>
  );
}

export default SignupForm;
