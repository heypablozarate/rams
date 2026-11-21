"use client";

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "radix-ui";
import "./primitives.css";
import "./surfaces.css";
import { cx } from "./utils";
import { floatingPlacement } from "./floating-placement";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export type TooltipContentProps = Omit<
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>,
  "className"
> & { className?: string };

function TooltipArrow() {
  return (
    <TooltipPrimitive.Arrow
      className="rams-tooltip__arrow"
      data-rams-primitive="true"
      data-slot="tooltip-arrow"
      aria-hidden="true"
    />
  );
}

export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(function TooltipContent(
  { asChild = false, children, className, sideOffset, collisionPadding, forceMount, ...props },
  ref,
) {
  let content: React.ReactNode;
  if (asChild) {
    const child = React.Children.only(children) as React.ReactElement<{
      children?: React.ReactNode;
    }>;
    content = React.cloneElement(
      child,
      undefined,
      child.props.children,
      <TooltipArrow />,
    );
  } else {
    content = <>{children}<TooltipArrow /></>;
  }

  return (
    <TooltipPrimitive.Portal forceMount={forceMount}>
      <TooltipPrimitive.Content
        {...props}
        forceMount={forceMount}
        ref={ref}
        asChild={asChild}
        sideOffset={sideOffset ?? floatingPlacement.nativeSurface.anchorGapPx}
        collisionPadding={collisionPadding ?? floatingPlacement.nativeSurface.collisionInsetPx}
        className={cx("rams-tooltip__content", className)}
        data-rams-primitive="true"
        data-slot="tooltip-content"
      >
        {content}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
});

TooltipContent.displayName = "TooltipContent";
