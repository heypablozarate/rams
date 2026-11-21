"use client";
import * as React from "react";
import { Select as R } from "radix-ui";
import { cx } from "./utils";
import { floatingPlacement } from "./floating-placement";
import { MenuCheckIcon } from "./menu-parts";
import "./primitives.css";
import "./menus.css";
export const Select = R.Root,
  SelectGroup = R.Group;
// Radix Value discards className/style; canonical styling targets its retained data-slot.
export const SelectValue = React.forwardRef<
  React.ElementRef<typeof R.Value>,
  React.ComponentPropsWithoutRef<typeof R.Value>
>(function SelectValue({ className, ...props }, ref) {
  return (
    <R.Value
      {...props}
      ref={ref}
      className={cx("rams-select__value", className)}
      data-slot="select-value"
    />
  );
});
function Arrow({ up = false }: { up?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="rams-select__chevron">
      <path
        d={up ? "m4 10 4-4 4 4" : "m4 6 4 4 4-4"}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
export type SelectTriggerProps = React.ComponentPropsWithoutRef<
  typeof R.Trigger
> & { size?: "sm" | "default" };
export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof R.Trigger>,
  SelectTriggerProps
>(function SelectTrigger(
  { asChild = false, children, className, size = "default", ...props },
  ref,
) {
  const icon = (
    <R.Icon asChild>
      <span className="rams-select__arrow">
        <Arrow />
      </span>
    </R.Icon>
  );
  const body = asChild ? (
    React.cloneElement(
      React.Children.only(children) as React.ReactElement<{
        children?: React.ReactNode;
      }>,
      undefined,
      (children as React.ReactElement<{ children?: React.ReactNode }>).props
        .children,
      icon,
    )
  ) : (
    <>
      {children}
      {icon}
    </>
  );
  return (
    <R.Trigger
      {...props}
      ref={ref}
      asChild={asChild}
      className={cx("rams-select__trigger", className)}
      data-size={size}
      data-slot="select-trigger"
      data-rams-primitive="true"
    >
      {body}
    </R.Trigger>
  );
});
export const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof R.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof R.ScrollUpButton>
>(function SelectScrollUpButton({ children, className, ...props }, ref) {
  return (
    <R.ScrollUpButton
      {...props}
      ref={ref}
      className={cx("rams-select__scroll", className)}
      data-slot="select-scroll-up"
    >
      {children ?? <Arrow up />}
    </R.ScrollUpButton>
  );
});
export const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof R.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof R.ScrollDownButton>
>(function SelectScrollDownButton({ children, className, ...props }, ref) {
  return (
    <R.ScrollDownButton
      {...props}
      ref={ref}
      className={cx("rams-select__scroll", className)}
      data-slot="select-scroll-down"
    >
      {children ?? <Arrow />}
    </R.ScrollDownButton>
  );
});
export const SelectContent = React.forwardRef<
  React.ElementRef<typeof R.Content>,
  React.ComponentPropsWithoutRef<typeof R.Content>
>(function SelectContent(
  {
    asChild = false,
    children,
    className,
    position = "popper",
    sideOffset = floatingPlacement.nativeSelect.anchorGapPx,
    collisionPadding = floatingPlacement.nativeSelect.collisionInsetPx,
    ...props
  },
  ref,
) {
  const child = asChild
    ? (React.Children.only(children) as React.ReactElement<{
        children?: React.ReactNode;
      }>)
    : null;
  const body = (
    <>
      <SelectScrollUpButton />
      <R.Viewport className="rams-select__viewport" data-slot="select-viewport">
        {child ? child.props.children : children}
      </R.Viewport>
      <SelectScrollDownButton />
    </>
  );
  return (
    <R.Portal>
      <R.Content
        {...props}
        ref={ref}
        asChild={asChild}
        position={position}
        {...(position === "popper" ? { sideOffset, collisionPadding } : {})}
        className={cx("rams-select__content", className)}
        data-slot="select-content"
        data-rams-primitive="true"
      >
        {child ? React.cloneElement(child, undefined, body) : body}
      </R.Content>
    </R.Portal>
  );
});
export const SelectLabel = React.forwardRef<
  React.ElementRef<typeof R.Label>,
  React.ComponentPropsWithoutRef<typeof R.Label>
>(function SelectLabel({ className, ...props }, ref) {
  return (
    <R.Label
      {...props}
      ref={ref}
      className={cx("rams-menu__label", className)}
      data-slot="select-label"
      data-rams-primitive="true"
    />
  );
});
export const SelectItem = React.forwardRef<
  React.ElementRef<typeof R.Item>,
  React.ComponentPropsWithoutRef<typeof R.Item>
>(function SelectItem({ asChild = false, children, className, ...props }, ref) {
  const child = asChild
    ? (React.Children.only(children) as React.ReactElement<{
        children?: React.ReactNode;
      }>)
    : null;
  const body = (
    <>
      <R.ItemText>{child ? child.props.children : children}</R.ItemText>
      <R.ItemIndicator className="rams-select__indicator" aria-hidden="true">
        <MenuCheckIcon />
      </R.ItemIndicator>
    </>
  );
  return (
    <R.Item
      {...props}
      ref={ref}
      asChild={asChild}
      className={cx("rams-select__item", className)}
      data-slot="select-item"
      data-rams-primitive="true"
    >
      {child ? React.cloneElement(child, undefined, body) : body}
    </R.Item>
  );
});
export const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof R.Separator>,
  React.ComponentPropsWithoutRef<typeof R.Separator>
>(function SelectSeparator({ className, ...props }, ref) {
  return (
    <R.Separator
      {...props}
      ref={ref}
      className={cx("rams-menu__separator", className)}
      data-slot="select-separator"
    />
  );
});
