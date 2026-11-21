"use client";

import * as React from "react";
import { Menubar as Primitive } from "radix-ui";
import "./primitives.css";
import "./menus.css";
import { cx } from "./utils";
import { Button } from "./button";
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

export type MenubarProps = React.ComponentPropsWithoutRef<
  typeof Primitive.Root
>;
export const Menubar = React.forwardRef<
  React.ElementRef<typeof Primitive.Root>,
  MenubarProps
>(function Menubar({ className, ...props }, ref) {
  return (
    <Primitive.Root
      {...props}
      ref={ref}
      data-rams-primitive="true"
      data-slot="menubar"
      className={cx("rams-menubar", className)}
    />
  );
});
Menubar.displayName = "Menubar";

export const MenubarMenu = Primitive.Menu;
export const MenubarPortal = Primitive.Portal;
export const MenubarSub = Primitive.Sub;
export const MenubarRadioGroup = Primitive.RadioGroup;

export type MenubarTriggerProps = React.ComponentPropsWithoutRef<
  typeof Primitive.Trigger
>;
export const MenubarTrigger = React.forwardRef<
  React.ElementRef<typeof Primitive.Trigger>,
  MenubarTriggerProps
>(function MenubarTrigger(
  { asChild = false, children, className, ...props },
  ref,
) {
  return (
    <Primitive.Trigger
      {...props}
      ref={ref}
      asChild
      data-rams-primitive="true"
      data-slot="menubar-trigger"
      className={cx("rams-menubar__trigger", className)}
    >
      {asChild ? children : <Button variant="ghost">{children}</Button>}
    </Primitive.Trigger>
  );
});
MenubarTrigger.displayName = "MenubarTrigger";

export type MenubarContentProps = React.ComponentPropsWithoutRef<
  typeof Primitive.Content
>;
export const MenubarContent = React.forwardRef<
  React.ElementRef<typeof Primitive.Content>,
  MenubarContentProps
>(function MenubarContent(
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
  return (
    <Primitive.Portal forceMount={forceMount}>
      <Primitive.Content
        {...props}
        ref={ref}
        forceMount={forceMount}
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        data-rams-primitive="true"
        data-slot="menubar-content"
        className={cx("rams-menu__content", className)}
      />
    </Primitive.Portal>
  );
});
MenubarContent.displayName = "MenubarContent";

export type MenubarItemProps = React.ComponentPropsWithoutRef<
  typeof Primitive.Item
> & { inset?: boolean; variant?: "default" | "destructive" };
export const MenubarItem = React.forwardRef<
  React.ElementRef<typeof Primitive.Item>,
  MenubarItemProps
>(function MenubarItem(
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
      data-slot="menubar-item"
      data-inset={inset || undefined}
      data-variant={variant}
      className={cx("rams-menu__item", className)}
    />
  );
});
MenubarItem.displayName = "MenubarItem";

export type MenubarCheckboxItemProps = React.ComponentPropsWithoutRef<
  typeof Primitive.CheckboxItem
> & { inset?: boolean; variant?: "default" | "destructive" };
export const MenubarCheckboxItem = React.forwardRef<
  React.ElementRef<typeof Primitive.CheckboxItem>,
  MenubarCheckboxItemProps
>(function MenubarCheckboxItem(
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
      data-slot="menubar-checkbox-item"
      data-inset={inset || undefined}
      data-variant={variant}
      className={cx("rams-menu__item", className)}
    >
      {appendMenuDecoration(children, decoration, asChild)}
    </Primitive.CheckboxItem>
  );
});
MenubarCheckboxItem.displayName = "MenubarCheckboxItem";

export type MenubarRadioItemProps = React.ComponentPropsWithoutRef<
  typeof Primitive.RadioItem
> & { inset?: boolean; variant?: "default" | "destructive" };
export const MenubarRadioItem = React.forwardRef<
  React.ElementRef<typeof Primitive.RadioItem>,
  MenubarRadioItemProps
>(function MenubarRadioItem(
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
      data-slot="menubar-radio-item"
      data-inset={inset || undefined}
      data-variant={variant}
      className={cx("rams-menu__item", className)}
    >
      {appendMenuDecoration(children, decoration, asChild)}
    </Primitive.RadioItem>
  );
});
MenubarRadioItem.displayName = "MenubarRadioItem";

export type MenubarLabelProps = React.ComponentPropsWithoutRef<
  typeof Primitive.Label
> & { inset?: boolean };
export const MenubarLabel = React.forwardRef<
  React.ElementRef<typeof Primitive.Label>,
  MenubarLabelProps
>(function MenubarLabel({ className, inset = false, ...props }, ref) {
  return (
    <Primitive.Label
      {...props}
      ref={ref}
      data-rams-primitive="true"
      data-slot="menubar-label"
      data-inset={inset || undefined}
      className={cx("rams-menu__label", className)}
    />
  );
});
MenubarLabel.displayName = "MenubarLabel";

export type MenubarSeparatorProps = React.ComponentPropsWithoutRef<
  typeof Primitive.Separator
>;
export const MenubarSeparator = React.forwardRef<
  React.ElementRef<typeof Primitive.Separator>,
  MenubarSeparatorProps
>(function MenubarSeparator({ className, ...props }, ref) {
  return (
    <Primitive.Separator
      {...props}
      ref={ref}
      data-rams-primitive="true"
      data-slot="menubar-separator"
      className={cx("rams-menu__separator", className)}
    />
  );
});
MenubarSeparator.displayName = "MenubarSeparator";

export const MenubarGroup = Primitive.Group;
export const MenubarItemIndicator = Primitive.ItemIndicator;
export const MenubarArrow = Primitive.Arrow;

export type MenubarSubTriggerProps = React.ComponentPropsWithoutRef<
  typeof Primitive.SubTrigger
> & { inset?: boolean };
export const MenubarSubTrigger = React.forwardRef<
  React.ElementRef<typeof Primitive.SubTrigger>,
  MenubarSubTriggerProps
>(function MenubarSubTrigger(
  { asChild, children, className, inset = false, ...props },
  ref,
) {
  return (
    <Primitive.SubTrigger
      {...props}
      ref={ref}
      asChild={asChild}
      data-rams-primitive="true"
      data-slot="menubar-sub-trigger"
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
MenubarSubTrigger.displayName = "MenubarSubTrigger";

export type MenubarSubContentProps = React.ComponentPropsWithoutRef<
  typeof Primitive.SubContent
>;
export const MenubarSubContent = React.forwardRef<
  React.ElementRef<typeof Primitive.SubContent>,
  MenubarSubContentProps
>(function MenubarSubContent(
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
  return (
    <Primitive.Portal forceMount={forceMount}>
      <Primitive.SubContent
        {...props}
        ref={viewportRef}
        forceMount={forceMount}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        data-rams-primitive="true"
        data-slot="menubar-sub-content"
        className={cx("rams-menu__content", className)}
      />
    </Primitive.Portal>
  );
});
MenubarSubContent.displayName = "MenubarSubContent";

export { MenuShortcut as MenubarShortcut };
