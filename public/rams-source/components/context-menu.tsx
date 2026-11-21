"use client";

import * as React from "react";
import { ContextMenu as Primitive } from "radix-ui";
import "./primitives.css";
import "./menus.css";
import { cx } from "./utils";
import { floatingPlacement } from "./floating-placement";
import {
  appendMenuDecoration,
  menuPointerLeave,
  useSubmenuViewportRef,
  MenuCheckIcon,
  MenuChevronIcon,
  MenuMinusIcon,
  MenuRadioIcon,
  MenuShortcut,
} from "./menu-parts";

export const ContextMenu = Primitive.Root;
export const ContextMenuPortal = Primitive.Portal;
export const ContextMenuSub = Primitive.Sub;
export const ContextMenuRadioGroup = Primitive.RadioGroup;

export type ContextMenuTriggerProps = React.ComponentPropsWithoutRef<
  typeof Primitive.Trigger
>;
export const ContextMenuTrigger = React.forwardRef<
  React.ElementRef<typeof Primitive.Trigger>,
  ContextMenuTriggerProps
>(function ContextMenuTrigger({ className, disabled, onKeyDown, ...props }, ref) {
  return (
    <Primitive.Trigger
      {...props}
      ref={ref}
      disabled={disabled}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (
          event.defaultPrevented ||
          disabled ||
          (event.key !== "ContextMenu" && !(event.shiftKey && event.key === "F10"))
        ) return;
        // Use Radix's contextmenu path for focus and virtual-anchor placement.
        // Cancel the native key default so the browser cannot also open it.
        event.preventDefault();
        if (event.repeat || event.currentTarget.dataset.state === "open") return;
        const trigger = event.currentTarget;
        const bounds = trigger.getBoundingClientRect();
        const view = trigger.ownerDocument.defaultView;
        if (!view) return;
        const rtl = view.getComputedStyle(trigger).direction === "rtl";
        trigger.dispatchEvent(new view.MouseEvent("contextmenu", {
          bubbles: true,
          cancelable: true,
          clientX: rtl ? bounds.right : bounds.left,
          clientY: bounds.top,
        }));
      }}
      data-rams-primitive="true"
      data-slot="context-menu-trigger"
      className={cx("rams-menu__trigger", className)}
    />
  );
});
ContextMenuTrigger.displayName = "ContextMenuTrigger";

export type ContextMenuContentProps = React.ComponentPropsWithoutRef<
  typeof Primitive.Content
>;

// Fixed CSS pixels can seed the portal before layout. The probe resolves relative
// lengths and inherited overrides as soon as the panel is mounted.
function initialPixels(length: string, fallback: number) {
  const value = Number.parseFloat(length);
  return /^(?:\d+(?:\.\d+)?|\.\d+)px$/i.test(length) && Number.isFinite(value) ? value : fallback;
}

const contextDefaults = floatingPlacement.nativeContextMenu;

function useContextMenuPlacement(ref: React.ForwardedRef<HTMLDivElement>, collisionPadding: ContextMenuContentProps["collisionPadding"], sideOffset?: number) {
  const [panel, setPanel] = React.useState<HTMLDivElement | null>(null);
  const [placement, setPlacement] = React.useState({
    collision: initialPixels(contextDefaults.viewportInset, floatingPlacement.nativeMenu.collisionInsetPx),
    offset: initialPixels(contextDefaults.submenuOffset, floatingPlacement.nativeMenu.anchorGapPx),
  });
  const collision = collisionPadding ?? placement.collision;
  const viewportRef = useSubmenuViewportRef(ref, collision);
  const capture = React.useCallback((node: HTMLDivElement | null) => {
    setPanel(node);
    viewportRef(node);
  }, [viewportRef]);
  React.useLayoutEffect(() => {
    if (!panel || (collisionPadding !== undefined && sideOffset !== undefined)) return;
    const view = panel.ownerDocument.defaultView;
    if (!view) return;
    const probe = panel.ownerDocument.createElement("span");
    probe.setAttribute("aria-hidden", "true");
    Object.assign(probe.style, {
      position: "absolute",
      inset: "0 auto auto 0",
      visibility: "hidden",
      pointerEvents: "none",
      width: `var(--rams-detail-context-menu-viewport-inset, ${contextDefaults.viewportInset})`,
      height: `var(--rams-detail-context-menu-submenu-offset, ${contextDefaults.submenuOffset})`,
    });
    panel.append(probe);
    const measure = () => {
      const { width, height } = view.getComputedStyle(probe);
      const next = {
        collision: parseFloat(width),
        offset: parseFloat(height),
      };
      if (!Number.isFinite(next.collision) || !Number.isFinite(next.offset)) return;
      setPlacement((current) => current.collision === next.collision && current.offset === next.offset ? current : next);
    };
    measure();
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(measure);
    observer?.observe(probe);
    return () => {
      observer?.disconnect();
      probe.remove();
    };
  }, [panel, collisionPadding, sideOffset]);
  return { ref: capture, collision, sideOffset: sideOffset ?? placement.offset };
}

export const ContextMenuContent = React.forwardRef<
  React.ElementRef<typeof Primitive.Content>,
  ContextMenuContentProps
>(function ContextMenuContent(
  { className, collisionPadding, forceMount, ...props },
  ref,
) {
  // A context point can leave insufficient room on either horizontal side.
  // Reuse the menu viewport constraint without changing native placement/focus.
  const placement = useContextMenuPlacement(ref, collisionPadding);
  return (
    <Primitive.Portal forceMount={forceMount}>
      <Primitive.Content
        {...props}
        ref={placement.ref}
        forceMount={forceMount}
        collisionPadding={placement.collision}
        data-rams-primitive="true"
        data-slot="context-menu-content"
        className={cx("rams-menu__content", className)}
      />
    </Primitive.Portal>
  );
});
ContextMenuContent.displayName = "ContextMenuContent";

export type ContextMenuItemProps = React.ComponentPropsWithoutRef<
  typeof Primitive.Item
> & { inset?: boolean; variant?: "default" | "destructive" };
export const ContextMenuItem = React.forwardRef<
  React.ElementRef<typeof Primitive.Item>,
  ContextMenuItemProps
>(function ContextMenuItem(
  { asChild, className, inset = false, variant = "default", ...props },
  ref,
) {
  return (
    <Primitive.Item
      {...props}
      onPointerLeave={menuPointerLeave(props.onPointerLeave)}
      ref={ref}
      asChild={asChild}
      data-rams-primitive="true"
      data-slot="context-menu-item"
      data-inset={inset || undefined}
      data-variant={variant}
      className={cx("rams-menu__item", className)}
    />
  );
});
ContextMenuItem.displayName = "ContextMenuItem";

export type ContextMenuCheckboxItemProps = React.ComponentPropsWithoutRef<
  typeof Primitive.CheckboxItem
> & { inset?: boolean; variant?: "default" | "destructive" };
export const ContextMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof Primitive.CheckboxItem>,
  ContextMenuCheckboxItemProps
>(function ContextMenuCheckboxItem(
  {
    asChild,
    checked,
    children,
    className,
    inset = false,
    variant = "default",
    ...props
  },
  ref,
) {
  const icon =
    checked === "indeterminate" ? <MenuMinusIcon /> : <MenuCheckIcon />;
  const decoration = (
    <Primitive.ItemIndicator
      className="rams-menu__indicator"
      data-rams-primitive="true"
      data-slot="menu-item-indicator"
    >
      {icon}
    </Primitive.ItemIndicator>
  );
  return (
    <Primitive.CheckboxItem
      {...props}
      onPointerLeave={menuPointerLeave(props.onPointerLeave)}
      ref={ref}
      checked={checked}
      asChild={asChild}
      data-rams-primitive="true"
      data-slot="context-menu-checkbox-item"
      data-inset={inset || undefined}
      data-variant={variant}
      className={cx("rams-menu__item", className)}
    >
      {appendMenuDecoration(children, decoration, asChild)}
    </Primitive.CheckboxItem>
  );
});
ContextMenuCheckboxItem.displayName = "ContextMenuCheckboxItem";

export type ContextMenuRadioItemProps = React.ComponentPropsWithoutRef<
  typeof Primitive.RadioItem
> & { inset?: boolean; variant?: "default" | "destructive" };
export const ContextMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof Primitive.RadioItem>,
  ContextMenuRadioItemProps
>(function ContextMenuRadioItem(
  {
    asChild,
    children,
    className,
    inset = false,
    variant = "default",
    ...props
  },
  ref,
) {
  const decoration = (
    <Primitive.ItemIndicator
      className="rams-menu__indicator"
      data-rams-primitive="true"
      data-slot="menu-item-indicator"
    >
      <MenuRadioIcon />
    </Primitive.ItemIndicator>
  );
  return (
    <Primitive.RadioItem
      {...props}
      onPointerLeave={menuPointerLeave(props.onPointerLeave)}
      ref={ref}
      asChild={asChild}
      data-rams-primitive="true"
      data-slot="context-menu-radio-item"
      data-inset={inset || undefined}
      data-variant={variant}
      className={cx("rams-menu__item", className)}
    >
      {appendMenuDecoration(children, decoration, asChild)}
    </Primitive.RadioItem>
  );
});
ContextMenuRadioItem.displayName = "ContextMenuRadioItem";

export type ContextMenuLabelProps = React.ComponentPropsWithoutRef<
  typeof Primitive.Label
> & { inset?: boolean };
export const ContextMenuLabel = React.forwardRef<
  React.ElementRef<typeof Primitive.Label>,
  ContextMenuLabelProps
>(function ContextMenuLabel({ className, inset = false, ...props }, ref) {
  return (
    <Primitive.Label
      {...props}
      ref={ref}
      data-rams-primitive="true"
      data-slot="context-menu-label"
      data-inset={inset || undefined}
      className={cx("rams-menu__label", className)}
    />
  );
});
ContextMenuLabel.displayName = "ContextMenuLabel";

export type ContextMenuSeparatorProps = React.ComponentPropsWithoutRef<
  typeof Primitive.Separator
>;
export const ContextMenuSeparator = React.forwardRef<
  React.ElementRef<typeof Primitive.Separator>,
  ContextMenuSeparatorProps
>(function ContextMenuSeparator({ className, ...props }, ref) {
  return (
    <Primitive.Separator
      {...props}
      ref={ref}
      data-rams-primitive="true"
      data-slot="context-menu-separator"
      className={cx("rams-menu__separator", className)}
    />
  );
});
ContextMenuSeparator.displayName = "ContextMenuSeparator";

export const ContextMenuGroup = Primitive.Group;
export const ContextMenuItemIndicator = Primitive.ItemIndicator;
export const ContextMenuArrow = Primitive.Arrow;

export type ContextMenuSubTriggerProps = React.ComponentPropsWithoutRef<
  typeof Primitive.SubTrigger
> & { inset?: boolean };
export const ContextMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof Primitive.SubTrigger>,
  ContextMenuSubTriggerProps
>(function ContextMenuSubTrigger(
  { asChild, children, className, inset = false, ...props },
  ref,
) {
  return (
    <Primitive.SubTrigger
      {...props}
      ref={ref}
      asChild={asChild}
      data-rams-primitive="true"
      data-slot="context-menu-sub-trigger"
      data-inset={inset || undefined}
      className={cx("rams-menu__sub-trigger", className)}
    >
      {appendMenuDecoration(
        children,
        <span aria-hidden="true" className="rams-menu__chevron">
          <MenuChevronIcon />
        </span>,
        asChild,
      )}
    </Primitive.SubTrigger>
  );
});
ContextMenuSubTrigger.displayName = "ContextMenuSubTrigger";

export type ContextMenuSubContentProps = React.ComponentPropsWithoutRef<
  typeof Primitive.SubContent
>;
export const ContextMenuSubContent = React.forwardRef<
  React.ElementRef<typeof Primitive.SubContent>,
  ContextMenuSubContentProps
>(function ContextMenuSubContent(
  { collisionPadding, className, forceMount, sideOffset, ...props },
  ref,
) {
  const placement = useContextMenuPlacement(ref, collisionPadding, sideOffset);
  return (
    <Primitive.Portal forceMount={forceMount}>
      <Primitive.SubContent
        {...props}
        ref={placement.ref}
        forceMount={forceMount}
        sideOffset={placement.sideOffset}
        collisionPadding={placement.collision}
        data-rams-primitive="true"
        data-slot="context-menu-sub-content"
        className={cx("rams-menu__content", className)}
      />
    </Primitive.Portal>
  );
});
ContextMenuSubContent.displayName = "ContextMenuSubContent";

export { MenuShortcut as ContextMenuShortcut };
