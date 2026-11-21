"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, KeyboardEvent } from "react";
import { AnimatePresence, animate, motion, useAnimationControls, usePresence, useMotionValue, useMotionValueEvent, useTransform, type TargetAndTransition, type Transition } from "motion/react";
import { MotionSwap as Swap } from "@/variants/motion-swap";
import { useReducedMotion } from "@/variants/use-motion-preference";
import { File, FileArchive, FileImage, FileText, RotateCw, UploadCloud, X } from "rams-icons";
import { motionTokens } from "@/variants/vendor/lib/motion-tokens";
import styles from "./file-upload.module.css";

export type FileUploadItem = { id: string; file: File; error?: string };

export interface FileUploadProps {
  accept?: string;
  disabled?: boolean;
  label?: string;
  description?: string;
  multiple?: boolean;
  maxSize?: number;
  value?: FileUploadItem[];
  onValueChange?: (files: FileUploadItem[]) => void;
  /** Uploads each accepted file. Report progress from 0 to 100, resolve when done, or reject to mark the file as failed. Removing a file aborts its signal. */
  onUpload?: (file: File, options: { onProgress: (percent: number) => void; signal: AbortSignal }) => Promise<void>;
}

type Upload = { status: "uploading" | "done" | "failed"; progress: number };

const enter: Transition = { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] };
const exitFast: Transition = { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] };
const textIn: TargetAndTransition = { opacity: 0, y: `${motionTokens.keyframes.fileUpload.labelTravelEm}em`, filter: `blur(${motionTokens.blur.soft}px)` };
const textOut: TargetAndTransition = { opacity: 0, y: `${-motionTokens.keyframes.fileUpload.labelTravelEm}em`, filter: `blur(${motionTokens.blur.subtle}px)`, transition: exitFast };
const iconIn: TargetAndTransition = { opacity: 0, scale: motionTokens.keyframes.fileUpload.retryEnterScale, filter: `blur(${motionTokens.blur.subtle}px)` };
const shown: TargetAndTransition = { opacity: 1, y: "0em", scale: 1, filter: "blur(0px)" };
const fadeOut: TargetAndTransition = { opacity: 0, transition: { duration: motionTokens.duration.instant } };

function FileTypeIcon({ file }: { file: File }) {
  const props = { "aria-hidden": true } as const;
  if (file.type.startsWith("image/")) return <FileImage {...props} />;
  if (file.type.startsWith("text/")) return <FileText {...props} />;
  if (file.type.includes("zip") || file.name.endsWith(".gz")) return <FileArchive {...props} />;
  return <File {...props} />;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  const mb = bytes / (1024 * 1024);
  return `${mb >= 10 ? Math.round(mb) : Number(mb.toFixed(1))} MB`;
}

const openStatus = { height: "auto" };
const closedStatus = { height: 0 };
const openList = { paddingTop: "var(--rams-detail-file-upload-list-row-gap)" };
const closedList = { paddingTop: 0 };
const openRow = { height: "auto", opacity: 1 };
const closedRow = { height: 0, opacity: 0 };
const rowTransition = { height: motionTokens.spring.smooth, opacity: enter };
const rowExit = { ...closedRow, transition: { height: motionTokens.spring.smooth, opacity: exitFast } };
const barExit = { ...closedRow, transition: {
  height: { ...motionTokens.spring.smooth, delay: motionTokens.sequence.settle },
  opacity: { ...exitFast, delay: motionTokens.sequence.settle },
} };

function useSettledLayout(target: TargetAndTransition, exit?: TargetAndTransition) {
  const reduced = useReducedMotion();
  const controls = useAnimationControls();
  const [present, safeToRemove] = usePresence();
  useLayoutEffect(() => {
    let active = true;
    const destination = present || !exit ? target : exit;
    if (reduced) {
      controls.stop();
      controls.set(destination);
      if (!present) safeToRemove?.();
    } else {
      void controls.start(destination).then(() => {
        if (active && !present) safeToRemove?.();
      });
    }
    return () => { active = false; controls.stop(); };
  }, [controls, exit, present, reduced, safeToRemove, target]);
  return { controls, present };
}

function FileListRow({ children, reduce }: { children: React.ReactNode; reduce: boolean }) {
  const { controls, present } = useSettledLayout(openRow, rowExit);
  return <motion.li className={styles.fileRow} initial={reduce ? false : closedRow} animate={controls}
    transition={rowTransition} inert={!present} aria-hidden={present ? undefined : true}>{children}</motion.li>;
}

function ProgressFrame({ children, reduce }: { children: React.ReactNode; reduce: boolean }) {
  const { controls, present } = useSettledLayout(openRow, barExit);
  return <motion.span className={styles.barFrame} initial={reduce ? false : closedRow} animate={controls}
    transition={rowTransition} aria-hidden={present ? undefined : true}>{children}</motion.span>;
}

const retryExit = { ...iconIn, transition: exitFast };
const readyPath = { pathLength: 1 };
const readyDraw = { ...enter, delay: motionTokens.sequence.handoff };

function ReadyGlyph() {
  const reduced = useReducedMotion();
  const controls = useAnimationControls();
  useLayoutEffect(() => {
    if (reduced) controls.set(readyPath);
    else void controls.start(readyPath);
    return () => controls.stop();
  }, [controls, reduced]);
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <motion.path d="M4 12.5l5 5L20 6.5" initial={reduced ? readyPath : { pathLength: 0 }} animate={controls} transition={readyDraw} />
    </svg>
  );
}

function RetryAction({ name, onRetry }: { name: string; onRetry: (event: React.MouseEvent<HTMLButtonElement>) => void }) {
  const reduced = useReducedMotion();
  const { controls, present } = useSettledLayout(shown, retryExit);
  return (
    <motion.span className={styles.retrySlot} initial={reduced ? false : iconIn} animate={controls}
      transition={motionTokens.spring.snappy} inert={!present} aria-hidden={present ? undefined : true}>
      <button type="button" className={styles.retry} aria-label={`Retry ${name}`} onClick={onRetry}><RotateCw aria-hidden="true" /></button>
    </motion.span>
  );
}

function FileRow({ item, upload, reduce, onRemove, onRetry, removeRef }: { item: FileUploadItem; upload?: Upload; reduce: boolean; onRemove: () => void; onRetry: () => void; removeRef: (node: HTMLButtonElement | null) => void }) {
  const removeButton = useRef<HTMLButtonElement | null>(null);
  const status = upload?.status;
  // A finished upload keeps its bar until the spring reaches the end, so 100% is seen before the label turns to Uploaded.
  const [filled, setFilled] = useState(status !== "uploading");
  const [seen, setSeen] = useState(status);
  if (seen !== status) { setSeen(status); if (status === "uploading") setFilled(false); }
  const shownStatus = status === "done" && !filled && !reduce ? "uploading" : status;
  const phase = item.error ? "invalid" : shownStatus ?? "ready";
  // One spring drives the bar and the counted percentage, so both always agree.
  const progress = useMotionValue(upload?.progress ?? 0);
  // The fill slides in from the left instead of scaling, so its rounded end keeps its shape at every value.
  const x = useTransform(progress, latest => `${Math.min(Math.max(latest, 0), 100) - 100}%`);
  const percent = useTransform(progress, latest => `${Math.round(Math.min(Math.max(latest, 0), 100))}%`);
  const target = status === "done" ? 100 : upload?.progress ?? 0;
  useEffect(() => {
    // Every upload starts from an empty bar, even a retry that failed halfway.
    if (reduce || (status === "uploading" && target === 0)) { progress.jump(target); return; }
    const controls = animate(progress, target, { ...motionTokens.spring.smooth, onComplete: status === "done" ? () => setFilled(true) : undefined });
    return () => controls.stop();
  }, [status, target, progress, reduce]);
  // The label turns as soon as the count reads 100%, without waiting out the spring's last fraction of a pixel.
  useMotionValueEvent(progress, "change", latest => { if (status === "done" && Math.round(latest) >= 100) setFilled(true); });
  const swap = { initial: reduce ? { opacity: 0 } : textIn, animate: shown, exit: reduce ? ({ opacity: 0, transition: { duration: motionTokens.reduced.duration } }) : textOut, transition: reduce ? ({ duration: motionTokens.reduced.duration }) : enter };
  return <div className={styles.fileItem}>
    <span className={styles.fileIcon}><FileTypeIcon file={item.file} /></span>
    <span className={styles.fileCopy}>
      <strong title={item.file.name}>{item.file.name}</strong>
      <span className={styles.meta}>{formatSize(item.file.size)}{shownStatus ? <><span className={styles.dot} aria-hidden="true">·</span><span className={styles.phase}><AnimatePresence mode="popLayout" initial={false}>
        <Swap key={shownStatus} className={shownStatus === "failed" ? `${styles.phaseText} ${styles.error}` : styles.phaseText} {...swap}>{shownStatus === "uploading" ? <>Uploading <motion.span className={styles.percent}>{percent}</motion.span></> : shownStatus === "done" ? "Uploaded" : "Upload failed"}</Swap>
      </AnimatePresence></span></> : null}</span>
      {item.error && <span className={styles.error}>{item.error}</span>}
      {/* The bar fills on a spring, then folds away once the file lands. */}
      <AnimatePresence initial={false}>{shownStatus === "uploading" && <ProgressFrame key="bar" reduce={reduce}>
        <span className={styles.bar}><motion.span className={styles.barFill} style={{ x }} /></span>
      </ProgressFrame>}</AnimatePresence>
    </span>
    <span className={styles.statusSlot}>
      <AnimatePresence mode="popLayout" initial={false}>
        {(phase === "ready" || phase === "done") && <motion.span key="ready" className={styles.ready} initial={reduce ? { opacity: 0 } : { opacity: 0, scale: motionTokens.keyframes.fileUpload.readyEnterScale }} animate={{ opacity: 1, scale: 1 }} exit={reduce ? ({ opacity: 0, transition: { duration: motionTokens.reduced.duration } }) : fadeOut} transition={reduce ? ({ duration: motionTokens.reduced.duration }) : motionTokens.spring.snappy}>
          <ReadyGlyph />
          <span className={styles.srOnly}>{phase === "done" ? "Uploaded" : "Ready"}</span>
        </motion.span>}
        {/* The wrapper carries the entrance, so the button's own press scale never competes with it. */}
        {phase === "failed" && <RetryAction key="retry" name={item.file.name} onRetry={(event) => {
          if (event.currentTarget.ownerDocument.activeElement === event.currentTarget) removeButton.current?.focus();
          onRetry();
        }} />}
      </AnimatePresence>
    </span>
    <button ref={(node) => { removeButton.current = node; removeRef(node); }} type="button" className={styles.remove} aria-label={`Remove ${item.file.name}`} onClick={onRemove}><X aria-hidden="true" /></button>
  </div>;
}

export function FileUpload({
  accept,
  disabled = false,
  label = "Upload files",
  description = "Drop files here or browse from your device.",
  multiple = true,
  maxSize,
  value,
  onValueChange: onChange,
  onUpload,
}: FileUploadProps) {
  const inputId = useId();
  const reduce = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const [internalFiles, setInternalFiles] = useState<FileUploadItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState("");
  const [uploads, setUploads] = useState<Record<string, Upload>>({});
  const dragDepth = useRef(0);
  const nextId = useRef(0);
  const controllers = useRef(new Map<string, AbortController>());
  const removeRefs = useRef(new Map<string, HTMLButtonElement>());
  const files = value ?? internalFiles;
  // A caller can clear a controlled selection without invoking an individual row action.
  const announcement = files.length === 0 && status ? "No files selected." : status;

  useEffect(() => {
    const active = controllers.current;
    return () => active.forEach(controller => controller.abort());
  }, []);

  function update(next: FileUploadItem[]) {
    if (value === undefined) setInternalFiles(next);
    onChange?.(next);
  }

  function startUpload(item: FileUploadItem) {
    if (!onUpload) return;
    controllers.current.get(item.id)?.abort();
    const controller = new AbortController();
    controllers.current.set(item.id, controller);
    const set = (next: (current?: Upload) => Upload) => setUploads(current => ({ ...current, [item.id]: next(current[item.id]) }));
    set(() => ({ status: "uploading", progress: 0 }));
    onUpload(item.file, {
      signal: controller.signal,
      onProgress: percent => { if (!controller.signal.aborted) set(current => ({ status: "uploading", progress: Math.min(Math.max(percent, current?.progress ?? 0), 100) })); },
    }).then(() => {
      if (controller.signal.aborted) return;
      set(() => ({ status: "done", progress: 100 }));
      setStatus(`${item.file.name} uploaded.`);
    }, () => {
      if (controller.signal.aborted) return;
      set(current => ({ status: "failed", progress: current?.progress ?? 0 }));
      setStatus(`${item.file.name} could not be uploaded.`);
    }).finally(() => { if (controllers.current.get(item.id) === controller) controllers.current.delete(item.id); });
  }

  function addFiles(fileList: FileList | File[]) {
    const incoming = Array.from(fileList).slice(0, multiple ? undefined : 1);
    const acceptedTypes = accept?.split(",").map(type => type.trim().toLowerCase()).filter(Boolean) ?? [];
    const matchesAccept = (file: File) => acceptedTypes.length === 0 || acceptedTypes.some(type => type.startsWith(".")
      ? file.name.toLowerCase().endsWith(type)
      : type.endsWith("/*") ? file.type.startsWith(type.slice(0, -1)) : file.type === type);
    const accepted = incoming.map(file => ({
      id: `${file.name}-${file.lastModified}-${nextId.current++}`,
      file,
      error: !matchesAccept(file)
        ? "This file type is not accepted."
        : maxSize && file.size > maxSize ? `File is larger than ${formatSize(maxSize)}.` : undefined,
    }));
    if (!multiple) controllers.current.forEach(controller => controller.abort());
    update(multiple ? [...files, ...accepted] : accepted);
    const invalidCount = accepted.filter(item => item.error).length;
    const validCount = accepted.length - invalidCount;
    const added = `${validCount} file${validCount === 1 ? "" : "s"} added.`;
    const attention = `${invalidCount} file${invalidCount === 1 ? " needs" : "s need"} attention.`;
    setStatus(!invalidCount ? added : validCount ? `${added} ${attention}` : attention);
    accepted.filter(item => !item.error).forEach(startUpload);
  }

  function removeFile(item: FileUploadItem) {
    controllers.current.get(item.id)?.abort();
    controllers.current.delete(item.id);
    // Keep keyboard focus in the list: the next row's remove button, else the previous one, else the dropzone.
    const index = files.findIndex(file => file.id === item.id);
    const neighbor = files[index + 1] ?? files[index - 1];
    update(files.filter(file => file.id !== item.id));
    setStatus(`${item.file.name} removed.`);
    requestAnimationFrame(() => (neighbor ? removeRefs.current.get(neighbor.id) : dropzoneRef.current)?.focus());
  }

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) addFiles(event.target.files);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    if (!disabled && event.dataTransfer.files.length) addFiles(event.dataTransfer.files);
  }

  function handleDragEnter(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (!disabled) {
      dragDepth.current += 1;
      setDragging(true);
    }
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (disabled) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      inputRef.current?.click();
    }
  }

  const statusFrame = useSettledLayout(announcement ? openStatus : closedStatus).controls;
  const list = useSettledLayout(files.length ? openList : closedList).controls;
  return <div className={styles.root}>
    <input ref={inputRef} id={inputId} className={styles.input} type="file" accept={accept} multiple={multiple} disabled={disabled} tabIndex={-1} aria-hidden="true" onChange={handleInput} />
    <div
      ref={dropzoneRef}
      className={[styles.dropzone, dragging ? styles.dragging : "", disabled ? styles.disabled : ""].filter(Boolean).join(" ")}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-describedby={`${inputId}-description`}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={handleKeyDown}
      onDragEnter={handleDragEnter}
      onDragOver={event => event.preventDefault()}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <span className={styles.uploadIcon}><UploadCloud aria-hidden="true" /></span>
      {/* While a file hovers over the target the label says what releasing it will do. */}
      <span className={styles.copy}><strong className={styles.label}><AnimatePresence mode="popLayout" initial={false}><Swap key={dragging ? "drop" : "idle"} className={styles.labelText} initial={reduce ? { opacity: 0 } : textIn} animate={shown} exit={reduce ? ({ opacity: 0, transition: { duration: motionTokens.reduced.duration } }) : textOut} transition={reduce ? ({ duration: motionTokens.reduced.duration }) : enter}>{dragging ? `Drop to add ${multiple ? "files" : "a file"}` : label}</Swap></AnimatePresence></strong><span id={`${inputId}-description`}>{description}</span></span>
      <span className={styles.browse}>Browse</span>
    </div>
    {/* The live region stays mounted; its frame opens on the first message and each new message rises in. */}
    <motion.div className={styles.statusFrame} initial={closedStatus} animate={statusFrame} transition={rowTransition}>
      <p className={styles.status} aria-live="polite" aria-atomic="true"><AnimatePresence mode="popLayout" initial={false}>{announcement ? <Swap key={announcement} className={styles.statusText} initial={reduce ? { opacity: 0 } : textIn} animate={shown} exit={reduce ? ({ opacity: 0, transition: { duration: motionTokens.reduced.duration } }) : textOut} transition={reduce ? ({ duration: motionTokens.reduced.duration }) : enter}>{announcement}</Swap> : null}</AnimatePresence></p>
    </motion.div>
    {/* Rows open and close their own height, so the list closes the gap when a file is removed. */}
    <motion.ul className={styles.fileList} aria-label="Selected files" aria-hidden={files.length === 0 ? true : undefined} initial={files.length ? openList : closedList} animate={list} transition={motionTokens.spring.smooth}>
      <AnimatePresence initial={false}>
        {files.map(item => <FileListRow key={item.id} reduce={reduce}>
          <FileRow item={item} upload={uploads[item.id]} reduce={reduce} onRemove={() => removeFile(item)} onRetry={() => startUpload(item)} removeRef={node => { if (node) removeRefs.current.set(item.id, node); else removeRefs.current.delete(item.id); }} />
        </FileListRow>)}
      </AnimatePresence>
    </motion.ul>
  </div>;
}

export default FileUpload;
