"use client";

import { contentPresentation } from "@/primitives/content-presentation";
import { forwardRef, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent, ReactNode } from "react";
import { AnimatePresence, LayoutGroup, motion, useAnimate, useIsPresent } from "motion/react";
import { motionTransition } from "@/variants/motion-policy";
import { useReducedMotion } from "@/variants/use-motion-preference";
import type { Variants } from "motion/react";
import { Clock, Mail, MessageCircle, Users } from "rams-icons";
import { Button } from "@/variants/vendor/registry/components/button/button";
import { CopyButton } from "@/variants/vendor/registry/components/copy-button/copy-button";
import { Input } from "@/variants/vendor/registry/components/input/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/primitives/select";
import { Textarea } from "@/variants/vendor/registry/components/textarea/textarea";
import { motionTokens } from "@/variants/vendor/lib/motion-tokens";
import styles from "./contact-section.module.css";

export type ContactSectionVariant = "form" | "channels" | "offices";

export interface ContactMessage {
  name: string;
  email: string;
  topic: string;
  message: string;
}

export interface ContactChannel {
  value: string;
  label: string;
  /** One line under the label in the list, such as a response time. */
  meta: string;
  icon?: ReactNode;
  /** The detail shown when the channel is selected. */
  detail: ReactNode;
}

export interface ContactOffice {
  city: string;
  /** IANA time zone, used for the live local time and open status. */
  timeZone: string;
  address: string[];
  email?: string;
  /** Opening hours in local 24 hour time. Defaults to 9 to 18. */
  hours?: [number, number];
}

export interface ContactSectionProps {
  /** `form` validates and morphs into a confirmation, `channels` lists ways to reach you, `offices` shows live local times. */
  variant?: ContactSectionVariant;
  title?: string;
  description?: string;
  /** Topics offered in the form. */
  topics?: string[];
  /** Called with a valid message. Reject to keep the form and show an error; resolve to show the confirmation. */
  onSubmit?: (message: ContactMessage) => void | Promise<void>;
  channels?: ContactChannel[];
  /** Selected channel (controlled). */
  channel?: string;
  defaultChannel?: string;
  onChannelChange?: (value: string) => void;
  offices?: ContactOffice[];
  className?: string;
}

type Bezier = [number, number, number, number];
const enter = [...motionTokens.ease.enter] as Bezier;
const standard = [...motionTokens.ease.standard] as Bezier;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_MESSAGE = 500;

/** Faces slide along one axis in the direction of travel and settle out of a soft blur. */
const faceVariants: Variants = {
  hidden: ({ direction, axis }: { direction: -1 | 1; axis: "x" | "y" }) => ({ opacity: 0, x: axis === "x" ? direction * motionTokens.keyframes.contactSection.faceEnterTravelPx : 0, y: axis === "y" ? direction * motionTokens.keyframes.contactSection.faceEnterTravelPx : 0, filter: `blur(${motionTokens.blur.soft}px)` }),
  shown: { opacity: 1, x: 0, y: 0, filter: "blur(0px)", transition: { x: motionTokens.spring.smooth, y: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.standard, ease: enter, delay: motionTokens.stagger.word }, filter: { duration: motionTokens.duration.standard, ease: enter, delay: motionTokens.stagger.word } } },
  gone: ({ direction, axis }: { direction: -1 | 1; axis: "x" | "y" }) => ({ opacity: 0, x: axis === "x" ? -direction * motionTokens.keyframes.contactSection.faceExitTravelPx : 0, y: axis === "y" ? -direction * motionTokens.keyframes.contactSection.faceExitTravelPx : 0, filter: `blur(${motionTokens.blur.soft}px)`, transition: { duration: motionTokens.duration.fast, ease: standard } }),
};
const fadeVariants: Variants = { hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: motionTokens.duration.fast } }, gone: { opacity: 0, transition: { duration: motionTokens.duration.instant } } };

function Face({ faceKey, children, custom, reduced, className }: { faceKey: string; children: ReactNode; custom: { direction: -1 | 1; axis: "x" | "y" }; reduced: boolean; className?: string }) {
  const present = useIsPresent();
  return <motion.div className={className} data-face="" data-face-key={faceKey} data-leaving={present ? undefined : ""} inert={!present} custom={custom} variants={reduced ? ({ hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: motionTokens.reduced.duration } }, gone: { opacity: 0, transition: { duration: motionTokens.reduced.duration } } }) : faceVariants} initial="hidden" animate="shown" exit="gone" transition={reduced ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : undefined}>{children}</motion.div>;
}

/**
 * One surface that springs from the height of its old content to the new one when `faceKey` changes, while the faces
 * crossfade along an axis. Between switches the height is automatic, so fields that grow inside it never get clipped.
 */
function MorphPanel({ faceKey, direction = 1, axis = "y", reduced, className, children, ...rest }: { faceKey: string; direction?: -1 | 1; axis?: "x" | "y"; reduced: boolean; className?: string; children: ReactNode; id?: string; role?: string; "aria-labelledby"?: string }) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const lastKey = useRef(faceKey);
  const lastHeight = useRef(0);
  useEffect(() => {
    const node = scope.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    lastHeight.current = node.offsetHeight;
    const observer = new ResizeObserver(() => { lastHeight.current = node.offsetHeight; });
    observer.observe(node);
    return () => observer.disconnect();
  }, [scope]);
  useLayoutEffect(() => {
    if (lastKey.current === faceKey) return;
    lastKey.current = faceKey;
    const node = scope.current;
    const face = node?.querySelector<HTMLElement>(":scope > [data-face]:not([data-leaving])");
    if (!node || !face || reduced) return;
    const from = lastHeight.current || node.offsetHeight;
    const to = face.offsetHeight;
    if (Math.abs(from - to) < 1) return;
    node.style.setProperty("height", `${from}px`);
    const controls = animate(node, { height: [from, to] }, motionTokens.spring.smooth);
    controls.then(() => node.style.removeProperty("height"));
    return () => { controls.stop(); node.style.removeProperty("height"); };
  }, [faceKey, animate, scope, reduced]);
  return <div ref={scope} className={[styles.morph, className].filter(Boolean).join(" ")} {...rest}>
    <AnimatePresence initial={false} mode="popLayout" custom={{ direction, axis }}>
      <Face key={faceKey} faceKey={faceKey} custom={{ direction, axis }} reduced={reduced} className={styles.face}>{children}</Face>
    </AnimatePresence>
  </div>;
}

/** One named topic value, with the same Select used by the section's layout control. */
function TopicPicker({ topics, value, onChange }: { topics: string[]; value: string; onChange: (topic: string) => void }) {
  const id = useId();
  return <div className={styles.topicField}>
    <label htmlFor={id} className={styles.fieldLabel}>Topic</label>
    <Select value={value} onValueChange={onChange} disabled={topics.length === 0}>
      <SelectTrigger id={id}><SelectValue placeholder="No topics available" /></SelectTrigger>
      <SelectContent>{topics.map(topic => <SelectItem key={topic} value={topic}>{topic}</SelectItem>)}</SelectContent>
    </Select>
  </div>;
}

type Errors = Partial<Record<"name" | "email" | "message", string>>;
function validate(values: { name: string; email: string; message: string }): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = "Enter your name";
  if (!values.email.trim()) errors.email = "Enter your email address";
  else if (!EMAIL.test(values.email.trim())) errors.email = "Enter an email like name@example.com";
  if (values.message.trim().length < 20) errors.message = values.message.trim() ? "Add a little more detail, at least 20 characters" : "Tell us how we can help";
  return errors;
}

function ContactForm({ topics, onSubmit, reduced }: { topics: string[]; onSubmit?: ContactSectionProps["onSubmit"]; reduced: boolean }) {
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [topic, setTopic] = useState(topics[0] ?? "");
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [phase, setPhase] = useState<"editing" | "sending" | "sent">("editing");
  const [failure, setFailure] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<ContactMessage | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const pendingSuccessFocus = useRef(false);
  const nameRef = useRef<HTMLInputElement>(null), emailRef = useRef<HTMLInputElement>(null), messageRef = useRef<HTMLTextAreaElement>(null);
  const restoreFocus = useRef(false);
  const successRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (phase === "sent" && pendingSuccessFocus.current) {
      pendingSuccessFocus.current = false;
      if (document.activeElement === document.body || formRef.current?.contains(document.activeElement)) successRef.current?.focus();
    }
    if (phase === "editing" && restoreFocus.current) { restoreFocus.current = false; nameRef.current?.focus(); }
  }, [phase]);

  const update = (field: keyof typeof values) => (event: { target: { value: string } }) => {
    const next = { ...values, [field]: event.target.value };
    setValues(next);
    if (submitted) setErrors(validate(next));
  };

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (phase !== "editing") return;
    setSubmitted(true);
    setFailure(null);
    const found = validate(values);
    setErrors(found);
    if (found.name) { nameRef.current?.focus(); return; }
    if (found.email) { emailRef.current?.focus(); return; }
    if (found.message) { messageRef.current?.focus(); return; }
    setPhase("sending");
    const payload = { name: values.name.trim(), email: values.email.trim(), topic, message: values.message.trim() };
    try {
      await onSubmit?.(payload);
      pendingSuccessFocus.current = !!formRef.current?.contains(document.activeElement);
      setReceipt(payload);
      setPhase("sent");
    } catch {
      setPhase("editing");
      setFailure("The note could not be processed. Your entries are kept; try again.");
    }
  }

  function reset() {
    setValues({ name: "", email: "", message: "" });
    setErrors({});
    setSubmitted(false);
    setFailure(null);
    restoreFocus.current = true;
    setPhase("editing");
  }

  const left = MAX_MESSAGE - values.message.length;
  return <MorphPanel faceKey={phase === "sent" ? "sent" : "form"} direction={phase === "sent" ? 1 : -1} reduced={reduced} className={[styles.formCard, phase === "sent" && styles.capturedCard].filter(Boolean).join(" ")}>
    {phase === "sent"
      ? <div className={styles.success} aria-live="polite">
          <span className={styles.successMark} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="var(--rams-detail-contact-section-success-glyph-stroke)" strokeLinecap="round" strokeLinejoin="round">
              <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={reduced ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: reduced ? motionTokens.reduced.duration : motionTokens.duration.considered, ease: enter, delay: motionTokens.sequence.settle }} />
            </svg>
          </span>
          <h3 ref={successRef} tabIndex={-1} className={styles.successTitle}>Note captured</h3>
          <p className={styles.successText}>{receipt?.topic} · {receipt?.email}</p>
          <p className={styles.successText}>{receipt?.message}</p>
          <Button variant="outline" onClick={reset}>Write another note</Button>
        </div>
      : <form ref={formRef} className={styles.formBody} onSubmit={submit} noValidate aria-label="Contact form">
          <div className={styles.row}>
            <Input ref={nameRef} label="Name" name="name" autoComplete="name" placeholder="Your name" value={values.name} onChange={update("name")} error={errors.name} readOnly={phase === "sending"} />
            <Input ref={emailRef} label="Email address" name="email" type="email" inputMode="email" autoComplete="email" placeholder="reader@folio21.example" value={values.email} onChange={update("email")} error={errors.email} readOnly={phase === "sending"} />
          </div>
          <TopicPicker topics={topics} value={topic} onChange={setTopic} />
          <Textarea ref={messageRef} label="Message" name="message" rows={contentPresentation.contact.messageRows} maxLength={MAX_MESSAGE} placeholder="Which fold, stock, or proof needs a second look?" value={values.message} onChange={update("message")} error={errors.message} description={`${left} characters left`} readOnly={phase === "sending"} />
          <AnimatePresence initial={false}>
            {failure && <motion.p key="failure" role="alert" className={styles.failure} initial={reduced ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={reduced ? { duration: motionTokens.reduced.duration } : { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast, ease: standard } }}>{failure}</motion.p>}
          </AnimatePresence>
          <div className={styles.submitRow}>
            <p className={styles.fine}>Keep a note with this worksheet.</p>
            <Button type="submit" variant="default" loading={phase === "sending"}>Capture note</Button>
          </div>
        </form>}
  </MorphPanel>;
}

const ICON = { size: "var(--rams-detail-contact-section-channel-glyph-size)", strokeWidth: "var(--rams-detail-contact-section-glyph-stroke)", "aria-hidden": true } as const;

/** Original reference desks: no chat, phone, or remote request is fabricated. */
export const contactExampleChannels: ContactChannel[] = [
  { value: "paper", label: "Paper desk", meta: "Stock and grain", icon: <MessageCircle {...ICON} />,
    detail: <><h3>Choose a paper sample</h3><p>Compare the 100 gsm text stock and 220 gsm cover along the grain before folding the dummy.</p><div className={styles.copyRow}><span>F21-PAPER-100-220</span><CopyButton value="F21-PAPER-100-220" label="Copy paper reference" /></div></> },
  { value: "proof", label: "Proof desk", meta: "Ink and registration", icon: <Mail {...ICON} />,
    detail: <><h3>Keep the cover rule in register</h3><p>Check the black text plate and oxide-red cover rule separately. Keep the rule 5 mm inside the trim.</p><div className={styles.copyRow}><span>F21-PROOF-05</span><CopyButton value="F21-PROOF-05" label="Copy proof reference" /></div></> },
  { value: "fold", label: "Fold desk", meta: "Page order and binding", icon: <Users {...ICON} />,
    detail: <><h3>Read the fold before the page</h3><p>A 24-page text block uses three eight-page signatures. Number a blank folded dummy before checking imposition.</p><div className={styles.copyRow}><span>F21-FOLD-3x8</span><CopyButton value="F21-FOLD-3x8" label="Copy fold reference" /></div></> },
];

/** Fictional desks; their clocks use the named cities' actual IANA time zones. */
export const contactExampleOffices: ContactOffice[] = [
  { city: "Buenos Aires", timeZone: "America/Argentina/Buenos_Aires", address: ["Folio 21 · paper desk", "Reference station A"], hours: [9, 18] },
  { city: "Mexico City", timeZone: "America/Mexico_City", address: ["Folio 21 · proof desk", "Reference station B"], hours: [10, 18] },
  { city: "Berlin", timeZone: "Europe/Berlin", address: ["Folio 21 · fold desk", "Reference station C"], hours: [9, 17] },
];

function useNow(intervalMs: number) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const timer = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);
  return now;
}

function officeState(office: ContactOffice, now: Date | null) {
  if (!now) return { time: "--:--", open: null as boolean | null };
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: office.timeZone, hour: "numeric", minute: "2-digit", weekday: "short", hourCycle: "h23" }).formatToParts(now);
  const get = (type: string) => parts.find(part => part.type === type)?.value ?? "";
  const hour = Number(get("hour")), weekday = get("weekday");
  const [start, end] = office.hours ?? [9, 18];
  const time = new Intl.DateTimeFormat("en-US", { timeZone: office.timeZone, hour: "numeric", minute: "2-digit" }).format(now);
  return { time, open: weekday !== "Sat" && weekday !== "Sun" && hour >= start && hour < end };
}

const hourLabel = (hour: number) => `${hour % 12 || 12}${hour < 12 || hour === 24 ? "am" : "pm"}`;

function Offices({ offices }: { offices: ContactOffice[] }) {
  const now = useNow(15000);
  return <ul className={styles.offices}>
    {offices.map(office => {
      const { time, open } = officeState(office, now);
      return <li key={office.city} className={styles.office}>
        <div className={styles.officeHead}>
          <h3>{office.city}</h3>
          <span className={styles.officeTime}><Clock size="var(--rams-detail-contact-section-office-glyph-size)" strokeWidth="var(--rams-detail-contact-section-glyph-stroke)" aria-hidden="true" /><span className={styles.tabular}>{time}</span></span>
        </div>
        <span className={styles.officeStatus} data-open={open === null ? undefined : open ? "" : undefined} data-closed={open === false ? "" : undefined}>
          <span className={styles.statusDot} aria-hidden="true" />{open === null ? "Checking hours" : open ? `Open until ${hourLabel((office.hours ?? [9, 18])[1])}` : "Closed now"}
        </span>
        <address className={styles.address}>{office.address.map(line => <span key={line}>{line}</span>)}</address>
        <div className={styles.officeActions}>
          {office.email && <a className={styles.officeLink} href={`mailto:${office.email}`}>{office.email}</a>}
          <CopyButton value={office.address.join(", ")} label="Copy address" variant="ghost" />
        </div>
      </li>;
    })}
  </ul>;
}

function Channels({ channels, value, onChange, reduced }: { channels: ContactChannel[]; value: string; onChange: (value: string) => void; reduced: boolean }) {
  const id = useId();
  const [direction, setDirection] = useState<-1 | 1>(1);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const active = channels.find(channel => channel.value === value) ?? channels[0];
  const choose = (next: string) => {
    if (!active || next === active.value) return;
    setDirection(channels.findIndex(channel => channel.value === next) < channels.indexOf(active) ? -1 : 1);
    onChange(next);
  };
  function onKeyDown(event: KeyboardEvent) {
    const delta = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 0;
    const edge = event.key === "Home" ? 0 : event.key === "End" ? channels.length - 1 : -1;
    if (!active || (!delta && edge < 0)) return;
    event.preventDefault();
    const next = edge >= 0 ? edge : (channels.indexOf(active) + delta + channels.length) % channels.length;
    choose(channels[next]!.value);
    refs.current[next]?.focus();
  }
  if (!active) return <p>No reference desks available.</p>;
  return <div className={styles.channels}>
    <LayoutGroup id={id}>
      <div className={styles.channelList} role="tablist" aria-orientation="vertical" aria-label="Ways to reach us" onKeyDown={onKeyDown}>
        {channels.map((channel, index) => {
          const selected = channel.value === active.value;
          return <button key={channel.value} ref={node => { refs.current[index] = node; }} type="button" role="tab" id={`${id}-tab-${channel.value}`} aria-selected={selected} aria-controls={`${id}-panel`} tabIndex={selected ? 0 : -1} className={styles.channel} onClick={() => choose(channel.value)}>
            {selected && <motion.span layoutId={reduced ? undefined : "channel"} className={styles.channelHighlight} transition={motionTransition("selection", reduced)} aria-hidden="true" />}
            <span className={styles.channelIcon}>{channel.icon}</span>
            <span className={styles.channelText}><span>{channel.label}</span><span>{channel.meta}</span></span>
          </button>;
        })}
      </div>
    </LayoutGroup>
    <MorphPanel faceKey={active.value} direction={direction} axis="y" reduced={reduced} className={styles.channelPanel} id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${active.value}`}>
      <div className={styles.channelDetail}>{active.detail}</div>
    </MorphPanel>
  </div>;
}

/**
 * A contact section in three layouts: a validated form whose card springs into a confirmation, a list of support
 * channels whose detail panel morphs to each channel, and office cards with live local times and open status.
 */
export const ContactSection = forwardRef<HTMLElement, ContactSectionProps>(function ContactSection({
  variant = "form",
  title,
  description,
  topics = ["Paper stock", "Proof review", "Workshop timing"],
  onSubmit,
  channels = contactExampleChannels,
  channel: channelProp,
  defaultChannel,
  onChannelChange,
  offices = contactExampleOffices,
  className,
}, ref) {
  const id = useId();
  const reduced = !!useReducedMotion();
  const [innerChannel, setInnerChannel] = useState(defaultChannel ?? channels[0]?.value ?? "");
  const activeChannel = channelProp ?? innerChannel;
  const setChannel = (next: string) => { if (channelProp === undefined) setInnerChannel(next); onChannelChange?.(next); };
  const copy = {
    form: { title: "A note for the next proof", description: "Choose a print topic and describe what needs a second look." },
    channels: { title: "Three reference desks", description: "Paper, ink, and fold notes for a small Buenos Aires edition." },
    offices: { title: "Across three time zones", description: "Fictional reference desks with live local clocks and weekday opening hours." },
  }[variant];

  return <section ref={ref} className={[styles.contact, className].filter(Boolean).join(" ")} data-variant={variant} aria-labelledby={`${id}-title`}>
    <div className={styles.inner}>
      <div className={styles.intro}>
        <h2 id={`${id}-title`} className={styles.title}>{title ?? copy.title}</h2>
        <p className={styles.description}>{description ?? copy.description}</p>
      </div>
      <div style={{ display: variant === "form" ? "contents" : "none" }}>
        <ContactForm topics={topics} onSubmit={onSubmit} reduced={reduced} />
      </div>
      {variant === "channels" && <Channels channels={channels} value={activeChannel} onChange={setChannel} reduced={reduced} />}
      {variant === "offices" && <Offices offices={offices} />}
    </div>
  </section>;
});

ContactSection.displayName = "ContactSection";

const variantOptions = [{ value: "form", label: "Form" }, { value: "channels", label: "Channels" }, { value: "offices", label: "Offices" }];

/** Preview: the contact section with a switch between its three layouts. The form captures a local note; callers may provide an asynchronous processor. */
export function ContactSectionBlock({ variant: initial = "form" }: { variant?: ContactSectionVariant }) {
  const [variant, setVariant] = useState<ContactSectionVariant>(initial);
  return <div className={styles.preview}>
    <Select value={variant} onValueChange={next => setVariant(next as ContactSectionVariant)}><SelectTrigger aria-label="Contact layout"><SelectValue /></SelectTrigger><SelectContent>{variantOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>
    <div className={styles.frame}>
      <ContactSection variant={variant} />
    </div>
  </div>;
}

export default ContactSectionBlock;
