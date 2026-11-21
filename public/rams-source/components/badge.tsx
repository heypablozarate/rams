"use client";

import * as React from "react";
import { Slot } from "radix-ui";
import "./primitives.css";
import { cx } from "./utils";

export type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"
  | "link";

export interface BadgeVariantOptions {
  variant?: BadgeVariant;
  className?: string;
}

export function badgeVariants({ variant = "default", className }: BadgeVariantOptions = {}) {
  return cx("rams-badge", `rams-badge--variant-${variant}`, className);
}

export interface BadgeProps extends Omit<React.ComponentPropsWithoutRef<"span">, "className"> {
  variant?: BadgeVariant;
  asChild?: boolean;
  className?: string;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  function Badge({ asChild = false, className, variant = "default", ...props }, ref) {
    const Component = asChild ? Slot.Root : "span";
    return (
      <Component
        {...props}
        ref={ref}
        className={badgeVariants({ variant, className })}
        data-rams-primitive="true"
        data-slot="badge"
        data-variant={variant}
      />
    );
  },
);

Badge.displayName = "Badge";
