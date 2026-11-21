"use client";
import "./motion-fields.css";

import { useId, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import { ChevronRight, File, Folder, FolderOpen } from "lucide-react";
import { AnimatePresence, motion, useIsPresent } from "motion/react";
import { motionTransition } from "./motion-policy";
import { useReducedMotion } from "./use-motion-preference";
import { MotionPresenceDiv, MotionPresenceSpan } from "./presence-controls";
import { treeViewGeometry } from "./tree-view-geometry";
import { motionTokens } from "./motion-tokens";
import styles from "./motion-tree-view.module.css";

export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  icon?: ReactNode;
}

export interface TreeViewProps {
  nodes: TreeNode[];
  defaultExpandedIds?: string[];
  expandedIds?: string[];
  onExpandedChange?: (expandedIds: string[]) => void;
  onSelect?: (node: TreeNode) => void;
  "aria-label"?: string;
}

type VisibleNode = {
  node: TreeNode;
  depth: number;
  parentId?: string;
  position: number;
  setSize: number;
};

/** A row combines the item and its preceding gap; both collapse together when a row leaves. */
const rowHeight = treeViewGeometry.rowBlockPx;
const fadeIn = { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.enter] } as const;
const fadeOut = { duration: motionTokens.duration.instant, ease: [...motionTokens.ease.standard] } as const;
const blur = (px: number) => `blur(${px}px)`;

function flatten(nodes: TreeNode[], expanded: ReadonlySet<string>, depth = 1, parentId?: string): VisibleNode[] {
  return nodes.flatMap((node, index) => [
    { node, depth, parentId, position: index + 1, setSize: nodes.length },
    ...(node.children && expanded.has(node.id) ? flatten(node.children, expanded, depth + 1, node.id) : []),
  ]);
}

function fileTone(label: string, classNames: Record<string, string>) {
  const name = label.toLowerCase();
  if (name.endsWith(".tsx") || name.endsWith(".ts")) return classNames.typescript;
  if (name.endsWith(".css")) return classNames.stylesheet;
  if (name.endsWith(".md")) return classNames.markdown;
  if (name.endsWith(".json")) return classNames.json;
  return classNames.file;
}

/** Same markup with or without reduced motion, so the server render always hydrates cleanly; only the transition changes. */
function FolderIcon({ open, reduced }: { open: boolean; reduced: boolean }) {
  return <AnimatePresence initial={false} mode="popLayout">
    <MotionPresenceSpan
      key={open ? "open" : "closed"}
      className={styles.folderGlyph}
      initial={reduced ? false : { opacity: 0, scale: motionTokens.keyframes.treeView.folderEnterScale, filter: blur(motionTokens.blur.subtle) }}
      animate={{ opacity: 1, scale: 1, filter: blur(0) }}
      exit={reduced ? { opacity: 0, transition: ({ duration: motionTokens.reduced.duration } as const) } : { opacity: 0, scale: motionTokens.keyframes.treeView.folderEnterScale, filter: blur(motionTokens.blur.subtle), transition: fadeOut }}
      transition={reduced ? ({ duration: motionTokens.reduced.duration } as const) : { ...motionTokens.spring.snappy, opacity: fadeIn, filter: fadeIn }}
    >{open ? <FolderOpen size="var(--rams-detail-tree-glyph-size)" strokeWidth="var(--rams-detail-tree-glyph-stroke)" /> : <Folder size="var(--rams-detail-tree-glyph-size)" strokeWidth="var(--rams-detail-tree-glyph-stroke)" />}</MotionPresenceSpan>
  </AnimatePresence>;
}

/**
 * The selection fill glides between rows through a shared layoutId. A row that is leaving drops its fill at once: left
 * in place, it held the row's exit open, so the row stayed in the tree with pointer events off and the next click on it
 * after reopening its folder did nothing.
 */
function Selection({ layoutId, reduced }: { layoutId: string; reduced: boolean }) {
  const present = useIsPresent();
  if (!present) return null;
  if (reduced) return <span aria-hidden="true" className={styles.selection} />;
  return <motion.span aria-hidden="true" layoutId={layoutId} className={styles.selection} transition={motionTransition("selection")} />;
}

export function TreeView({ nodes, defaultExpandedIds = [], expandedIds, onExpandedChange, onSelect, "aria-label": ariaLabel = "File tree" }: TreeViewProps) {
  const reduced = useReducedMotion() ?? false;
  const selectionLayoutId = `tree-selection-${useId()}`;
  const [internalExpanded, setInternalExpanded] = useState(() => new Set(defaultExpandedIds));
  const [focusedId, setFocusedId] = useState<string | null>(nodes[0]?.id ?? null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  /** The folder that opened last; its new children fade in one after another, then everything else stays still. */
  const [openedId, setOpenedId] = useState<string | null>(null);
  const refs = useRef(new Map<string, HTMLButtonElement>());
  const expanded = expandedIds ? new Set(expandedIds) : internalExpanded;
  const visible = flatten(nodes, expanded);
  const focusableId = visible.some(({ node }) => node.id === focusedId) ? focusedId : (visible[0]?.node.id ?? null);
  const openedIndex = visible.findIndex(({ node }) => node.id === openedId);
  const previousVisible = useRef(visible);
  useLayoutEffect(() => {
    const previous = previousVisible.current;
    previousVisible.current = visible;
    if (!focusedId || visible.some(({ node }) => node.id === focusedId)) return;
    const focused = refs.current.get(focusedId);
    if (!focused || focused.ownerDocument.activeElement !== focused) return;
    let parent = previous.find(({ node }) => node.id === focusedId)?.parentId;
    while (parent && !visible.some(({ node }) => node.id === parent)) {
      parent = previous.find(({ node }) => node.id === parent)?.parentId;
    }
    const target = parent ? refs.current.get(parent) : undefined;
    if (!target || !target.getClientRects().length || target.closest("[inert], [hidden]") || target.ownerDocument.defaultView?.getComputedStyle(target).visibility !== "visible") return;
    setFocusedId(parent!);
    target.focus({ preventScroll: true });
  });

  function setExpanded(next: Set<string>) {
    if (!expandedIds) setInternalExpanded(next);
    onExpandedChange?.([...next]);
  }

  function toggle(node: TreeNode) {
    if (!node.children?.length) return;
    const next = new Set(expanded);
    if (next.has(node.id)) next.delete(node.id); else { next.add(node.id); setOpenedId(node.id); }
    setExpanded(next);
  }

  function focus(id: string) {
    setFocusedId(id);
    const row = refs.current.get(id);
    if (row) row.focus();
    else requestAnimationFrame(() => refs.current.get(id)?.focus());
  }

  function select(node: TreeNode) {
    setSelectedId(node.id);
    onSelect?.(node);
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, item: VisibleNode, index: number) {
    const { node } = item;
    if (event.key === "ArrowDown") { event.preventDefault(); focus(visible[Math.min(index + 1, visible.length - 1)]!.node.id); return; }
    if (event.key === "ArrowUp") { event.preventDefault(); focus(visible[Math.max(index - 1, 0)]!.node.id); return; }
    if (event.key === "Home") { event.preventDefault(); focus(visible[0]!.node.id); return; }
    if (event.key === "End") { event.preventDefault(); focus(visible[visible.length - 1]!.node.id); return; }
    if (event.key === "ArrowRight" && node.children?.length) {
      event.preventDefault();
      if (!expanded.has(node.id)) toggle(node);
      else if (visible[index + 1]?.parentId === node.id) focus(visible[index + 1]!.node.id);
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      if (node.children?.length && expanded.has(node.id)) toggle(node);
      else if (item.parentId) focus(item.parentId);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      select(node);
      if (node.children?.length) toggle(node);
    }
  }

  return <div className={styles.tree} role="tree" aria-label={ariaLabel} aria-multiselectable="false">
    <AnimatePresence initial={false} mode="sync">
      {visible.map((item, index) => {
        const hasChildren = Boolean(item.node.children?.length);
        const isExpanded = hasChildren && expanded.has(item.node.id);
        const isSelected = selectedId === item.node.id;
        // Only rows that mount use this delay: the space opens in one motion and the new children follow in order.
        const delay = openedIndex >= 0 && index > openedIndex ? Math.min((index - openedIndex - 1) * motionTokens.stagger.item, motionTokens.sequence.maxStagger) : 0;
        return <MotionPresenceDiv
          key={item.node.id}
          className={styles.row}
          layout={reduced ? false : "position"}
          initial={reduced ? false : { height: 0, opacity: 0, x: motionTokens.keyframes.treeView.rowEnterPx, overflow: "hidden" }}
          animate={{ height: rowHeight, opacity: 1, x: 0, pointerEvents: "auto", transitionEnd: { overflow: "visible" }, transition: reduced ? ({ duration: motionTokens.reduced.duration } as const) : { height: motionTokens.spring.smooth, opacity: { ...fadeIn, delay }, x: { ...motionTokens.spring.smooth, delay } } }}
          exit={reduced ? { opacity: 0, transition: ({ duration: motionTokens.reduced.duration } as const) } : { height: 0, opacity: 0, x: motionTokens.keyframes.treeView.rowExitPx, overflow: "hidden", pointerEvents: "none", transition: { height: motionTokens.spring.smooth, opacity: fadeOut, x: fadeOut } }}
          transition={reduced ? ({ duration: motionTokens.reduced.duration } as const) : { layout: motionTokens.spring.smooth }}
        >
          <button
            ref={element => { if (element) refs.current.set(item.node.id, element); else refs.current.delete(item.node.id); }}
            type="button"
            className={styles.item}
            role="treeitem"
            aria-level={item.depth}
            aria-posinset={item.position}
            aria-setsize={item.setSize}
            aria-expanded={hasChildren ? isExpanded : undefined}
            aria-selected={isSelected}
            tabIndex={focusableId === item.node.id ? 0 : -1}
            style={{ "--rams-detail-tree-depth": item.depth } as CSSProperties}
            onFocus={() => setFocusedId(item.node.id)}
            onKeyDown={event => onKeyDown(event, item, index)}
            onClick={() => { setFocusedId(item.node.id); select(item.node); if (hasChildren) toggle(item.node); }}
          >
            {isSelected && <Selection layoutId={selectionLayoutId} reduced={reduced} />}
            {item.depth > 1 && <motion.span
              aria-hidden="true"
              className={styles.branch}
              initial={reduced ? false : { opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={reduced ? ({ duration: motionTokens.reduced.duration } as const) : { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter], delay }}
            />}
            <motion.span
              className={styles.disclosure}
              aria-hidden="true"
              initial={false}
              animate={{ rotate: isExpanded ? motionTokens.keyframes.disclosure.expandRightDeg : 0 }}
              transition={reduced ? ({ duration: motionTokens.reduced.duration } as const) : motionTokens.spring.snappy}
            >{hasChildren ? <ChevronRight size="var(--rams-detail-tree-disclosure-inline-size)" strokeWidth="var(--rams-detail-tree-disclosure-glyph-stroke)" /> : null}</motion.span>
            <span className={[styles.icon, hasChildren ? styles.folder : fileTone(item.node.label, styles)].join(" ")} aria-hidden="true">
              {item.node.icon ?? (hasChildren ? <FolderIcon open={isExpanded} reduced={reduced} /> : <File size="var(--rams-detail-tree-glyph-size)" strokeWidth="var(--rams-detail-tree-glyph-stroke)" />)}
            </span>
            <span className={styles.label}>{item.node.label}</span>
          </button>
        </MotionPresenceDiv>;
      })}
    </AnimatePresence>
  </div>;
}

export default TreeView;
