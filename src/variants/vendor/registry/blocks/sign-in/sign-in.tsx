"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, animate, motion, useMotionValue } from "motion/react";
import { MotionRegion } from "@/variants/motion-swap";
import { useReducedMotion } from "@/variants/use-motion-preference";
import { motionTransition } from "@/variants/motion-policy";
import { Button } from "@/variants/vendor/registry/components/button/button";
import { Input } from "@/variants/vendor/registry/components/input/input";
import { OtpInput } from "@/variants/vendor/registry/components/otp-input/otp-input";
import { motionTokens } from "@/variants/vendor/lib/motion-tokens";
import styles from "./sign-in.module.css";

type Step = "email" | "code" | "done";
type Provider = "Google" | "Apple" | "GitHub";
export type SignInMethod = "Email code" | "Passkey" | Provider;
/** The local method record carries a generic reader label and entered address. The optional photo field remains in the exported shape; this block emits no photo. */
export interface SignInAccount { name: string; email: string; photo?: string }
export interface SignInProps {
  /** Six digits compared locally; no email is delivered. */
  demoCode?: string;
  /** Receives the entered address and chosen illustrative method, not an authenticated identity. */
  onSignIn?: (account: SignInAccount, method: SignInMethod) => void;
}
const providers: Provider[] = ["Google", "Apple", "GitHub"];
const domainFixes: Record<string, string> = { "gmial.com": "gmail.com", "gamil.com": "gmail.com", "gmai.com": "gmail.com", "gnail.com": "gmail.com", "gmail.co": "gmail.com", "hotmial.com": "hotmail.com", "outlok.com": "outlook.com", "outlook.co": "outlook.com", "iclod.com": "icloud.com", "icoud.com": "icloud.com", "yaho.com": "yahoo.com" };

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
function suggestionFor(value: string) {
  const [local, domain, extra] = value.trim().toLowerCase().split("@");
  return local && domain && extra === undefined && domainFixes[domain] ? `${local}@${domainFixes[domain]}` : "";
}

/** No name or identity is inferred from an address. */
function accountFor(value: string): SignInAccount {
  return { name: "Folio21 reader", email: value.trim().toLowerCase() };
}

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

export function SignIn({ demoCode = "210624", onSignIn }: SignInProps) {
  const reduce = !!useReducedMotion();
  const rootRef = useRef<HTMLElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);
  const focusNext = useRef<Step | null>(null);
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [recordError, setRecordError] = useState("");
  const [account, setAccount] = useState<SignInAccount>({ name: "Folio21 reader", email: "" });
  const [method, setMethod] = useState<SignInMethod>("Email code");
  const [status, setStatus] = useState("");
  const { track, height } = useStepHeight(step, reduce);
  const emailError = (touched || attempted) && !isEmail(email) ? "Enter a full reader address, like reader@folio21.example." : "";
  const suggestion = touched || attempted ? suggestionFor(email) : "";
  const transition = motionTransition("replace", reduce);
  const stepMotion = motionTokens.keyframes.signIn;
  const focusCode = () => codeRef.current?.querySelector("input")?.focus();

  useEffect(() => {
    const cancelOutside = (event: Event) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) focusNext.current = null;
    };
    document.addEventListener("focusin", cancelOutside, true);
    document.addEventListener("pointerdown", cancelOutside, true);
    return () => { document.removeEventListener("focusin", cancelOutside, true); document.removeEventListener("pointerdown", cancelOutside, true); };
  }, []);
  useLayoutEffect(() => {
    if (focusNext.current !== step) return;
    focusNext.current = null;
    if (document.activeElement !== document.body && !rootRef.current?.contains(document.activeElement)) return;
    if (step === "email") emailRef.current?.focus();
    if (step === "code") focusCode();
    if (step === "done") doneRef.current?.focus();
  }, [step]);

  function go(next: Step) { focusNext.current = next; setStep(next); }
  function validEmail() {
    setAttempted(true);
    if (isEmail(email)) return true;
    emailRef.current?.focus();
    return false;
  }
  function record(next: SignInAccount, how: SignInMethod) {
    setRecordError("");
    try {
      onSignIn?.(next, how);
      setAccount(next);
      setMethod(how);
      go("done");
      setStatus("Reader method recorded locally");
    } catch (error) {
      setRecordError(error instanceof Error ? error.message : "The reader method could not be recorded. Try again.");
    }
  }
  function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validEmail()) return;
    setAccount(accountFor(email));
    setRecordError(""); setCode(""); setCodeError(""); go("code");
    setStatus("Local reader-code comparison ready");
  }
  function applySuggestion() { setEmail(suggestion); setStatus(`Reader address changed to ${suggestion}`); emailRef.current?.focus(); }
  function verify(value: string) {
    if (value.length < 6) { setCodeError("Enter all 6 digits from the local example."); focusCode(); return; }
    if (value !== demoCode) {
      setCode(""); setCodeError("Those digits do not match the local reader code. Try again."); setStatus("Reader code did not match"); focusCode(); return;
    }
    record(account, "Email code");
  }
  function changeCode(value: string) { setCode(value); setCodeError(""); if (value.length === 6) verify(value); }
  function restartCode() { setCode(""); setCodeError(""); setRecordError(""); setStatus("Local reader-code entry restarted"); focusCode(); }
  function changeEmail() { setAttempted(false); setRecordError(""); go("email"); setStatus("Edit the reader address"); }
  function recordMethod(how: SignInMethod) { if (validEmail()) record(accountFor(email), how); }
  function reset() { setEmail(account.email); setTouched(false); setAttempted(false); setCode(""); setRecordError(""); go("email"); setStatus("Ready for another reader-method record"); }

  return <section ref={rootRef} className={styles.signIn} aria-label="Folio21 returning print reader">
    <motion.div className={styles.viewport} style={{ height }}><div ref={track} className={styles.track}>
      <AnimatePresence initial={false} mode="popLayout">
        <MotionRegion key={step} className={styles.step} initial={reduce ? false : { opacity: 0, x: stepMotion.stepEnterTravelPx }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: reduce ? 0 : -stepMotion.stepExitTravelPx }} transition={transition}>
          {step === "email" && <>
            <div className={styles.heading}><h2>Return to the reading table</h2><p>Folio21 · Rosario reading table.</p></div>
            <form className={styles.form} onSubmit={submitEmail} noValidate>
              <div className={styles.fieldGroup}>
                <Input ref={emailRef} label="Reader email" type="email" name="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="reader@folio21.example" value={email} error={emailError} onChange={event => setEmail(event.target.value)} onBlur={() => { if (email.trim()) setTouched(true); }} />
                {suggestion && <p className={styles.suggestion}>Use <button type="button" className={styles.textButton} onClick={applySuggestion}>{suggestion}</button>?</p>}
              </div>
              <Button type="submit" className={styles.wide}>Continue</Button>
            </form>
            <div className={styles.divider}>Method records</div>
            <div className={styles.alternatives}>
              <Button type="button" variant="outline" className={styles.wide} onClick={() => recordMethod("Passkey")}>Passkey</Button>
              <div className={styles.sso} role="group" aria-label="Provider method records">{providers.map(provider => <Button key={provider} type="button" variant="outline" className={styles.ssoButton} aria-label={`Choose ${provider}`} onClick={() => recordMethod(provider)}><span className={styles.providerLabel}>{provider}</span></Button>)}</div>
            </div>
          </>}
          {step === "code" && <>
            <div className={styles.heading}><h2>Match the reader code</h2><p>Use the reading-table code below.</p></div>
            <div className={styles.identity}><span className={`${styles.avatarMover} ${styles.avatarSmall}`} aria-hidden="true">F21</span><span className={styles.identityEmail}>{account.email}</span><Button type="button" variant="ghost" size="sm" onClick={changeEmail}>Change</Button></div>
            <form className={styles.form} onSubmit={event => { event.preventDefault(); verify(code); }} noValidate>
              <div ref={codeRef}><OtpInput label="Local reader code" description={`Reading-table code: ${demoCode}`} value={code} onValueChange={changeCode} error={codeError} /></div>
              <Button type="submit" className={styles.wide}>Verify</Button>
            </form>
            <button type="button" className={styles.resend} onClick={restartCode}>Reset code</button>
            <Button type="button" variant="ghost" className={styles.wide} onClick={changeEmail}>Back</Button>
          </>}
          {step === "done" && <>
            <div className={styles.avatarStage} aria-hidden="true"><span className={`${styles.avatarMover} ${styles.avatarLarge}`}>F21</span></div>
            <div className={styles.heading}><h2 ref={doneRef} tabIndex={-1}>Reader method recorded</h2><p className={styles.email}>{account.email}</p></div>
            <dl className={styles.details}><div><dt>Reader label</dt><dd>{account.name}</dd></div><div><dt>Method</dt><dd>{method}</dd></div><div><dt>Scope</dt><dd>Local reading-table record</dd></div></dl>
            <Button type="button" variant="outline" className={styles.wide} onClick={reset}>New visit</Button>
          </>}
          {recordError && <p className={styles.error} role="alert">{recordError}</p>}
        </MotionRegion>
      </AnimatePresence>
    </div></motion.div>
    <footer className={styles.footer}><p className={styles.status} role="status">{status || "Folio21 · Reading table"}</p></footer>
  </section>;
}

export default SignIn;
