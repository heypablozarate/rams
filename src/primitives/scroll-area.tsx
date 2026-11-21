"use client";

import * as React from "react";
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui";
import "./primitives.css";
import "./media.css";
import { cx } from "./utils";

export type ScrollAreaBars = "vertical" | "horizontal" | "both";

export interface ScrollAreaProps extends Omit<
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>,
  "asChild" | "children"
> {
  children?: React.ReactNode;
  scrollbars?: ScrollAreaBars;
  viewportProps?: Omit<
    React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Viewport>,
    "asChild" | "children"
  >;
  viewportRef?: React.Ref<HTMLDivElement>;
}

export const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  ScrollAreaProps
>(function ScrollArea(
  {
    children,
    className,
    scrollbars = "vertical",
    viewportProps,
    viewportRef,
    ...rootProps
  },
  ref,
) {
  const {
    className: viewportClassName,
    tabIndex,
    role,
    ...otherViewportProps
  } = viewportProps ?? {};
  return (
    <ScrollAreaPrimitive.Root
      {...rootProps}
      ref={ref}
      data-rams-primitive="true"
      data-slot="scroll-area"
      className={cx("rams-scroll-area", className)}
    >
      <ScrollAreaPrimitive.Viewport
        {...otherViewportProps}
        ref={viewportRef}
        tabIndex={tabIndex ?? 0}
        role={role ?? "region"}
        data-rams-primitive="true"
        data-slot="scroll-area-viewport"
        className={cx("rams-scroll-area__viewport", viewportClassName)}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      {scrollbars === "vertical" || scrollbars === "both" ? (
        <ScrollBar orientation="vertical" />
      ) : null}
      {scrollbars === "horizontal" || scrollbars === "both" ? (
        <ScrollBar orientation="horizontal" />
      ) : null}
      {scrollbars === "both" ? (
        <ScrollAreaPrimitive.Corner
          data-rams-primitive="true"
          data-slot="scroll-area-corner"
          className="rams-scroll-area__corner"
        />
      ) : null}
    </ScrollAreaPrimitive.Root>
  );
});
ScrollArea.displayName = "ScrollArea";

export interface ScrollBarProps extends Omit<
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Scrollbar>,
  "asChild" | "children"
> {}

export const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Scrollbar>,
  ScrollBarProps
>(function ScrollBar({ className, orientation = "vertical", ...props }, ref) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      {...props}
      ref={ref}
      orientation={orientation}
      data-rams-primitive="true"
      data-slot="scroll-area-scrollbar"
      className={cx(
        "rams-scroll-area__scrollbar",
        `rams-scroll-area__scrollbar--${orientation}`,
        className,
      )}
    >
      <ScrollAreaPrimitive.Thumb
        data-rams-primitive="true"
        data-slot="scroll-area-thumb"
        className="rams-scroll-area__thumb"
      />
    </ScrollAreaPrimitive.Scrollbar>
  );
});
ScrollBar.displayName = "ScrollBar";
