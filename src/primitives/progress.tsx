"use client";

import * as React from "react";
import "./primitives.css";
import { cx } from "./utils";

export interface ProgressProps extends Omit<
  React.ComponentPropsWithoutRef<"progress">,
  "className" | "value" | "max"
> {
  value?: number | null;
  max?: number;
  getValueLabel?: (value: number, max: number) => string;
  className?: string;
}

export const Progress = React.forwardRef<HTMLProgressElement, ProgressProps>(
  function Progress(
    { className, max = 100, value, getValueLabel, ...props },
    ref,
  ) {
    const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
    const safeValue =
      value == null || !Number.isFinite(value)
        ? undefined
        : Math.min(safeMax, Math.max(0, value));
    return (
      <progress
        {...props}
        ref={ref}
        className={cx("rams-progress", className)}
        max={safeMax}
        value={safeValue}
        aria-valuetext={
          props["aria-valuetext"] ??
          (safeValue === undefined
            ? undefined
            : getValueLabel?.(safeValue, safeMax))
        }
        data-rams-primitive="true"
        data-slot="progress"
      />
    );
  },
);

Progress.displayName = "Progress";
