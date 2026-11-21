"use client";

import * as React from "react";
import "./primitives.css";
import { cx } from "./utils";

export interface SpinnerProps extends Omit<React.SVGProps<SVGSVGElement>, "className" | "children"> {
  className?: string;
}

export const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  function Spinner({ "aria-hidden": ariaHidden, "aria-label": ariaLabel, className, ...props }, ref) {
    const hidden = ariaHidden === true || ariaHidden === "true";
    return (
      <svg
        {...props}
        ref={ref}
        className={cx("rams-spinner", className)}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden={hidden || undefined}
        aria-label={hidden ? undefined : ariaLabel ?? "Loading"}
        role={hidden ? undefined : "status"}
        focusable="false"
        data-rams-primitive="true"
        data-slot="spinner"
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" style={{ strokeWidth: "var(--rams-detail-spinner-stroke-width)" }} />
      </svg>
    );
  },
);

Spinner.displayName = "Spinner";
