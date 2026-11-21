"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { AnimatePresence, animate, motion, useMotionValue } from "motion/react";
import { MotionRegion, MotionSwap } from "@/variants/motion-swap";
import { EmptyMedia } from "@/primitives/empty";
import { SearchX, ListChecks, NotebookPen, NotebookText, Inbox, Files, FolderClosed, FolderOpen } from "rams-icons";
import { motionTransition } from "@/variants/motion-policy";
import { useReducedMotion } from "@/variants/use-motion-preference";
import { motionTokens } from "@/variants/vendor/lib/motion-tokens";
import { Button } from "@/variants/vendor/registry/components/button/button";
import styles from "./empty-states.module.css";

/** Four local print-workshop models use the shared RAMS icon family. */
type SceneId = "index" | "notes" | "tray" | "folio";
type Phase = "idle" | "done";
type View = { scene: SceneId; phase: Phase };
type Copy = { title: string; line: string; action: string };
type PlateRecord = { id: string; title: string; place: string; process: string; paper: string; sheets: number };
type RegistrationNote = { plate: string; offset: number; direction: string };
type ProofPacket = { id: string; title: string; sheets: number };
type PrintState = {
  filters: { process: string | null; paper: string | null };
  note: RegistrationNote | null;
  packet: ProofPacket | null;
  folio: "canal" | null;
};

const SCENES: { id: SceneId; tab: string }[] = [
  { id: "index", tab: "Index" },
  { id: "notes", tab: "Notes" },
  { id: "tray", tab: "Tray" },
  { id: "folio", tab: "Folio" },
];
const PLATE_INDEX: PlateRecord[] = [
  { id: "RO-01", title: "Bank lattice", place: "Rosario", process: "Relief", paper: "Rag", sheets: 12 },
  { id: "CO-02", title: "Courtyard grid", place: "Córdoba", process: "Stencil", paper: "Cotton", sheets: 8 },
  { id: "ME-03", title: "Canal margin", place: "Mendoza", process: "Drypoint", paper: "Rag", sheets: 6 },
];
const REGISTRATION_NOTE: RegistrationNote = { plate: "LP-02", offset: .2, direction: "Toward gripper" };
const PROOF_PACKET: ProofPacket = { id: "RQ-04", title: "Quay sequence", sheets: 6 };
const CANAL_FOLIO = [
  { id: "MC-01", title: "Canal edge", sheets: 6 },
  { id: "MC-02", title: "Vine margin", sheets: 10 },
];
const INITIAL_PRINT_STATE: PrintState = { filters: { process: "Stencil", paper: "Rag" }, note: null, packet: null, folio: null };
const totalSheets = (plates: { sheets: number }[]) => plates.reduce((sum, plate) => sum + plate.sheets, 0);
const matchingPlates = (state: PrintState) => PLATE_INDEX.filter(plate =>
  (!state.filters.process || plate.process === state.filters.process) && (!state.filters.paper || plate.paper === state.filters.paper));
const hasFilters = (state: PrintState) => Boolean(state.filters.process || state.filters.paper);
function phaseFor(scene: SceneId, state: PrintState): Phase {
  return (scene === "index" ? matchingPlates(state).length > 0 : scene === "notes" ? state.note !== null : scene === "tray" ? state.packet !== null : state.folio !== null) ? "done" : "idle";
}
function copyFor(scene: SceneId, state: PrintState): Copy {
  if (scene === "index") {
    const plates = matchingPlates(state);
    return {
      title: plates.length ? `${plates.length} plates in the index` : "No matching plates",
      line: plates.length ? `${totalSheets(plates)} reference sheets across Rosario, Córdoba and Mendoza.` : "Stencil on Rag matches none of the three stored plate records.",
      action: hasFilters(state) ? "Clear filters" : "Set filters",
    };
  }
  if (scene === "notes") return {
    title: state.note ? "One registration note" : "No registration notes",
    line: state.note ? `Plate ${state.note.plate}: ${state.note.offset} mm toward the gripper.` : "The La Plata proof worksheet has no offset notes yet.",
    action: state.note ? "Clear note" : "Add note",
  };
  if (scene === "tray") return {
    title: state.packet ? "One proof packet" : "The proof tray is empty",
    line: state.packet ? `${state.packet.sheets} proof sheets from ${state.packet.title} are listed in the local tray.` : "Rosario’s Quay sequence has six reference sheets ready to list.",
    action: state.packet ? "Clear tray" : "Add packet",
  };
  return {
    title: state.folio ? "Canal folio index" : "No index is open",
    line: state.folio ? `${CANAL_FOLIO.length} Mendoza plates contain ${totalSheets(CANAL_FOLIO)} reference sheets.` : "The stored Canal folio contains two plate records.",
    action: state.folio ? "Close index" : "Open index",
  };
}
function changePrintState(state: PrintState, scene: SceneId): PrintState {
  if (scene === "index") return { ...state, filters: hasFilters(state) ? { process: null, paper: null } : { ...INITIAL_PRINT_STATE.filters } };
  if (scene === "notes") return { ...state, note: state.note ? null : REGISTRATION_NOTE };
  if (scene === "tray") return { ...state, packet: state.packet ? null : PROOF_PACKET };
  return { ...state, folio: state.folio ? null : "canal" };
}

const ICONS = {
  index: { idle: SearchX, done: ListChecks },
  notes: { idle: NotebookPen, done: NotebookText },
  tray: { idle: Inbox, done: Files },
  folio: { idle: FolderClosed, done: FolderOpen },
};
const enter = [...motionTokens.ease.enter] as [number, number, number, number];
const standard = [...motionTokens.ease.standard] as [number, number, number, number];

export function EmptyStates() {
  const uid = useId();
  const reduced = useReducedMotion() ?? false;
  const [scene, setScene] = useState<SceneId>("index");
  const [printState, setPrintState] = useState<PrintState>(INITIAL_PRINT_STATE);
  const view: View = { scene, phase: phaseFor(scene, printState) };
  const [announcement, setAnnouncement] = useState("");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const copyInner = useRef<HTMLDivElement>(null);
  const copyHeight = useMotionValue<number | "auto">("auto");

  const Icon = ICONS[view.scene][view.phase];
  const copy = copyFor(view.scene, printState);
  const plates = matchingPlates(printState);
  const copyKey = `${copy.title}|${copy.line}`;
  const measuredCopy = useRef(copyKey);

  // The copy block springs to the height of the incoming text, so the action never jumps.
  useLayoutEffect(() => { measuredCopy.current = copyKey; }, [copyKey]);
  useEffect(() => {
    const node = copyInner.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    let previousKey: string | null = null;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const next = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
      const changed = previousKey !== null && previousKey !== measuredCopy.current;
      previousKey = measuredCopy.current;
      if (changed && !reduced) animate(copyHeight, next, motionTokens.spring.smooth);
      else copyHeight.jump(next);
    });
    observer.observe(node);
    return () => { observer.disconnect(); copyHeight.stop(); };
  }, [reduced, copyHeight]);

  function choose(next: SceneId) {
    if (next === view.scene) return;
    setScene(next);
    setAnnouncement("");
  }

  function act() {
    const next = changePrintState(printState, view.scene);
    setPrintState(next);
    const result = copyFor(view.scene, next);
    setAnnouncement(`${result.title}. ${result.line}`);
  }

  function onTabKey(event: KeyboardEvent<HTMLDivElement>) {
    const index = SCENES.findIndex(item => item.id === view.scene);
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const step = event.key === "ArrowRight" ? (rtl ? -1 : 1) : event.key === "ArrowLeft" ? (rtl ? 1 : -1) : 0;
    const next = step ? (index + step + SCENES.length) % SCENES.length : event.key === "Home" ? 0 : event.key === "End" ? SCENES.length - 1 : -1;
    if (next < 0) return;
    event.preventDefault();
    choose(SCENES[next]!.id);
    tabs.current[next]?.focus();
  }

  const rise = reduced
    ? { initial: { opacity: 0 }, exit: { opacity: 0, transition: { duration: motionTokens.reduced.duration } } }
    : { initial: { opacity: 0, y: motionTokens.keyframes.emptyStates.textEnterPx, filter: `blur(${motionTokens.blur.soft}px)` }, exit: { opacity: 0, y: motionTokens.keyframes.emptyStates.textExitPx, filter: `blur(${motionTokens.blur.soft}px)`, transition: { duration: motionTokens.duration.exit, ease: standard } } };
  const shownText = { opacity: 1, y: 0, filter: "blur(0px)" };
  const textIn = (delay: number) => ({ duration: reduced ? motionTokens.reduced.duration : motionTokens.duration.considered, ease: enter, delay: reduced ? motionTokens.reduced.stagger : Math.min(delay, motionTokens.sequence.maxStagger) });

  return (
    <section className={styles.root} aria-label="Print workshop empty states">
      <div className={styles.card}>
        <div className={styles.tabs} role="tablist" aria-label="Print workshop view" onKeyDown={onTabKey}>
          {SCENES.map((item, index) => {
            const selected = item.id === view.scene;
            return (
              <button key={item.id} ref={node => { tabs.current[index] = node; }} id={`${uid}-tab-${item.id}`} type="button" role="tab" aria-selected={selected} aria-controls={`${uid}-panel`} tabIndex={selected ? 0 : -1} className={styles.tab} onFocus={event => event.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" })} onClick={() => choose(item.id)}>
                {selected ? <motion.span layoutId={reduced ? undefined : `${uid}-highlight`} className={styles.highlight} transition={motionTransition("selection", reduced)} /> : null}
                <span className={styles.tabLabel}>{item.tab}</span>
              </button>
            );
          })}
        </div>

        <div className={styles.panel} role="tabpanel" id={`${uid}-panel`} aria-labelledby={`${uid}-tab-${view.scene}`}>
          <EmptyMedia variant="icon" className={styles.stage} aria-hidden="true">
            <AnimatePresence initial={false} mode="popLayout">
              <MotionRegion key={`${view.scene}-${view.phase}`} className={styles.art}
                initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: reduced ? motionTokens.reduced.duration : motionTokens.duration.fast }}>
                <Icon strokeWidth="var(--rams-detail-empty-states-icon-stroke)" />
              </MotionRegion>
            </AnimatePresence>
          </EmptyMedia>

          <div className={styles.copy}>
            <motion.div className={styles.copyFrame} style={{ height: copyHeight }}>
              <div ref={copyInner} className={styles.copyInner}>
                <h2 className={styles.title}>
                  <AnimatePresence mode="popLayout" initial={false}>
                    <MotionSwap key={copy.title} className={styles.swap} initial={reduced ? false : rise.initial} animate={shownText} exit={reduced ? { opacity: 0, transition: { duration: motionTokens.reduced.duration } } : rise.exit} transition={reduced ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : textIn(motionTokens.keyframes.emptyStates.textDelaySeconds)}>{copy.title}</MotionSwap>
                  </AnimatePresence>
                </h2>
                <p className={styles.line}>
                  <AnimatePresence mode="popLayout" initial={false}>
                    <MotionSwap key={copy.line} className={styles.swap} initial={reduced ? false : rise.initial} animate={shownText} exit={reduced ? { opacity: 0, transition: { duration: motionTokens.reduced.duration } } : rise.exit} transition={reduced ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : textIn(motionTokens.keyframes.emptyStates.textDelaySeconds + motionTokens.stagger.word)}>{copy.line}</MotionSwap>
                  </AnimatePresence>
                </p>
              </div>
            </motion.div>
            <div className={styles.result}>
              {scene === "index" && <>
                <p className={styles.modelNote}>Process: {printState.filters.process ?? "Any"} · Paper: {printState.filters.paper ?? "Any"}</p>
                {plates.length > 0 && <ul className={styles.records}>{plates.map(plate => <li key={plate.id}><strong>{plate.id} · {plate.title}</strong><span>{plate.place} · {plate.process} · {plate.paper} · {plate.sheets} sheets</span></li>)}</ul>}
              </>}
              {scene === "notes" && (printState.note ? <dl className={styles.noteRecord}>
                <div><dt>Plate</dt><dd>{printState.note.plate} · La Plata</dd></div>
                <div><dt>Offset</dt><dd>{printState.note.offset} mm</dd></div>
                <div><dt>Direction</dt><dd>{printState.note.direction}</dd></div>
              </dl> : <p className={styles.modelNote}>La Plata / worksheet LP-02</p>)}
              {scene === "tray" && <>
                <p className={styles.modelNote}>Tray total: {printState.packet?.sheets ?? 0} proof sheets</p>
                {printState.packet && <ul className={styles.records}><li><strong>{printState.packet.id} · {printState.packet.title}</strong><span>Rosario · {printState.packet.sheets} proof sheets</span></li></ul>}
              </>}
              {scene === "folio" && (printState.folio ? <ul className={styles.records}>{CANAL_FOLIO.map(plate => <li key={plate.id}><strong>{plate.id} · {plate.title}</strong><span>Mendoza · {plate.sheets} sheets</span></li>)}</ul> : <p className={styles.modelNote}>Mendoza / local plate cabinet</p>)}
            </div>
            <Button size="sm" onClick={act}>{copy.action}</Button>
          </div>
          <p className={styles.srOnly} aria-live="polite">{announcement}</p>
        </div>
      </div>
    </section>
  );
}

export default EmptyStates;
