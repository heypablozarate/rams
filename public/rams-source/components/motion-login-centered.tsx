"use client";
import "./motion-fields.css";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, animate, motion, useMotionValue } from "motion/react";
import { MotionRegion } from "./motion-swap";
import { useReducedMotion } from "./use-motion-preference";
import { motionTransition } from "./motion-policy";
import { Button } from "./motion-button";
import { Input } from "./motion-input";
import { OtpInput } from "./motion-otp-input";
import { motionTokens } from "./motion-tokens";
import styles from "./motion-login-centered.module.css";

type Step = "passkey" | "email" | "code" | "done";
type Mode = "sign-in" | "sign-up";
type Provider = "Google" | "Apple" | "GitHub";
export type LoginMethod = "Passkey" | "Email code" | Provider;
export interface LoginCenteredProps {
  /** Six digits compared locally, without email delivery. */
  demoCode?: string;
  /** Fill the viewport when this block is the whole page. Content can grow naturally. */
  fullScreen?: boolean;
  /** Explicit illustrative address attached to passkey/provider method records. */
  demoEmail?: string;
  /** Native caller-owned links; local legal disclosures appear when omitted. */
  termsHref?: string;
  privacyHref?: string;
  /** Receives the address, illustrative method and mode; no authentication is performed. */
  onSignIn?: (email: string, method: LoginMethod, mode: Mode) => void;
  className?: string;
}
const providers: Provider[] = ["Google", "Apple", "GitHub"];
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

/** The card follows its content on a spring only while the step changes; otherwise it stays auto, so field messages open without lag. */
function useViewHeight(view: string, reduce: boolean) {
  const track = useRef<HTMLDivElement>(null);
  const height = useMotionValue<number | "auto">("auto");
  const measured = useRef(0);
  const gliding = useRef(false);
  const playback = useRef<{ stop: () => void } | null>(null);
  const generation = useRef(0);
  const lastView = useRef(view);
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
      lastView.current = view;
      return;
    }
    if (lastView.current === view) return;
    lastView.current = view;
    const current = height.get();
    const from = typeof current === "number" ? current : measured.current;
    const to = track.current?.offsetHeight ?? 0;
    if (!from || !to) { cancelGlide(); height.jump("auto"); return; }
    if (current === "auto") height.jump(from);
    glide(to);
  }, [view, reduce, height, glide, cancelGlide]);
  return { track, height };
}

export function LoginCentered({ demoCode = "241140", fullScreen = false, demoEmail = "reader@folio21.example", termsHref, privacyHref, onSignIn, className }: LoginCenteredProps) {
  const reduce = !!useReducedMotion();
  const rootRef = useRef<HTMLElement>(null);
  const focusNext = useRef<Step | null>(null);
  const [step, setStep] = useState<Step>("passkey");
  const [mode, setMode] = useState<Mode>("sign-in");
  const [drafts, setDrafts] = useState<Record<Mode, string>>({ "sign-in": "", "sign-up": "" });
  const email = drafts[mode];
  const [touched, setTouched] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [recordError, setRecordError] = useState("");
  const [account, setAccount] = useState(demoEmail);
  const [method, setMethod] = useState<LoginMethod>("Passkey");
  const [status, setStatus] = useState("");
  const signingUp = mode === "sign-up";
  const view = `${step}-${mode}`;
  const { track, height } = useViewHeight(view, reduce);
  const emailError = (touched || attempted) && !isEmail(email) ? "Enter a full reader address, like reader@folio21.example." : "";
  const transition = motionTransition("replace", reduce);
  const stepMotion = motionTokens.keyframes.loginCentered;
  const focusStep = () => track.current
    ?.querySelector<HTMLElement>('[data-rams-presence="present"] :is([data-login-step-focus], [data-login-code-focus] input)')
    ?.focus();

  useEffect(() => {
    const cancelOutside = (event: Event) => { if (event.target instanceof Node && !rootRef.current?.contains(event.target)) focusNext.current = null; };
    document.addEventListener("pointerdown", cancelOutside, true);
    document.addEventListener("focusin", cancelOutside, true);
    return () => { document.removeEventListener("pointerdown", cancelOutside, true); document.removeEventListener("focusin", cancelOutside, true); };
  }, []);
  useLayoutEffect(() => {
    if (focusNext.current !== step) return;
    focusNext.current = null;
    if (document.activeElement !== document.body && !rootRef.current?.contains(document.activeElement)) return;
    focusStep();
  }, [view, step, track]);

  function go(next: Step) { focusNext.current = next; setRecordError(""); setStep(next); }
  function record(address: string, how: LoginMethod) {
    if (!isEmail(address)) { setRecordError("Supply a full illustrative reader address before recording this method."); return; }
    const next = address.trim().toLowerCase();
    try {
      onSignIn?.(next, how, mode);
      setAccount(next); setMethod(how); go("done"); setStatus("Reader-method record kept locally");
    } catch (error) { setRecordError(error instanceof Error ? error.message : "The reader-method record could not be kept. Try again."); }
  }
  function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setAttempted(true);
    if (!isEmail(email)) { focusStep(); return; }
    setAccount(email.trim().toLowerCase()); setCode(""); setCodeError(""); go("code"); setStatus("Local reader-code comparison ready");
  }
  function verify(value: string) {
    if (value.length < 6) { setCodeError("Enter all six local digits."); focusStep(); return; }
    if (value !== demoCode) { setCode(""); setCodeError("That code does not match the local edition code. Try again."); setStatus("Edition code did not match"); focusStep(); return; }
    record(account, "Email code");
  }
  function changeCode(value: string) { setCode(value); setCodeError(""); if (value.length === 6) verify(value); }
  function restartCode() { setCode(""); setCodeError(""); setRecordError(""); setStatus("Local edition-code entry restarted"); focusStep(); }
  function changeEmail() { setAttempted(false); go("email"); setStatus("Edit the reading-room address"); }
  function backToMethods() {
    setMode("sign-in");
    setAttempted(false); setTouched(false); setCode(""); setCodeError("");
    go("passkey");
    setStatus("Returning-reader record");
  }
  function switchMode() {
    if (signingUp) { backToMethods(); return; }
    setMode("sign-up"); setAttempted(false); setTouched(false); setCode(""); setCodeError(""); go("email");
    setStatus("New-reader record");
  }
  function reset() { setDrafts({ "sign-in": "", "sign-up": "" }); setMode("sign-in"); setTouched(false); setAttempted(false); setCode(""); setCodeError(""); go("passkey"); setStatus("Ready for the next reading-room record"); }

  return <section ref={rootRef} className={[styles.screen, fullScreen ? styles.fullScreen : "", className].filter(Boolean).join(" ")} aria-label="Folio21 reading room">
    <div className={styles.backdrop} aria-hidden="true"><svg className={styles.lines} viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice" fill="none"><path d="M180 120h330l110 110v450H180zM510 120v110h110M210 170h210M210 200h150M220 570h360M220 600h240M130 120h30m-15-15v30M640 680h30m-15-15v30"/><path d="M110 260h60v470h390v-40M630 280h60v360h-40"/></svg></div>
    <header className={styles.bar}><span className={styles.mark}>Folio21 · Córdoba</span><div className={styles.switch}><span>{signingUp ? "Visited before?" : "First visit?"}</span><button type="button" className={styles.switchButton} onClick={switchMode}>{signingUp ? "Return" : "Start"}</button></div></header>
    <div className={styles.stage}><div className={styles.card}>
      <motion.div className={styles.viewport} style={{ height }}><div ref={track} className={styles.track}>
        <AnimatePresence initial={false} mode="popLayout"><MotionRegion key={view} className={styles.step} initial={reduce ? false : { opacity: 0, y: stepMotion.stepEnterTravelPx }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduce ? 0 : -stepMotion.stepExitTravelPx }} transition={transition}>
          {step === "passkey" && <>
            <div className={styles.heading}><h2>The reading room</h2><p>Sample print reader: <span className={styles.address}>{demoEmail}</span>.</p></div>
            <div className={styles.actions}><Button data-login-step-focus type="button" className={styles.wide} onClick={() => record(demoEmail, "Passkey")}>Passkey</Button><Button type="button" variant="outline" className={styles.wide} onClick={changeEmail}>Code</Button></div>
            <div className={styles.divider}>Provider method records</div>
            <div className={styles.sso} role="group" aria-label="Provider method records">{providers.map(provider => <Button key={provider} type="button" variant="outline" className={styles.ssoButton} aria-label={`Choose ${provider}`} onClick={() => record(demoEmail, provider)}><span className={styles.providerLabel}>{provider}</span></Button>)}</div>
          </>}
          {step === "email" && <>
            <div className={styles.heading}><h2>{signingUp ? "New print reader" : "Return with a reader code"}</h2><p>{signingUp ? "Pair an address with a first-visit record for the Córdoba reading room." : "Choose the address to attach to this reading-room visit."}</p></div>
            <form className={styles.form} onSubmit={submitEmail} noValidate><Input data-login-step-focus label="Reader email" name="email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="reader@folio21.example" value={email} error={emailError} onChange={event => { const value = event.target.value; setDrafts(current => ({ ...current, [mode]: value })); }} onBlur={() => { if (email.trim()) setTouched(true); }}/><Button type="submit" className={styles.wide}>Next</Button></form>
            <button type="button" className={styles.textButton} onClick={backToMethods}>Back</button>
          </>}
          {step === "code" && <>
            <div className={styles.heading}><h2>Match the edition code</h2><p>Record for <span className={styles.address}>{account}</span>. <button type="button" className={styles.inlineButton} onClick={changeEmail}>Change</button></p></div>
            <form className={styles.form} onSubmit={event => { event.preventDefault(); verify(code); }} noValidate><div data-login-code-focus><OtpInput label="Local edition code" description={`Reading-room code: ${demoCode}`} value={code} onValueChange={changeCode} error={codeError}/></div><Button type="submit" className={styles.wide}>Verify</Button></form>
            <button type="button" className={styles.textButton} onClick={restartCode}>Restart</button>
          </>}
          {step === "done" && <>
            <svg className={styles.success} viewBox="0 0 48 48" fill="none" stroke="currentColor" aria-hidden="true"><rect x="9" y="5" width="30" height="38"/><path d="M15 15h18M15 22h18M15 29h10"/></svg>
            <div className={styles.heading}><h2 data-login-step-focus tabIndex={-1}>Visit saved</h2><p className={styles.address}>{account}</p></div>
            <dl className={styles.details}><div><dt>Visit</dt><dd>{signingUp ? "New reader" : "Returning reader"}</dd></div><div><dt>Method</dt><dd>{method}</dd></div><div><dt>Scope</dt><dd>Local edition record</dd></div></dl>
            <Button type="button" variant="outline" className={styles.wide} onClick={reset}>New visit</Button>
          </>}
          {recordError && <p className={styles.error} role="alert">{recordError}</p>}
        </MotionRegion></AnimatePresence>
      </div></motion.div>
    </div></div>
    <footer className={styles.foot}><p className={styles.status} role="status">{status || "Folio21 · Print reading room"}</p><nav className={styles.legal} aria-label="Reader legal information">{termsHref ? <a href={termsHref}>Reader terms</a> : <details><summary>Reader terms</summary><p>Local records illustrate a reading-room visit; they grant no edition access.</p></details>}{privacyHref ? <a href={privacyHref}>Reader privacy</a> : <details><summary>Reader privacy</summary><p>This example keeps the address and method in page memory until you leave. A connected caller defines its own storage.</p></details>}</nav></footer>
  </section>;
}

export default LoginCentered;
