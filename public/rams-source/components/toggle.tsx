"use client";

import * as React from "react";
import { Toggle as TogglePrimitive } from "radix-ui";
import "./primitives.css";
import "./selection.css";
import { cx } from "./utils";

export type ToggleVariant = "default" | "outline";
export type ToggleSize = "default" | "sm" | "lg";

export interface ToggleVariantOptions {
  variant?: ToggleVariant;
  size?: ToggleSize;
  className?: string;
}

export function toggleVariants({
  variant = "default",
  size = "default",
  className,
}: ToggleVariantOptions = {}) {
  return cx(
    "rams-toggle",
    `rams-toggle--variant-${variant}`,
    `rams-toggle--size-${size}`,
    className,
  );
}

export type ToggleProps = Omit<
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root>,
  "className"
> & ToggleVariantOptions;

export const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  ToggleProps
>(function Toggle(
  { className, size = "default", variant = "default", ...props },
  ref,
) {
  return (
    <TogglePrimitive.Root
      {...props}
      ref={ref}
      className={toggleVariants({ variant, size, className })}
      data-rams-primitive="true"
      data-size={size}
      data-slot="toggle"
      data-variant={variant}
    />
  );
});

Toggle.displayName = "Toggle";
