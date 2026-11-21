"use client";

import * as React from "react";
import { HoverCard as HoverCardPrimitive } from "radix-ui";
import "./primitives.css";
import "./surfaces.css";
import { cx } from "./utils";
import { floatingPlacement } from "./floating-placement";

export const HoverCard = HoverCardPrimitive.Root;
export const HoverCardTrigger = HoverCardPrimitive.Trigger;

export type HoverCardContentProps = Omit<
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>,
  "className"
> & { className?: string };

export const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  HoverCardContentProps
>(function HoverCardContent(
  { className, sideOffset, collisionPadding, forceMount, ...props },
  ref,
) {
  return (
    <HoverCardPrimitive.Portal forceMount={forceMount}>
      <HoverCardPrimitive.Content
        {...props}
        forceMount={forceMount}
        ref={ref}
        sideOffset={sideOffset ?? floatingPlacement.nativeSurface.anchorGapPx}
        collisionPadding={collisionPadding ?? floatingPlacement.nativeSurface.collisionInsetPx}
        className={cx("rams-hover-card__content", className)}
        data-rams-primitive="true"
        data-slot="hover-card-content"
      />
    </HoverCardPrimitive.Portal>
  );
});

HoverCardContent.displayName = "HoverCardContent";
