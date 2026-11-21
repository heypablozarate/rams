"use client";
import "./motion-fields.css";

import { forwardRef, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { AnimatePresence, motion, useAnimationControls, usePresence, useInView } from "motion/react";
import { useReducedMotion } from "./use-motion-preference";
import { ArrowUpRight, Check } from "lucide-react";
import { Button } from "./motion-button";
import { Select } from "./motion-select";
import { motionTokens } from "./motion-tokens";
import { InputGroup, InputGroupInput } from "./input-group";
import styles from "./motion-site-footer.module.css";

export type SiteFooterVariant = "columns" | "minimal" | "logo";

export interface SiteFooterLink {
  label: string;
  href?: string;
  /** Opens in a new tab and shows an outward arrow. */
  external?: boolean;
}

export interface SiteFooterColumn {
  title: string;
  links: SiteFooterLink[];
}

export interface SiteFooterNewsletter {
  title?: string;
  description?: string;
  placeholder?: string;
  /** Called with a valid address. Throw or reject to show an error; resolve to show the captured state. */
  onSubscribe?: (email: string) => void | Promise<void>;
}

export interface SiteFooterProps {
  /** `columns` pairs a newsletter with link columns, `minimal` is one quiet row, and `logo` ends with a large fading brand name. */
  variant?: SiteFooterVariant;
  brand?: { name: string; href?: string; mark?: ReactNode };
  /** One short line under the brand. */
  tagline?: string;
  columns?: SiteFooterColumn[];
  /** Links for the minimal variant. Defaults to the first link of each column. */
  links?: SiteFooterLink[];
  /** Small links beside the copyright, such as Privacy and Terms. */
  legal?: SiteFooterLink[];
  socials?: SiteFooterLink[];
  /** Newsletter signup. Pass null to hide it. */
  newsletter?: SiteFooterNewsletter | null;
  /** A system status link. Pass null to hide it. */
  status?: { label: string; tone?: "success" | "warning" | "danger"; href?: string } | null;
  /** Year in the copyright line. */
  year?: number;
  /** Called for every link that is pressed. Links without an href render as buttons and only call this. */
  onNavigate?: (link: SiteFooterLink) => void;
  className?: string;
}

type Bezier = [number, number, number, number];
const enter = [...motionTokens.ease.enter] as Bezier;

export const siteFooterExampleColumns: SiteFooterColumn[] = [
  { title: "Edition", links: [{ label: "Sheet plan" }, { label: "Paper notes" }, { label: "Cover rule" }] },
  { title: "Archive", links: [{ label: "Issue index" }, { label: "Colophon" }, { label: "Trim checklist" }] },
];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function FooterLink({ link, onNavigate, className, children }: { link: SiteFooterLink; onNavigate?: (link: SiteFooterLink) => void; className?: string; children?: ReactNode }) {
  const content = <>{children ?? link.label}{link.external && <ArrowUpRight className={styles.external} aria-hidden="true" />}</>;
  const onClick = () => onNavigate?.(link);
  if (link.href) return <a className={className ?? styles.link} href={link.href} onClick={onClick} {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{content}</a>;
  if (onNavigate) return <button type="button" className={className ?? styles.link} onClick={onClick}>{content}</button>;
  return <span className={className ?? styles.link}>{content}</span>;
}

type FooterMessageProps = { message: string; tone: "success" | "error" | "hint" };
const FooterMessage = forwardRef<HTMLParagraphElement, FooterMessageProps>(function FooterMessage({ message, tone }, ref) {
  const reduced = !!useReducedMotion();
  const [present, safeToRemove] = usePresence();
  const controls = useAnimationControls();
  useLayoutEffect(() => {
    let current = true;
    controls.stop();
    if (reduced) controls.set({ opacity: present ? 1 : 0, y: 0, filter: "blur(0px)" });
    else if (present) void controls.start({ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.standard, ease: enter } });
    else void controls.start({ opacity: 0, y: -motionTokens.keyframes.siteFooter.feedbackTravelPx, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.instant } }).then(() => { if (current) safeToRemove?.(); });
    return () => { current = false; controls.stop(); };
  }, [controls, present, reduced, safeToRemove]);
  useEffect(() => { if (!present && reduced) safeToRemove?.(); }, [present, reduced, safeToRemove]);
  return <motion.p ref={ref} className={styles.message} data-tone={tone} data-presence={present ? "present" : "retiring"}
    role={tone === "error" && present ? "alert" : undefined} aria-hidden={!present || undefined}
    initial={reduced ? false : { opacity: 0, y: motionTokens.keyframes.siteFooter.feedbackTravelPx, filter: `blur(${motionTokens.blur.subtle}px)` }} animate={controls}>{message}</motion.p>;
});

/** Email signup that validates in place, keeps its width while the button morphs, and confirms without a toast. */
function Newsletter({ title, description, placeholder = "reader@folio21.example", onSubscribe }: SiteFooterNewsletter) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = (value: string) => !value.trim() ? "Enter your email address" : EMAIL.test(value.trim()) ? null : "That email doesn't look right";

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (state !== "idle") return;
    setTouched(true);
    const problem = validate(email);
    setError(problem);
    if (problem) { inputRef.current?.focus(); return; }
    setState("loading");
    try {
      await onSubscribe?.(email.trim());
      setState("done");
    } catch {
      setState("idle");
      setError("We couldn't process that address. You can try again.");
    }
  }

  const message = state === "done" ? `Address captured: ${email.trim()}` : error ?? description;
  const tone = state === "done" ? "success" : error ? "error" : "hint";

  return <form className={styles.newsletter} onSubmit={submit} noValidate aria-labelledby={title ? `${id}-title` : undefined}>
    {title && <h2 id={`${id}-title`} className={styles.newsletterTitle}>{title}</h2>}
    <InputGroup className={styles.newsletterRow} data-invalid={error ? "" : undefined} data-done={state === "done" ? "" : undefined}>
      <label className={styles.srOnly} htmlFor={`${id}-email`}>Email address</label>
      <InputGroupInput
        ref={inputRef}
        id={`${id}-email`}
        className={styles.newsletterInput}
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder={placeholder}
        value={email}
        readOnly={state !== "idle"}
        aria-invalid={error ? true : undefined}
        aria-describedby={`${id}-message`}
        onChange={event => { setEmail(event.target.value); if (touched) setError(validate(event.target.value)); }}
        onBlur={() => { if (email) { setTouched(true); setError(validate(email)); } }}
      />
      <Button type="submit" size="sm" variant="default" loading={state === "loading"} aria-disabled={state !== "idle" || undefined} className={styles.newsletterButton}>
        {state === "done" ? <span className={styles.capturedLabel}><Check aria-hidden="true" /><span>Captured</span></span> : state === "loading" ? "Saving" : "Save email"}
      </Button>
    </InputGroup>
    <div className={styles.messageSlot} id={`${id}-message`} aria-live="polite">
      <AnimatePresence initial={false} mode="popLayout">
        {message && <FooterMessage key={message} message={message} tone={tone} />}
      </AnimatePresence>
    </div>
  </form>;
}

function FooterWordmark({ name }: { name: string }) {
  const reduced = !!useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { once: true, amount: motionTokens.keyframes.siteFooter.wordmarkRevealFraction });
  const controls = useAnimationControls();
  useLayoutEffect(() => {
    controls.stop();
    if (reduced) controls.set({ opacity: 1, y: 0 });
    else if (visible) void controls.start({ opacity: 1, y: 0, transition: { duration: motionTokens.roleDuration.displayReveal, ease: enter } });
    return () => controls.stop();
  }, [controls, reduced, visible]);
  return <motion.div ref={ref} className={styles.markStage} aria-hidden="true"
    initial={reduced ? false : { opacity: 0, y: motionTokens.keyframes.siteFooter.wordmarkEnterPx }} animate={controls}>
    <div className={`${styles.bigMark} ${styles.bigWordmark}`}>{name}</div>
  </motion.div>;
}

/**
 * A website footer in three layouts: link columns with a newsletter signup, a single quiet row, and a closing
 * variant where the supplied brand name rises in, oversized and cropped by the bottom edge, fading into the page.
 */
export const SiteFooter = forwardRef<HTMLElement, SiteFooterProps>(function SiteFooter({
  variant = "columns",
  brand = { name: "Folio21" },
  tagline = "A Buenos Aires booklet, printed in 140 sample copies.",
  columns = siteFooterExampleColumns,
  links,
  legal = [{ label: "Colophon" }],
  socials = [],
  newsletter = { title: "Edition notes", description: "Keep this address with the Folio21 print notes." },
  status = null,
  year = new Date().getFullYear(),
  onNavigate,
  className,
}, ref) {
  const reduced = !!useReducedMotion();
  const brandNode = <FooterLink link={{ label: brand.name, href: brand.href }} onNavigate={onNavigate} className={styles.brand}>{brand.name}</FooterLink>;
  const brandWithMark = <span className={styles.brandRow}>{brand.mark}{brandNode}</span>;
  const statusNode = status && (status.href
    ? <a className={styles.status} href={status.href} data-tone={status.tone ?? "success"} onClick={() => onNavigate?.({ label: status.label, href: status.href })}><span className={styles.statusDot} aria-hidden="true" />{status.label}</a>
    : onNavigate ? <button type="button" className={styles.status} data-tone={status.tone ?? "success"} onClick={() => onNavigate({ label: status.label })}><span className={styles.statusDot} aria-hidden="true" />{status.label}</button> : <span className={styles.status} data-tone={status.tone ?? "success"}><span className={styles.statusDot} aria-hidden="true" />{status.label}</span>);
  const socialNode = socials.length > 0 && <ul className={styles.inline} aria-label="Social">{socials.map(link => <li key={link.label}><FooterLink link={link} onNavigate={onNavigate} /></li>)}</ul>;
  const legalRow = <div className={styles.bottom}>
    <div className={styles.bottomStart}>
      <span className={styles.copyright}>© {year} {brand.name}</span>
      {legal.length > 0 && <ul className={styles.inline} aria-label="Legal">{legal.map(link => <li key={link.label}><FooterLink link={link} onNavigate={onNavigate} /></li>)}</ul>}
    </div>
    <div className={styles.bottomEnd}>{statusNode}{socialNode}</div>
  </div>;
  const columnNav = <nav className={styles.columns} aria-label="Footer">
    {columns.map(column => <div key={column.title} className={styles.column}>
      <h2>{column.title}</h2>
      <ul>{column.links.map(link => <li key={link.label}><FooterLink link={link} onNavigate={onNavigate} /></li>)}</ul>
    </div>)}
  </nav>;

  if (variant === "minimal") {
    const rowLinks = links ?? columns.map(column => column.links[0]).filter((link): link is SiteFooterLink => Boolean(link)).concat(legal.slice(0, 2));
    return <footer ref={ref} className={["rams-site-footer-block", styles.footer, styles.minimal, className].filter(Boolean).join(" ")}>
      <div className={styles.minimalRow}>
        {brandWithMark}
        <nav aria-label="Footer"><ul className={styles.inline}>{rowLinks.map(link => <li key={link.label}><FooterLink link={link} onNavigate={onNavigate} /></li>)}</ul></nav>
      </div>
      <div className={styles.minimalRow}>
        <span className={styles.copyright}>© {year} {brand.name}. {tagline}</span>
        <div className={styles.bottomEnd}>{statusNode}{socialNode}</div>
      </div>
    </footer>;
  }

  return <footer ref={ref} className={["rams-site-footer-block", styles.footer, variant === "logo" ? styles.logo : "", className].filter(Boolean).join(" ")}>
    <div className={styles.top}>
      <div className={styles.intro}>
        {brandWithMark}
        {tagline && <p className={styles.tagline}>{tagline}</p>}
        {newsletter && variant === "columns" && <Newsletter {...newsletter} />}
      </div>
      {columnNav}
    </div>
    {legalRow}
    {variant === "logo" && <FooterWordmark name={brand.name} />}
  </footer>;
});

SiteFooter.displayName = "SiteFooter";

const variantOptions = [{ value: "columns", label: "Columns" }, { value: "minimal", label: "Minimal" }, { value: "logo", label: "Logo" }];
const referenceNotes: Record<string, string> = {
  "Sheet plan": "24 pages: three eight-page signatures.",
  "Paper notes": "100 gsm text stock with a 220 gsm cover.",
  "Cover rule": "Keep the cover rule 5 mm inside trim.",
  "Issue index": "Folio21 · Buenos Aires · sample edition.",
  Colophon: "140 sample copies; 24 pages in three signatures.",
  "Trim checklist": "Check the 5 mm cover inset before trimming.",
};

/** Preview: the footer with a switch between its three layouts and a note of the last link pressed. */
export function SiteFooterBlock({ variant: initial = "columns" }: { variant?: SiteFooterVariant }) {
  const [variant, setVariant] = useState<SiteFooterVariant>(initial);
  const [reference, setReference] = useState<string | null>(null);
  const reduced = !!useReducedMotion();
  const frameControls = useAnimationControls();
  const contentControls = useAnimationControls();
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | null>(null);
  // The frame springs between layout heights instead of snapping; the new layout fades in where it sits.
  useLayoutEffect(() => {
    const node = contentRef.current;
    if (!node) return;
    setHeight(node.offsetHeight);
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => setHeight(node.offsetHeight));
    observer.observe(node);
    return () => observer.disconnect();
  }, [variant]);
  useLayoutEffect(() => {
    frameControls.stop();
    if (reduced) frameControls.set({ height: "auto" });
    else void frameControls.start({ height: height ?? "auto", transition: motionTokens.spring.smooth });
    return () => frameControls.stop();
  }, [frameControls, height, reduced]);
  useLayoutEffect(() => {
    contentControls.stop();
    if (reduced) contentControls.set({ opacity: 1 });
    else void contentControls.start({ opacity: 1, transition: { duration: motionTokens.duration.standard, ease: enter } });
    return () => contentControls.stop();
  }, [contentControls, reduced, variant]);
  return <div className={["rams-site-footer-block", styles.preview].join(" ")}>
    <Select label="Footer layout" options={variantOptions} value={variant} onValueChange={value => setVariant(value as SiteFooterVariant)} />
    <div className={styles.frame}>
      <motion.div className={styles.frameBody} initial={false} animate={frameControls}>
        <motion.div ref={contentRef} key={variant} initial={reduced ? false : { opacity: 0 }} animate={contentControls}>
          <SiteFooter variant={variant} onNavigate={link => setReference(referenceNotes[link.label] ?? null)} />
        </motion.div>
      </motion.div>
    </div>
    {reference && <p className={styles.previewNote} aria-live="polite">{reference}</p>}
  </div>;
}

export default SiteFooterBlock;
