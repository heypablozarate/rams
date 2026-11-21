"use client";

import * as React from "react";
import "./primitives.css";
import { cx } from "./utils";

export interface AspectRatioProps extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  ratio?: number;
  className?: string;
}

export const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(
  function AspectRatio({ className, ratio, style, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        className={cx("rams-aspect-ratio", className)}
        style={{
          aspectRatio: ratio !== undefined && Number.isFinite(ratio) && ratio > 0
            ? ratio
            : "var(--rams-detail-square-aspect-ratio)",
          ...style,
        }}
        data-rams-primitive="true"
        data-slot="aspect-ratio"
      />
    );
  },
);

AspectRatio.displayName = "AspectRatio";
