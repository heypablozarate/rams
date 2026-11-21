"use client";
import * as React from "react";
import { Drawer as V } from "vaul";
import { useComposedRefs } from "@radix-ui/react-compose-refs";
import { Button } from "./button";
import { cx } from "./utils";
import { surfaceDiv, CloseGlyph } from "./surface-parts";
import "./primitives.css";
import "./surfaces.css";
import "./drawers.css";

export const Drawer = V.Root,
  DrawerTrigger = V.Trigger,
  DrawerClose = V.Close,
  DrawerPortal = V.Portal;
export const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof V.Overlay>,
  React.ComponentPropsWithoutRef<typeof V.Overlay>
>(function DrawerOverlay({ className, ...props }, ref) {
  return (
    <V.Overlay
      {...props}
      ref={ref}
      className={cx("rams-drawer__overlay", className)}
      data-slot="drawer-overlay"
    />
  );
});
export type DrawerContentProps = React.ComponentPropsWithoutRef<
  typeof V.Content
> & { showCloseButton?: boolean };
export const DrawerContent = React.forwardRef<
  React.ElementRef<typeof V.Content>,
  DrawerContentProps
>(function DrawerContent(
  {
    asChild = false,
    children,
    className,
    showCloseButton = true,
    forceMount,
    onOpenAutoFocus,
    ...props
  },
  ref,
) {
  const node = React.useRef<HTMLDivElement>(null),
    composed = useComposedRefs(node, ref);
  const close = showCloseButton && (
    <V.Close asChild>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="rams-surface__close"
        aria-label="Close"
      >
        <CloseGlyph />
      </Button>
    </V.Close>
  );
  const body = (value: React.ReactNode) => (
    <div className="rams-drawer__body rams-surface__body" data-rams-primitive="true">
      {value}
      <span className="rams-drawer__grip" aria-hidden="true" />
      {close}
    </div>
  );
  const content = asChild
    ? (() => {
        const child = React.Children.only(children) as React.ReactElement<{
          children?: React.ReactNode;
        }>;
        return React.cloneElement(child, undefined, body(child.props.children));
      })()
    : body(children);
  return (
    <DrawerPortal forceMount={forceMount}>
      <DrawerOverlay forceMount={forceMount} />
      <V.Content
        tabIndex={-1}
        {...props}
        forceMount={forceMount}
        asChild={asChild}
        ref={composed}
        onOpenAutoFocus={(event) => {
          onOpenAutoFocus?.(event);
          if (!event.defaultPrevented) {
            event.preventDefault();
            node.current?.focus({ preventScroll: true });
          }
        }}
        className={cx("rams-drawer__content", className)}
        data-rams-primitive="true"
        data-slot="drawer-content"
        data-has-close={showCloseButton || undefined}
      >
        {content}
      </V.Content>
    </DrawerPortal>
  );
});
export const DrawerHeader = surfaceDiv(
  "drawer-header",
  "rams-surface__header rams-surface__header-gap",
);
export const DrawerFooter = surfaceDiv("drawer-footer", "rams-surface__footer");
export const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof V.Title>,
  React.ComponentPropsWithoutRef<typeof V.Title>
>(function DrawerTitle({ className, ...props }, ref) {
  return (
    <V.Title
      {...props}
      ref={ref}
      className={cx("rams-surface__title", className)}
      data-rams-primitive="true"
      data-slot="drawer-title"
    />
  );
});
export const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof V.Description>,
  React.ComponentPropsWithoutRef<typeof V.Description>
>(function DrawerDescription({ className, ...props }, ref) {
  return (
    <V.Description
      {...props}
      ref={ref}
      className={cx("rams-surface__description", className)}
      data-rams-primitive="true"
      data-slot="drawer-description"
    />
  );
});

export const DrawerBody = surfaceDiv("drawer-body", "rams-surface__body");
