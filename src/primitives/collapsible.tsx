"use client";

import * as React from "react";
import { Collapsible as CollapsiblePrimitive } from "radix-ui";
import "./primitives.css";
import "./selection.css";
import { cx } from "./utils";

export type CollapsibleProps = Omit<
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root>,
  "className"
> & { className?: string };

export const Collapsible = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Root>,
  CollapsibleProps
>(function Collapsible({ className, ...props }, ref) {
  return (
    <CollapsiblePrimitive.Root
      {...props}
      ref={ref}
      className={cx("rams-collapsible", className)}
      data-rams-primitive="true"
      data-slot="collapsible"
    />
  );
});

export type CollapsibleTriggerProps = Omit<
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger>,
  "className"
> & { className?: string };

export const CollapsibleTrigger = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Trigger>,
  CollapsibleTriggerProps
>(function CollapsibleTrigger({ className, ...props }, ref) {
  return (
    <CollapsiblePrimitive.Trigger
      {...props}
      ref={ref}
      className={cx("rams-collapsible__trigger", className)}
      data-rams-primitive="true"
      data-slot="collapsible-trigger"
    />
  );
});

export type CollapsibleContentProps = Omit<
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>,
  "className"
> & { className?: string };

export const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Content>,
  CollapsibleContentProps
>(function CollapsibleContent({ className, ...props }, ref) {
  return (
    <CollapsiblePrimitive.Content
      {...props}
      ref={ref}
      className={cx("rams-collapsible__content", className)}
      data-rams-primitive="true"
      data-slot="collapsible-content"
    />
  );
});

Collapsible.displayName = "Collapsible";
CollapsibleTrigger.displayName = "CollapsibleTrigger";
CollapsibleContent.displayName = "CollapsibleContent";
