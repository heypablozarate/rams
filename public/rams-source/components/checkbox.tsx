"use client";

import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import "./primitives.css";
import "./selection.css";
import { cx } from "./utils";

export type CheckboxProps = Omit<
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
  "className"
> & {
  className?: string;
  /** Accent preserves the default selection color; neutral uses the theme ink and surface. */
  tone?: "accent" | "neutral";
};

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(function Checkbox({ asChild = false, className, children, tone = "accent", ...props }, ref) {
  const indicator = <CheckboxPrimitive.Indicator
        className="rams-checkbox__indicator"
        data-rams-primitive="true"
        data-slot="checkbox-indicator"
      >
        <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
          <path
            d="M3.25 8.25 6.5 11.5l6.25-7"
            className="rams-checkbox__check"
            data-checkbox-mark="check"
          />
          <path
            d="M3.5 8h9"
            className="rams-checkbox__mixed"
            data-checkbox-mark="mixed"
          />
        </svg>
      </CheckboxPrimitive.Indicator>;
  const child = asChild ? React.Children.only(children) as React.ReactElement<{children?: React.ReactNode}> : null;
  const content = child
    ? React.cloneElement(child, undefined, indicator, child.props.children)
    : <>{indicator}{children}</>;
  return (
    <CheckboxPrimitive.Root
      {...props}
      asChild={asChild}
      ref={ref}
      className={cx("rams-checkbox", className)}
      data-rams-primitive="true"
      data-slot="checkbox"
      data-tone={tone}
    >
      {content}
    </CheckboxPrimitive.Root>
  );
});

Checkbox.displayName = "Checkbox";
