"use client";

import * as React from "react";
import "./primitives.css";
import { cx } from "./utils";

export interface SkeletonProps extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  className?: string;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  function Skeleton({ className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        className={cx("rams-skeleton", className)}
        data-rams-primitive="true"
        data-slot="skeleton"
      />
    );
  },
);

Skeleton.displayName = "Skeleton";
