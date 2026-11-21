"use client";

import { forwardRef, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { AnimatePresence, LayoutGroup, motion, useIsPresent, useAnimationControls, usePresence } from "motion/react";
import { motionTransition } from "@/variants/motion-policy";
import { useReducedMotion } from "@/variants/use-motion-preference";
import type { Variants } from "motion/react";
import { ArrowRight, Plus } from "rams-icons";
import { SearchField } from "@/variants/vendor/registry/components/search-field/search-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/primitives/select";
import { motionTokens } from "@/variants/vendor/lib/motion-tokens";
import { collectionPresentation } from "@/primitives/collection-presentation";
import styles from "./faq-section.module.css";

export type FaqSectionVariant = "accordion" | "columns" | "search";

export interface FaqItem {
  /** Stable id used for open state. Defaults to the question. */
  id?: string;
  question: string;
  /** Plain text answer; it is also what search matches. */
  answer: string;
  /** Groups questions in the columns variant. */
  category?: string;
}

export interface FaqSectionProps {
  /** `accordion` is one centered list, `columns` groups questions beside a category rail, `search` filters as you type. */
  variant?: FaqSectionVariant;
  title?: string;
  description?: string;
  items?: FaqItem[];
  /** Allow several answers open at once. Defaults to false. */
  multiple?: boolean;
  /** Open item ids (controlled). */
  value?: string[];
  /** Initially open item ids when uncontrolled. */
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /** Active category in the columns variant (controlled). */
  category?: string;
  onCategoryChange?: (category: string) => void;
  /** Search text in the search variant (controlled). */
  query?: string;
  onQueryChange?: (query: string) => void;
  /** A way to reach a person when the answer isn't here. Pass null to hide it. */
  contact?: { label: string; description?: string; href?: string; onClick?: () => void } | null;
  className?: string;
}

type Bezier = [number, number, number, number];
const enter = [...motionTokens.ease.enter] as Bezier;
const standard = [...motionTokens.ease.standard] as Bezier;
const { duration } = motionTokens;

export const faqExampleItems: FaqItem[] = [
  { id: "page-count", question: "How does the 24-page count divide?", answer: "Use three 8-page signatures: 3 × 8 = 24 pages. The imposition sheet should show one complete signature per section.", category: "Imposition" },
  { id: "text-stock", question: "Which stock is listed for the text block?", answer: "The sample specification uses 100 gsm uncoated paper for the text block. The cover stock is listed separately at 220 gsm.", category: "Paper" },
  { id: "cover-plates", question: "Which inks belong on the cover?", answer: "The cover uses a black text plate and an oxide-red rule plate. The sample has two plates in total.", category: "Ink" },
  { id: "trim-margin", question: "Where should the cover rule sit?", answer: "The proof note sets the rule 5 mm inside the trim line. Keep crop marks outside the finished page.", category: "Proof" },
  { id: "copies", question: "How many copies are in this sample run?", answer: "The worksheet is sized for 140 sample copies. This is the edition quantity in the example, not a print order.", category: "Imposition" },
];


const keyOf = (item: FaqItem) => item.id ?? item.question;
const normalize = (text: string) => text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

function normalizedWithSource(text: string) {
  let value = "";
  const starts: number[] = [];
  const ends: number[] = [];
  for (let sourceStart = 0; sourceStart < text.length;) {
    const character = String.fromCodePoint(text.codePointAt(sourceStart)!);
    const normalized = character.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    value += normalized;
    for (let index = 0; index < normalized.length; index++) {
      starts.push(sourceStart);
      ends.push(sourceStart + character.length);
    }
    sourceStart += character.length;
  }
  return { value, starts, ends };
}

/** Wraps each match of `query` in a mark, keeping the original casing. */
function Highlight({ text, query }: { text: string; query: string }) {
  const needle = normalize(query.trim());
  const matches: [number, number][] = [];
  if (needle) {
    const source = normalizedWithSource(text);
    let at = source.value.indexOf(needle);
    while (at >= 0) {
      const start = source.starts[at];
      const end = source.ends[at + needle.length - 1];
      if (start !== undefined && end !== undefined) matches.push([start, end]);
      at = source.value.indexOf(needle, at + needle.length);
    }
  }
  const parts: ReactNode[] = [];
  let from = 0;
  for (const [start, end] of matches) {
    if (start > from) parts.push(text.slice(from, start));
    parts.push(<mark key={start} className={styles.mark}>{text.slice(start, end)}</mark>);
    from = end;
  }
  parts.push(text.slice(from));
  return <>{parts}</>;
}

/** A short window of the answer around the first match, for closed items that match only in their answer. */
function snippet(answer: string, query: string) {
  const source = normalizedWithSource(answer);
  const needle = normalize(query.trim());
  const at = source.value.indexOf(needle);
  if (at < 0 || !needle) return null;
  const sourceAt = source.starts[at];
  const sourceEnd = source.ends[at + needle.length - 1];
  if (sourceAt === undefined || sourceEnd === undefined) return null;
  const start = Math.max(0, answer.lastIndexOf(" ", Math.max(0, sourceAt - collectionPresentation.faqContextBeforeChars)) + 1);
  const end = Math.min(answer.length, sourceEnd + collectionPresentation.faqContextAfterChars);
  return `${start > 0 ? "…" : ""}${answer.slice(start, end).trim()}${end < answer.length ? "…" : ""}`;
}

const panelVariants: Variants = {
  open: { height: "auto", opacity: 1, transition: { height: motionTokens.spring.smooth, opacity: { duration: duration.fast, ease: enter } } },
  closed: { height: 0, opacity: 0, transition: { height: motionTokens.spring.smooth, opacity: { duration: duration.instant, ease: standard } } },
};
const contentVariants: Variants = {
  open: { y: 0, filter: "blur(0px)", transition: { y: motionTokens.spring.smooth, filter: { duration: duration.fast, ease: enter } } },
  closed: { y: -motionTokens.keyframes.faqSection.answerExitPx, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: duration.instant, ease: standard } },
};
const reducedPanel: Variants = { open: { height: "auto", opacity: 1, transition: { duration: motionTokens.reduced.duration } }, closed: { height: 0, opacity: 0, transition: { duration: motionTokens.reduced.duration } } };

/** Arrow keys, Home, and End move between the questions of one list. */
function onListKeyDown(event: KeyboardEvent<HTMLElement>) {
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
  const triggers = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("[data-faq-trigger]")).filter(trigger => !trigger.closest("[inert]"));
  const index = triggers.indexOf(document.activeElement as HTMLElement);
  if (index < 0) return;
  event.preventDefault();
  const next = event.key === "Home" ? 0 : event.key === "End" ? triggers.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + triggers.length) % triggers.length;
  triggers[next]!.focus();
}

function AnswerBody({ children }: { children: ReactNode }) {
  const reduced = !!useReducedMotion();
  const present = useIsPresent();
  const controls = useAnimationControls();
  useLayoutEffect(() => {
    controls.stop();
    if (reduced) controls.set({ y: 0, filter: "blur(0px)" });
    else void controls.start(present ? "open" : "closed");
    return () => controls.stop();
  }, [controls, present, reduced]);
  return <motion.p className={styles.answer} variants={contentVariants} initial={reduced ? false : "closed"} animate={controls}>{children}</motion.p>;
}

function AnswerPanel({ id, labelledBy, children }: { id: string; labelledBy: string; children: ReactNode }) {
  const reduced = !!useReducedMotion();
  const [present, safeToRemove] = usePresence();
  const controls = useAnimationControls();
  useLayoutEffect(() => {
    let current = true;
    controls.stop();
    if (reduced) controls.set({ height: present ? "auto" : 0, opacity: present ? 1 : 0 });
    else if (present) void controls.start("open");
    else void controls.start("closed").then(() => { if (current) safeToRemove?.(); });
    return () => { current = false; controls.stop(); };
  }, [controls, present, reduced, safeToRemove]);
  useEffect(() => { if (!present && reduced) safeToRemove?.(); }, [present, reduced, safeToRemove]);
  return <motion.div id={id} role="region" aria-labelledby={labelledBy} className={styles.panel} inert={!present || undefined} aria-hidden={!present || undefined} variants={panelVariants} initial={reduced ? false : "closed"} animate={controls}><AnswerBody>{children}</AnswerBody></motion.div>;
}

const CategoryStage = forwardRef<HTMLDivElement, { direction: number; children: ReactNode }>(function CategoryStage({ direction, children }, ref) {
  const reduced = !!useReducedMotion();
  const [present, safeToRemove] = usePresence();
  const controls = useAnimationControls();
  useLayoutEffect(() => {
    let current = true;
    controls.stop();
    if (reduced) controls.set({ opacity: present ? 1 : 0, y: 0, filter: "blur(0px)" });
    else if (present) void controls.start({ opacity: 1, y: 0, filter: "blur(0px)", transition: { y: motionTokens.spring.smooth, opacity: { duration: duration.fast, ease: enter }, filter: { duration: duration.fast, ease: enter } } });
    else void controls.start({ opacity: 0, y: direction * -motionTokens.keyframes.faqSection.categoryExitPx, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: duration.instant, ease: standard } }).then(() => { if (current) safeToRemove?.(); });
    return () => { current = false; controls.stop(); };
  }, [controls, present, reduced, safeToRemove, direction]);
  useEffect(() => { if (!present && reduced) safeToRemove?.(); }, [present, reduced, safeToRemove]);
  return <motion.div ref={ref} className={styles.stageFace} inert={!present || undefined} aria-hidden={!present || undefined} initial={reduced ? false : { opacity: 0, y: direction * motionTokens.keyframes.faqSection.categoryEnterPx, filter: `blur(${motionTokens.blur.subtle}px)` }} animate={controls}>{children}</motion.div>;
});

function SearchHint({ hint, query }: { hint: string; query: string }) {
  const reduced = !!useReducedMotion();
  const [present, safeToRemove] = usePresence();
  const controls = useAnimationControls();
  useLayoutEffect(() => {
    let current = true;
    controls.stop();
    if (reduced) controls.set({ opacity: present ? 1 : 0, height: present ? "auto" : 0 });
    else if (present) void controls.start({ opacity: 1, height: "auto", transition: { height: motionTokens.spring.smooth, opacity: { duration: duration.fast } } });
    else void controls.start({ opacity: 0, height: 0, transition: { height: motionTokens.spring.smooth, opacity: { duration: duration.fast } } }).then(() => { if (current) safeToRemove?.(); });
    return () => { current = false; controls.stop(); };
  }, [controls, present, reduced, safeToRemove]);
  useEffect(() => { if (!present && reduced) safeToRemove?.(); }, [present, reduced, safeToRemove]);
  return <motion.p className={styles.hint} inert={!present || undefined} aria-hidden={!present || undefined} initial={reduced ? false : { opacity: 0, height: 0 }} animate={controls}><Highlight text={hint} query={query} /></motion.p>;
}

function Question({ item, open, onToggle, query = "", layout, onExitFocused }: { item: FaqItem; open: boolean; onToggle: () => void; query?: string; layout?: boolean; onExitFocused?: () => void }) {
  const reduced = !!useReducedMotion();
  const [present, safeToRemove] = usePresence();
  const controls = useAnimationControls();
  const rowRef = useRef<HTMLLIElement>(null);
  const focusedBeforeExit = useRef(false);
  useLayoutEffect(() => {
    if (!present && focusedBeforeExit.current && (document.activeElement === document.body || rowRef.current?.contains(document.activeElement))) onExitFocused?.();
  }, [present]);
  useLayoutEffect(() => {
    let current = true;
    controls.stop();
    if (reduced) controls.set({ opacity: present ? 1 : 0, height: present ? "auto" : 0 });
    else if (present) void controls.start({ opacity: 1, height: "auto", transition: { height: motionTokens.spring.smooth, opacity: { duration: duration.fast } } });
    else void controls.start({ opacity: 0, height: 0, transition: { height: motionTokens.spring.smooth, opacity: { duration: duration.instant } } }).then(() => { if (current) safeToRemove?.(); });
    return () => { current = false; controls.stop(); };
  }, [controls, present, reduced, safeToRemove]);
  useEffect(() => { if (!present && reduced) safeToRemove?.(); }, [present, reduced, safeToRemove]);
  const safe = useId();
  const hint = query && !open && !normalize(item.question).includes(normalize(query.trim())) ? snippet(item.answer, query) : null;
  return <motion.li ref={rowRef} onFocusCapture={() => { focusedBeforeExit.current = true; }} onBlurCapture={event => { if (!event.currentTarget.inert) focusedBeforeExit.current = false; }} className={styles.item} data-open={open ? "" : undefined} inert={!present || undefined} aria-hidden={!present || undefined}
    layout={layout && !reduced ? "position" : false}
    initial={layout ? (reduced ? false : { opacity: 0, height: 0 }) : false}
    animate={controls}
    transition={reduced ? { duration: motionTokens.reduced.duration } : { layout: motionTokens.spring.smooth }}>
    <h3 className={styles.heading}>
      <button type="button" id={`${safe}-q`} className={styles.trigger} data-faq-trigger="" aria-expanded={open} aria-controls={`${safe}-a`} onClick={onToggle}>
        <span className={styles.question}><Highlight text={item.question} query={query} /></span>
        <Plus className={styles.icon} aria-hidden="true" />
      </button>
    </h3>
    <AnimatePresence initial={false}>
      {hint && <SearchHint key="hint" hint={hint} query={query} />}
    </AnimatePresence>
    <AnimatePresence initial={false}>
      {open && <AnswerPanel key="answer" id={`${safe}-a`} labelledBy={`${safe}-q`}><Highlight text={item.answer} query={query} /></AnswerPanel>}
    </AnimatePresence>
  </motion.li>;
}

function EmptyNotice({ query, onClear }: { query: string; onClear: () => void }) {
  const reduced = !!useReducedMotion();
  const [present, safeToRemove] = usePresence();
  const controls = useAnimationControls();
  useLayoutEffect(() => {
    let current = true;
    controls.stop();
    if (reduced) controls.set({ opacity: present ? 1 : 0, y: 0 });
    else if (present) void controls.start({ opacity: 1, y: 0, transition: { duration: duration.standard, ease: enter } });
    else void controls.start({ opacity: 0, transition: { duration: duration.instant } }).then(() => { if (current) safeToRemove?.(); });
    return () => { current = false; controls.stop(); };
  }, [controls, present, reduced, safeToRemove]);
  useEffect(() => { if (!present && reduced) safeToRemove?.(); }, [present, reduced, safeToRemove]);
  return <motion.div className={styles.empty} inert={!present || undefined} aria-hidden={!present || undefined} initial={reduced ? false : { opacity: 0, y: motionTokens.keyframes.faqSection.emptyEnterPx }} animate={controls}>
    <p>No answers mention “{query.trim()}”.</p>
    <button type="button" className={styles.clear} onClick={onClear}>Clear search</button>
  </motion.div>;
}

function Contact({ contact }: { contact: NonNullable<FaqSectionProps["contact"]> }) {
  const inner = <><span className={styles.contactText}><span>{contact.label}</span>{contact.description && <span>{contact.description}</span>}</span><ArrowRight className={styles.contactArrow} aria-hidden="true" /></>;
  return contact.href
    ? <a className={styles.contact} href={contact.href} onClick={contact.onClick}>{inner}</a>
    : <button type="button" className={styles.contact} onClick={contact.onClick}>{inner}</button>;
}

/**
 * A frequently asked questions section in three layouts: one centered accordion, a category rail beside its questions,
 * and a searchable list that filters and highlights as you type. Answers open on a height spring with the icon turning
 * to a close mark; arrow keys move between questions.
 */
export const FaqSection = forwardRef<HTMLElement, FaqSectionProps>(function FaqSection({
  variant = "accordion",
  title = "Folio 21 · proof questions",
  description = "Specifications for the booklet sample, from signature count to cover trim.",
  items = faqExampleItems,
  multiple = false,
  value,
  defaultValue,
  onValueChange,
  category: categoryProp,
  onCategoryChange,
  query: queryProp,
  onQueryChange,
  contact = null,
  className,
}, ref) {
  const id = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const reduced = !!useReducedMotion();
  const [innerOpen, setInnerOpen] = useState<string[]>(defaultValue ?? (items[0] ? [keyOf(items[0])] : []));
  const open = value ?? innerOpen;
  const categories = useMemo(() => Array.from(new Set(items.map(item => item.category ?? "General"))), [items]);
  const [innerCategory, setInnerCategory] = useState(categories[0] ?? "General");
  const activeCategory = categoryProp ?? innerCategory;
  const [direction, setDirection] = useState(0);
  const [innerQuery, setInnerQuery] = useState("");
  const query = queryProp ?? innerQuery;

  const setOpen = (next: string[]) => { if (value === undefined) setInnerOpen(next); onValueChange?.(next); };
  const toggle = (key: string) => setOpen(open.includes(key) ? open.filter(entry => entry !== key) : multiple ? [...open, key] : [key]);
  const chooseCategory = (next: string) => {
    if (next === activeCategory) return;
    setDirection(Math.sign(categories.indexOf(next) - categories.indexOf(activeCategory)));
    if (categoryProp === undefined) setInnerCategory(next);
    onCategoryChange?.(next);
  };
  const setQuery = (next: string) => { if (queryProp === undefined) setInnerQuery(next); onQueryChange?.(next); };

  const needle = normalize(query.trim());
  const results = variant === "search" && needle ? items.filter(item => normalize(`${item.question} ${item.answer}`).includes(needle)) : items;
  const heading = <div className={styles.intro}>
    <h2 id={`${id}-title`} className={styles.title}>{title}</h2>
    {description && <p className={styles.description}>{description}</p>}
  </div>;
  const list = (entries: FaqItem[], layout = false) => <ul className={styles.list} onKeyDown={onListKeyDown}>
    <AnimatePresence initial={false}>
      {entries.map(item => <Question key={keyOf(item)} item={item} open={open.includes(keyOf(item))} onToggle={() => toggle(keyOf(item))} query={variant === "search" ? query : ""} layout={layout} onExitFocused={variant === "search" ? () => searchRef.current?.focus({ preventScroll: true }) : undefined} />)}
    </AnimatePresence>
  </ul>;

  return <section ref={ref} className={["rams-faq-section", styles.faq, styles[variant], className].filter(Boolean).join(" ")} aria-labelledby={`${id}-title`}>
    {variant === "accordion" && <div className={styles.stack}>
      {heading}
      {list(items)}
      {contact && <Contact contact={contact} />}
    </div>}

    {variant === "columns" && <div className={styles.columnsGrid}>
      <div className={styles.rail}>
        {heading}
        <LayoutGroup id={`${id}-rail`}>
          <div className={styles.categories} role="group" aria-label="Question topics">
            {categories.map(entry => {
              const count = items.filter(item => (item.category ?? "General") === entry).length;
              return <button key={entry} type="button" className={styles.category} aria-pressed={entry === activeCategory} onClick={() => chooseCategory(entry)}>
                {entry === activeCategory && <motion.span layoutId={reduced ? undefined : "category"} className={styles.categoryHighlight} transition={motionTransition("selection", reduced)} aria-hidden="true" />}
                <span className={styles.categoryLabel}>{entry}</span><span className={styles.count}>{count}</span>
              </button>;
            })}
          </div>
        </LayoutGroup>
        {contact && <Contact contact={contact} />}
      </div>
      <div className={styles.stage}>
        <AnimatePresence initial={false} mode="popLayout" custom={direction}>
          <CategoryStage key={activeCategory} direction={direction}>
            {list(items.filter(item => (item.category ?? "General") === activeCategory))}
          </CategoryStage>
        </AnimatePresence>
      </div>
    </div>}

    {variant === "search" && <div className={styles.stack}>
      {heading}
      <div className={styles.searchRow}>
        <SearchField ref={searchRef} label="Search questions" placeholder="Try paper, ink, or trim" value={query} onValueChange={setQuery} />
        <p className={styles.resultCount} aria-live="polite">{needle ? `${results.length} ${results.length === 1 ? "answer" : "answers"}` : `${items.length} questions`}</p>
      </div>
      {list(results, true)}
      <AnimatePresence initial={false}>
        {needle && results.length === 0 && <EmptyNotice key="empty" query={query} onClear={() => { setQuery(""); searchRef.current?.focus(); }} />}
      </AnimatePresence>
      {contact && <Contact contact={contact} />}
    </div>}
  </section>;
});

FaqSection.displayName = "FaqSection";

const variantOptions = [{ value: "accordion", label: "Accordion" }, { value: "columns", label: "Two column" }, { value: "search", label: "Searchable" }];

/** Preview: the FAQ with a switch between its three layouts. */
export function FaqSectionBlock({ variant: initial = "accordion" }: { variant?: FaqSectionVariant }) {
  const [variant, setVariant] = useState<FaqSectionVariant>(initial);
  return <div className={styles.preview}>
    <Select value={variant} onValueChange={value => setVariant(value as FaqSectionVariant)}>
      <SelectTrigger aria-label="FAQ layout"><SelectValue /></SelectTrigger>
      <SelectContent>{variantOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
    </Select>
    <div className={styles.frame}>
      <FaqSection key={variant} variant={variant} contact={null} />
    </div>
  </div>;
}

export default FaqSectionBlock;
