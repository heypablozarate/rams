"use client";

import * as React from "react";
import { useComposedRefs } from "@radix-ui/react-compose-refs";
import { floatingPlacement } from "./floating-placement";

// A menu's available-height cap can shrink while the same item keeps focus.
// Radix scrolls on focus changes; reveal that existing item on viewport resize
// too, without moving focus or responding to intentional local wheel scrolling.
export function useMenuViewportRevealRef(
  forwardedRef?: React.ForwardedRef<HTMLDivElement>,
) {
  const [node, setNode] = React.useState<HTMLDivElement | null>(null);
  const ref = useComposedRefs(setNode, forwardedRef);
  React.useLayoutEffect(() => {
    if (!node || typeof ResizeObserver === "undefined") return;
    const reveal = () => {
      const active = node.ownerDocument.activeElement;
      if (!(active instanceof HTMLElement) || active === node) return;
      // A portaled submenu owns focus, but its parent must still reveal the
      // submenu trigger when the parent's available height shrinks.
      const submenu = active.closest('[role="menu"]');
      const triggerId = submenu?.getAttribute('aria-labelledby');
      const trigger = triggerId ? node.ownerDocument.getElementById(triggerId) : null;
      const target = node.contains(active) ? active : trigger && node.contains(trigger) ? trigger : null;
      if (!target) return;
      const panel = node.getBoundingClientRect(), item = target.getBoundingClientRect();
      const scale = node.offsetHeight ? panel.height / node.offsetHeight : 1;
      if (!Number.isFinite(scale) || scale <= 0) return;
      const style = getComputedStyle(node);
      const top = panel.top + (node.clientTop + parseFloat(style.paddingTop)) * scale;
      const bottom = panel.top + (node.clientTop + node.clientHeight - parseFloat(style.paddingBottom)) * scale;
      const delta = item.top < top ? (item.top - top) / scale : item.bottom > bottom ? (item.bottom - bottom) / scale : 0;
      if (Number.isFinite(delta) && Math.abs(delta) > 0.5) node.scrollTop += delta;
    };
    const observer = new ResizeObserver(reveal);
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);
  return ref;
}

export function MenuCheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
      <path
        d="m3.25 8.25 3 3 6.5-6.5"
        stroke="currentColor"
        style={{ strokeWidth: "var(--rams-detail-menu-indicator-stroke-width)" }}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MenuMinusIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
      <path
        d="M3.5 8h9"
        stroke="currentColor"
        style={{ strokeWidth: "var(--rams-detail-menu-indicator-stroke-width)" }}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MenuRadioIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="3" fill="currentColor" />
    </svg>
  );
}

export function MenuChevronIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
      <path
        d="m6 3.5 4.5 4.5L6 12.5"
        stroke="currentColor"
        style={{ strokeWidth: "var(--rams-detail-menu-chevron-stroke-width)" }}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function appendMenuDecoration(
  children: React.ReactNode,
  decoration: React.ReactNode,
  asChild = false,
): React.ReactNode {
  if (asChild) {
    const child = React.Children.only(children);
    if (!React.isValidElement<{ children?: React.ReactNode }>(child)) {
      throw new Error("Menu asChild requires one valid React element.");
    }
    return React.cloneElement(
      child,
      undefined,
      child.props.children,
      decoration,
    );
  }
  return (
    <>
      {children}
      {decoration}
    </>
  );
}

export const MenuShortcut = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(function MenuShortcut({ className, ...props }, ref) {
  return (
    <span
      {...props}
      ref={ref}
      data-rams-primitive="true"
      data-slot="menu-shortcut"
      className={["rams-menu__shortcut", className].filter(Boolean).join(" ")}
    />
  );
});
MenuShortcut.displayName = "MenuShortcut";

// A pointer left over another item must not pull keyboard focus out of the
// submenu it is now entering. All other exits retain the native menu behavior.
export function menuPointerLeave(
  handler?: React.PointerEventHandler<HTMLElement>,
): React.PointerEventHandler<HTMLElement> {
  return (event) => {
    handler?.(event);
    if (event.defaultPrevented) return;
    const document = event.currentTarget.ownerDocument;
    const next = event.relatedTarget;
    const Node = document.defaultView?.Node;
    if (!Node || !(next instanceof Node)) return;
    const submenu = document.activeElement?.closest<HTMLElement>(
      '[data-slot$="-sub-content"][data-state="open"]',
    );
    const parent = event.currentTarget.closest('[role="menu"]');
    const triggerId = submenu?.getAttribute("aria-labelledby");
    const trigger = triggerId ? document.getElementById(triggerId) : null;
    if (submenu?.contains(next) && trigger?.closest('[role="menu"]') === parent)
      event.preventDefault();
  };
}

// Radix flips side menus but does not shift across their horizontal axis.
// When neither side fits, overlap the parent rather than clip the submenu.
// Keep its placement transform and keyboard/focus ownership with Radix.
export function useSubmenuViewportRef(
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
  collisionPadding: number | { left?: number; right?: number } = floatingPlacement.nativeMenu.collisionInsetPx,
) {
  const leftInset = typeof collisionPadding === "number" ? collisionPadding : (collisionPadding.left ?? 0);
  const rightInset = typeof collisionPadding === "number" ? collisionPadding : (collisionPadding.right ?? 0);
  const [node, setNode] = React.useState<HTMLDivElement | null>(null);
  const actual = React.useRef<HTMLDivElement | null>(null);
  const capture = React.useCallback((element: HTMLDivElement | null) => {
    actual.current = element;
    setNode(element);
  }, []);
  React.useImperativeHandle(forwardedRef, () => actual.current!, [node]);
  React.useLayoutEffect(() => {
    if (!node) return;
    const wrapper = node.parentElement;
    if (!wrapper?.hasAttribute("data-radix-popper-content-wrapper")) return;
    const previousTranslate = wrapper.style.translate;
    const previousPriority = wrapper.style.getPropertyPriority("translate");
    let shift = 0;
    const update = () => {
      const rect = wrapper.getBoundingClientRect();
      const viewport = node.ownerDocument.documentElement.clientWidth;
      if (!rect.width || !viewport || !Number.isFinite(rect.left)) return;
      const left = rect.left - shift;
      const target = Math.max(leftInset, Math.min(left, viewport - rect.width - rightInset));
      const next = Math.round((target - left) * 100) / 100;
      if (Math.abs(next - shift) < 0.1) return;
      shift = next;
      wrapper.style.translate = `${shift}px 0`;
    };
    update();
    const size = new ResizeObserver(update);
    size.observe(node);
    const placement = new MutationObserver(update);
    placement.observe(wrapper, {
      attributes: true,
      attributeFilter: ["style"],
    });
    const view = node.ownerDocument.defaultView;
    view?.addEventListener("resize", update);
    return () => {
      size.disconnect();
      placement.disconnect();
      view?.removeEventListener("resize", update);
      if (previousTranslate)
        wrapper.style.setProperty(
          "translate",
          previousTranslate,
          previousPriority,
        );
      else wrapper.style.removeProperty("translate");
    };
  }, [node, leftInset, rightInset]);
  return capture;
}
