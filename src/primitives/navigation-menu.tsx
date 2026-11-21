"use client";
import * as React from "react";
import { NavigationMenu as R } from "radix-ui";
import { cx } from "./utils";
import { buttonVariants } from "./button";
import { appendMenuDecoration, MenuChevronIcon } from "./menu-parts";
import "./primitives.css";
import "./menus.css";
export type NavigationMenuProps = React.ComponentPropsWithoutRef<
  typeof R.Root
> & { viewport?: boolean };
export const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof R.Root>,
  NavigationMenuProps
>(function NavigationMenu(
  { asChild = false, children, className, viewport = true, ...props },
  ref,
) {
  return (
    <R.Root
      {...props}
      ref={ref}
      asChild={asChild}
      className={cx("rams-navigation", className)}
      data-viewport={String(viewport)}
      data-slot="navigation-menu"
      data-rams-primitive="true"
    >
      {appendMenuDecoration(
        children,
        viewport && <NavigationMenuViewport />,
        asChild,
      )}
    </R.Root>
  );
});
export const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof R.List>,
  React.ComponentPropsWithoutRef<typeof R.List>
>(function NavigationMenuList({ className, ...props }, ref) {
  return (
    <R.List
      {...props}
      ref={ref}
      className={cx("rams-navigation__list", className)}
      data-slot="navigation-menu-list"
      data-rams-primitive="true"
    />
  );
});
export const NavigationMenuItem = React.forwardRef<
  React.ElementRef<typeof R.Item>,
  React.ComponentPropsWithoutRef<typeof R.Item>
>(function NavigationMenuItem({ className, ...props }, ref) {
  return (
    <R.Item
      {...props}
      ref={ref}
      className={cx("rams-navigation__item", className)}
      data-slot="navigation-menu-item"
    />
  );
});
export function navigationMenuTriggerStyle(
  options: { className?: string; class?: string } = {},
) {
  return buttonVariants({
    variant: "ghost",
    className: cx("rams-navigation__trigger", options.className, options.class),
  });
}
export const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof R.Trigger>,
  React.ComponentPropsWithoutRef<typeof R.Trigger>
>(function NavigationMenuTrigger(
  { asChild = false, children, className, ...props },
  ref,
) {
  return (
    <R.Trigger
      {...props}
      ref={ref}
      asChild={asChild}
      className={navigationMenuTriggerStyle({ className })}
      data-slot="navigation-menu-trigger"
      data-rams-primitive="true"
    >
      {appendMenuDecoration(
        children,
        <span className="rams-navigation__chevron">
          <MenuChevronIcon />
        </span>,
        asChild,
      )}
    </R.Trigger>
  );
});
export const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof R.Content>,
  React.ComponentPropsWithoutRef<typeof R.Content>
>(function NavigationMenuContent({ className, ...props }, ref) {
  return (
    <R.Content
      {...props}
      ref={ref}
      className={cx("rams-navigation__content", className)}
      data-slot="navigation-menu-content"
      data-rams-primitive="true"
    />
  );
});
export const NavigationMenuLink = React.forwardRef<
  React.ElementRef<typeof R.Link>,
  React.ComponentPropsWithoutRef<typeof R.Link>
>(function NavigationMenuLink({ className, ...props }, ref) {
  return (
    <R.Link
      {...props}
      ref={ref}
      className={cx("rams-navigation__link", className)}
      data-slot="navigation-menu-link"
      data-rams-primitive="true"
    />
  );
});
export const NavigationMenuViewport = React.forwardRef<
  React.ElementRef<typeof R.Viewport>,
  React.ComponentPropsWithoutRef<typeof R.Viewport>
>(function NavigationMenuViewport({ className, ...props }, ref) {
  return (
    <R.Viewport
      {...props}
      ref={ref}
      className={cx("rams-navigation__viewport", className)}
      data-slot="navigation-menu-viewport"
      data-rams-primitive="true"
    />
  );
});
export const NavigationMenuIndicator = React.forwardRef<
  React.ElementRef<typeof R.Indicator>,
  React.ComponentPropsWithoutRef<typeof R.Indicator>
>(function NavigationMenuIndicator(
  { asChild = false, children, className, ...props },
  ref,
) {
  return (
    <R.Indicator
      {...props}
      ref={ref}
      asChild={asChild}
      className={cx("rams-navigation__indicator", className)}
      data-slot="navigation-menu-indicator"
    >
      {appendMenuDecoration(
        children,
        <span aria-hidden="true" className="rams-navigation__pointer" />,
        asChild,
      )}
    </R.Indicator>
  );
});
