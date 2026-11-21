"use client";

import * as React from "react";
import { DropdownMenu as Primitive } from "radix-ui";
import "./primitives.css";
import "./menus.css";
import { cx } from "./utils";
import { Button } from "./button";
import { floatingPlacement } from "./floating-placement";
import {
  appendMenuDecoration,
  menuPointerLeave,
  useMenuViewportRevealRef,
  useSubmenuViewportRef,
  MenuCheckIcon,
  MenuChevronIcon,
  MenuMinusIcon,
  MenuRadioIcon,
  MenuShortcut,
} from "./menu-parts";

export const DropdownMenu = Primitive.Root;
export const DropdownMenuPortal = Primitive.Portal;
export const DropdownMenuSub = Primitive.Sub;
export const DropdownMenuRadioGroup = Primitive.RadioGroup;

export type DropdownMenuTriggerProps = React.ComponentPropsWithoutRef<
  typeof Primitive.Trigger
>;
export const DropdownMenuTrigger = React.forwardRef<
  React.ElementRef<typeof Primitive.Trigger>,
  DropdownMenuTriggerProps
>(function DropdownMenuTrigger(
  { asChild = false, children, className, ...props },
  ref,
) {
  return (
    <Primitive.Trigger
      {...props}
      ref={ref}
      asChild
      data-rams-primitive="true"
      data-slot="dropdown-menu-trigger"
      className={cx("rams-menu__trigger", className)}
    >
      {asChild ? children : <Button variant="outline">{children}</Button>}
    </Primitive.Trigger>
  );
});
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

export type DropdownMenuContentProps = React.ComponentPropsWithoutRef<
  typeof Primitive.Content
>;
export const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof Primitive.Content>,
  DropdownMenuContentProps
>(function DropdownMenuContent(
  {
    align = "start",
    collisionPadding = floatingPlacement.nativeMenu.collisionInsetPx,
    className,
    forceMount,
    sideOffset = floatingPlacement.nativeMenu.anchorGapPx,
    ...props
  },
  ref,
) {
  const contentRef = useMenuViewportRevealRef(ref);
  return (
    <Primitive.Portal forceMount={forceMount}>
      <Primitive.Content
        {...props}
        ref={contentRef}
        forceMount={forceMount}
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        data-rams-primitive="true"
        data-slot="dropdown-menu-content"
        className={cx("rams-menu__content", className)}
      />
    </Primitive.Portal>
  );
});
DropdownMenuContent.displayName = "DropdownMenuContent";

export type DropdownMenuItemProps = React.ComponentPropsWithoutRef<
  typeof Primitive.Item
> & { inset?: boolean; variant?: "default" | "destructive" };
export const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof Primitive.Item>,
  DropdownMenuItemProps
>(function DropdownMenuItem(
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
  return (
    <Primitive.Item
      {...props}
      onPointerLeave={menuPointerLeave(props.onPointerLeave)}
      ref={ref}
      asChild={asChild}
      data-rams-primitive="true"
      data-slot="dropdown-menu-item"
      data-inset={inset || undefined}
      data-variant={variant}
      className={cx("rams-menu__item", className)}
    >
      {children}
    </Primitive.Item>
  );
});
DropdownMenuItem.displayName = "DropdownMenuItem";

export type DropdownMenuCheckboxItemProps = React.ComponentPropsWithoutRef<
  typeof Primitive.CheckboxItem
> & { inset?: boolean; variant?: "default" | "destructive" };
export const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof Primitive.CheckboxItem>,
  DropdownMenuCheckboxItemProps
>(function DropdownMenuCheckboxItem(
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
      data-slot="dropdown-menu-checkbox-item"
      data-inset={inset || undefined}
      data-variant={variant}
      className={cx("rams-menu__item", className)}
    >
      {appendMenuDecoration(children, decoration, asChild)}
    </Primitive.CheckboxItem>
  );
});
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

export type DropdownMenuRadioItemProps = React.ComponentPropsWithoutRef<
  typeof Primitive.RadioItem
> & { inset?: boolean; variant?: "default" | "destructive" };
export const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof Primitive.RadioItem>,
  DropdownMenuRadioItemProps
>(function DropdownMenuRadioItem(
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
      data-slot="dropdown-menu-radio-item"
      data-inset={inset || undefined}
      data-variant={variant}
      className={cx("rams-menu__item", className)}
    >
      {appendMenuDecoration(children, decoration, asChild)}
    </Primitive.RadioItem>
  );
});
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";

export type DropdownMenuLabelProps = React.ComponentPropsWithoutRef<
  typeof Primitive.Label
> & { inset?: boolean };
export const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof Primitive.Label>,
  DropdownMenuLabelProps
>(function DropdownMenuLabel({ className, inset = false, ...props }, ref) {
  return (
    <Primitive.Label
      {...props}
      ref={ref}
      data-rams-primitive="true"
      data-slot="dropdown-menu-label"
      data-inset={inset || undefined}
      className={cx("rams-menu__label", className)}
    />
  );
});
DropdownMenuLabel.displayName = "DropdownMenuLabel";

export type DropdownMenuSeparatorProps = React.ComponentPropsWithoutRef<
  typeof Primitive.Separator
>;
export const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof Primitive.Separator>,
  DropdownMenuSeparatorProps
>(function DropdownMenuSeparator({ className, ...props }, ref) {
  return (
    <Primitive.Separator
      {...props}
      ref={ref}
      data-rams-primitive="true"
      data-slot="dropdown-menu-separator"
      className={cx("rams-menu__separator", className)}
    />
  );
});
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

export const DropdownMenuGroup = Primitive.Group;
export const DropdownMenuItemIndicator = Primitive.ItemIndicator;
export const DropdownMenuArrow = Primitive.Arrow;

export type DropdownMenuSubTriggerProps = React.ComponentPropsWithoutRef<
  typeof Primitive.SubTrigger
> & { inset?: boolean };
export const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof Primitive.SubTrigger>,
  DropdownMenuSubTriggerProps
>(function DropdownMenuSubTrigger(
  { asChild, children, className, inset = false, ...props },
  ref,
) {
  return (
    <Primitive.SubTrigger
      {...props}
      ref={ref}
      asChild={asChild}
      data-rams-primitive="true"
      data-slot="dropdown-menu-sub-trigger"
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
DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger";

export type DropdownMenuSubContentProps = React.ComponentPropsWithoutRef<
  typeof Primitive.SubContent
>;
export const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof Primitive.SubContent>,
  DropdownMenuSubContentProps
>(function DropdownMenuSubContent(
  {
    collisionPadding = floatingPlacement.nativeMenu.collisionInsetPx,
    className,
    forceMount,
    sideOffset = floatingPlacement.nativeMenu.anchorGapPx,
    ...props
  },
  ref,
) {
  const viewportRef = useSubmenuViewportRef(ref);
  const contentRef = useMenuViewportRevealRef(viewportRef);
  return (
    <Primitive.Portal forceMount={forceMount}>
      <Primitive.SubContent
        {...props}
        ref={contentRef}
        forceMount={forceMount}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        data-rams-primitive="true"
        data-slot="dropdown-menu-sub-content"
        className={cx("rams-menu__content", className)}
      />
    </Primitive.Portal>
  );
});
DropdownMenuSubContent.displayName = "DropdownMenuSubContent";

export { MenuShortcut as DropdownMenuShortcut };
