"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import "./primitives.css";
import "./surfaces.css";
import { cx } from "./utils";
import { floatingPlacement } from "./floating-placement";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverAnchor = PopoverPrimitive.Anchor;
export const PopoverClose = PopoverPrimitive.Close;

export type PopoverContentProps = Omit<
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>,
  "className"
> & { className?: string };

export const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(function PopoverContent(
  { className, sideOffset, collisionPadding, forceMount, ...props },
  ref,
) {
  return (
    <PopoverPrimitive.Portal forceMount={forceMount}>
      <PopoverPrimitive.Content
        {...props}
        forceMount={forceMount}
        ref={ref}
        sideOffset={sideOffset ?? floatingPlacement.nativeSurface.anchorGapPx}
        collisionPadding={collisionPadding ?? floatingPlacement.nativeSurface.collisionInsetPx}
        className={cx("rams-popover__content", className)}
        data-rams-primitive="true"
        data-slot="popover-content"
      />
    </PopoverPrimitive.Portal>
  );
});

PopoverContent.displayName = "PopoverContent";
