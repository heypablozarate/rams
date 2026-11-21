"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { AnimatePresence } from "motion/react";
import { Check, Minus } from "rams-icons";
import { Button, buttonVariants } from "@/primitives/button";
import type { ButtonVariant } from "@/primitives/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/primitives/select";
import { Switch } from "@/variants/vendor/registry/components/switch/switch";
import { MotionPresenceDiv } from "@/variants/presence-controls";
import { useReducedMotion } from "@/variants/use-motion-preference";
import { motionTokens } from "@/variants/motion-tokens";
import { comparisonStackBelow } from "@/primitives/comparison-stack-below";
import type { ComparisonAction, ComparisonColumn, ComparisonRow, ComparisonSection, ComparisonValue } from "./comparison-types";
import styles from "@/variants/vendor/registry/blocks/comparison-table/comparison-table.module.css";

export type { ComparisonAction, ComparisonColumn, ComparisonRow, ComparisonSection, ComparisonValue } from "./comparison-types";

export interface ComparisonProps {
  columns: ComparisonColumn[];
  sections: ComparisonSection[];
  title?: string;
  description?: string;
  differencesOnly?: boolean;
  defaultDifferencesOnly?: boolean;
  onDifferencesOnlyChange?: (value: boolean) => void;
  compareWith?: string;
  onCompareWithChange?: (id: string) => void;
  /** Pair a reference and one alternative, or retain every column on mobile. */
  mobileLayout?: "pair" | "all";
  selectable?: boolean;
  /** null clears selection; undefined lets the component own it. */
  selectedColumn?: string | null;
  defaultSelectedColumn?: string | null;
  onSelectionChange?: (id: string | null) => void;
  cta?: ComparisonAction;
  stickyTop?: number;
  maxHeight?: number | string;
  /** Stack below this component border-box width in CSS pixels. */
  stackBelow?: number;
  toolbar?: ReactNode;
  footer?: ReactNode;
  featureLabel?: string;
  sectionLabel?: string;
  countLabel?: string;
  differencesLabel?: string;
  showLegend?: boolean;
  className?: string;
}

function useControllable<T>(value: T | undefined, initial: T, change?: (next: T) => void) {
  const [own, setOwn] = useState(initial);
  return [value === undefined ? own : value, (next: T) => { if (value === undefined) setOwn(next); change?.(next); }] as const;
}

function normalize(value: ComparisonValue | undefined) {
  if (value === undefined) return { value: false as const, note: undefined };
  return typeof value === "object" ? value : { value, note: undefined };
}

function Value({ value }: { value: ComparisonValue | undefined }) {
  const item = normalize(value);
  return <span className={styles.value}>
    {item.value === true ? <span className={styles.included}><Check size="var(--rams-detail-comparison-value-glyph-size)" aria-hidden="true" />Included</span>
      : item.value === false ? <span className={styles.unavailable}><Minus size="var(--rams-detail-comparison-value-glyph-size)" aria-hidden="true" />Not included</span>
      : item.value === "partial" ? <span className={styles.partial}><span className={styles.partialMark} aria-hidden="true" />Partial</span>
      : <span>{item.value}</span>}
    {item.note && <span className={styles.note}>{item.note}</span>}
  </span>;
}

/** Reserve both states in the layout, without making the live button a blank oversized target. */
function ActionSlot({ states, children }: { states: { label: string; variant: ButtonVariant }[]; children: ReactNode }) {
  return <div className={styles.actionSlot}>
    {states.map(({ label, variant }, index) => <span key={`${index}-${label}`} aria-hidden="true" className={buttonVariants({ variant, className: `${styles.selectButton} ${styles.measure}` })}>{label}</span>)}
    {children}
  </div>;
}

/** Shared renderer. Data, calculations and selection consequences belong to the caller. */
export function Comparison({
  columns, sections, title = "Comparison", description, differencesOnly: differencesProp,
  defaultDifferencesOnly = false, onDifferencesOnlyChange, compareWith: compareProp,
  onCompareWithChange, mobileLayout = "pair", selectable = false,
  selectedColumn: selectionProp, defaultSelectedColumn = null, onSelectionChange,
  cta, stickyTop = 0, maxHeight, stackBelow = comparisonStackBelow, toolbar, footer,
  featureLabel = "Feature", sectionLabel = "Features", countLabel = "features",
  differencesLabel = "Only differences", showLegend = true, className,
}: ComparisonProps) {
  const uid = useId(), rootRef = useRef<HTMLElement>(null);
  const reduced = Boolean(useReducedMotion());
  const [narrow, setNarrow] = useState(false);
  const [differencesOnly, setDifferencesOnly] = useControllable(differencesProp, defaultDifferencesOnly, onDifferencesOnlyChange);
  const reference = columns.find(column => column.highlight) ?? columns[0];
  const alternatives = columns.filter(column => column.id !== reference?.id);
  const [comparison, setComparison] = useControllable(compareProp, alternatives[0]?.id ?? "", onCompareWithChange);
  const compared = alternatives.find(column => column.id === comparison) ?? alternatives[0];
  const [selection, setSelection] = useControllable(selectionProp, defaultSelectedColumn, onSelectionChange);
  const selected = columns.some(column => column.id === selection) ? selection : null;
  const [actionDone, setActionDone] = useState(false);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    setNarrow(root.getBoundingClientRect().width < stackBelow);
    const observer = new ResizeObserver(([entry]) => { if (entry) setNarrow(root.getBoundingClientRect().width < stackBelow); });
    observer.observe(root, { box: "border-box" });
    return () => observer.disconnect();
  }, [stackBelow]);

  const visible = narrow && mobileLayout === "pair" ? columns.filter(column => column.id === reference?.id || column.id === compared?.id) : columns;
  const differs = (row: ComparisonRow) => new Set(visible.map(column => {
    const item = normalize(row.values[column.id]);
    return JSON.stringify([item.value, item.note ?? ""]);
  })).size > 1;
  const displayed = sections.map(section => ({ ...section, rows: differencesOnly ? section.rows.filter(differs) : section.rows }));
  const total = sections.reduce((sum, section) => sum + section.rows.length, 0);
  const count = displayed.reduce((sum, section) => sum + section.rows.length, 0);
  const gridStyle = { "--rams-detail-comparison-columns": visible.length, "--rams-detail-comparison-sticky-top": `${stickyTop}px` } as CSSProperties;
  const rowMotion = reduced ? { duration: motionTokens.reduced.duration } : { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] } };

  return <section ref={rootRef} className={["rams-comparison", styles.root, className].filter(Boolean).join(" ")} aria-labelledby={`${uid}-title`} data-narrow={narrow || undefined} data-mobile-layout={mobileLayout}>
    <header className={styles.intro}>
      <div className={styles.introText}><h2 id={`${uid}-title`} className={styles.title}>{title}</h2>{description && <p className={styles.description}>{description}</p>}</div>
      {toolbar && <div className={styles.toolbar}>{toolbar}</div>}
    </header>
    <div className={styles.filter}>
      <div className={styles.filterHeading}><h3>{sectionLabel}</h3><span className={styles.featureCount}>{count} of {total} {countLabel}</span></div>
      <Switch className={styles.toggle} checked={differencesOnly} onCheckedChange={setDifferencesOnly} label={differencesLabel} />
    </div>
    {narrow && mobileLayout === "pair" && alternatives.length > 1 && reference && <div className={styles.picker}>
      <label htmlFor={`${uid}-alternative`}>Compare {reference.name} with</label>
      <Select value={compared?.id ?? ""} onValueChange={setComparison}>
        <SelectTrigger id={`${uid}-alternative`} aria-label={`Compare ${reference.name} with`}><SelectValue /></SelectTrigger>
        <SelectContent>{alternatives.map(column => <SelectItem key={column.id} value={column.id}>{column.name}</SelectItem>)}</SelectContent>
      </Select>
    </div>}
    {columns.length ? <div className={styles.scroller} style={maxHeight !== undefined ? { maxHeight, overflowY: "auto" } : undefined} tabIndex={0} role="region" aria-label={`${title} table`}>
      <div className={styles.table} role="table" aria-labelledby={`${uid}-title`} style={gridStyle}>
        <div role="rowgroup" className={styles.head}>
          <div role="row" className={styles.headRow}>
            <div role="columnheader" className={styles.featureHeader}>{featureLabel}</div>
            {visible.map(column => <div key={column.id} role="columnheader" className={styles.columnHeader} data-highlight={column.highlight || undefined} data-selected={column.id === selected || undefined}>
              <div className={styles.columnTitle}><h3>{column.name}</h3>{column.caption && <span>{column.caption}</span>}</div>
              <div className={styles.columnDetail}>{column.detail}</div>
              <div className={styles.columnAction}>{selectable && <ActionSlot states={[{ label: column.selectLabel ?? `Select ${column.name}`, variant: "outline" }, { label: "Selected", variant: cta ? "secondary" : "default" }]}><Button type="button" variant={column.id === selected ? (cta ? "secondary" : "default") : "outline"} className={styles.selectButton} aria-pressed={column.id === selected} onClick={() => setSelection(column.id === selected ? null : column.id)}>{column.id === selected ? "Selected" : column.selectLabel ?? `Select ${column.name}`}</Button></ActionSlot>}</div>
            </div>)}
          </div>
        </div>
        {displayed.map(section => <div role="rowgroup" key={section.id} className={styles.section}>
          <AnimatePresence key={reduced ? "reduced" : "motion"} initial={false}>
            {section.rows.length > 0 && section.title && <MotionPresenceDiv key="section-title" role="row" className={styles.sectionRow} initial={false} animate={{ height: "auto", opacity: 1 }} exit={reduced ? undefined : { height: 0, opacity: 0 }} transition={rowMotion}>
              <div role="rowheader" className={styles.sectionTitle}>{section.title}</div>{visible.map(column => <div key={column.id} role="cell" className={styles.sectionBand} data-highlight={column.highlight || undefined} data-selected={column.id === selected || undefined} />)}
            </MotionPresenceDiv>}
            {section.rows.map(row => <MotionPresenceDiv key={row.id} role="row" className={styles.featureRow} initial={reduced ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={reduced ? undefined : { height: 0, opacity: 0 }} transition={rowMotion}>
              <div role="rowheader" className={styles.featureName}><span>{row.feature}</span>{row.hint && <span className={styles.hint}>{row.hint}</span>}</div>
              {visible.map(column => <div key={column.id} role="cell" className={styles.featureValue} data-highlight={column.highlight || undefined} data-selected={column.id === selected || undefined}><span className={styles.mobileColumn} aria-hidden="true">{column.name}</span><Value value={row.values[column.id]} /></div>)}
            </MotionPresenceDiv>)}
          </AnimatePresence>
        </div>)}
        {cta && reference && <div role="rowgroup"><div role="row" className={styles.actionRow}>
          <div role="cell" />{visible.map(column => <div key={column.id} role="cell" className={styles.actionCell} data-highlight={column.highlight || undefined}>{column.id === reference.id && (cta.href && !cta.onClick
            ? <Button asChild className={styles.selectButton}><a href={cta.href}>{cta.label}</a></Button>
            : <ActionSlot states={(cta.doneLabel ? [cta.label, cta.doneLabel] : [cta.label]).map(label => ({ label, variant: "default" as const }))}><Button type="button" className={styles.selectButton} onClick={() => { cta.onClick?.(); if (cta.doneLabel) setActionDone(true); }}><span>{actionDone ? cta.doneLabel : cta.label}</span></Button></ActionSlot>)}</div>)}
        </div></div>}
      </div>
      {count === 0 && <p className={styles.empty} role="status">{differencesOnly ? "No differences in the visible columns." : "No features to compare."}</p>}
    </div> : <p className={styles.empty} role="status">No options to compare.</p>}
    {(showLegend || footer) && <footer className={styles.footer}>
      {showLegend && <p className={styles.legend}><span><Check size="var(--rams-detail-comparison-legend-glyph-size)" aria-hidden="true" />Included</span><span><span className={styles.partialMark} aria-hidden="true" />Partial</span><span><Minus size="var(--rams-detail-comparison-legend-glyph-size)" aria-hidden="true" />Not included</span></p>}
      {footer}
    </footer>}
    <p className={styles.srOnly} aria-live="polite">{differencesOnly ? "Showing only rows that differ" : "Showing all rows"}</p>
  </section>;
}

export default Comparison;
