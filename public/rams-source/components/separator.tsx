"use client";
import * as React from "react";
import "./primitives.css";
import { cx } from "./utils";

export type SeparatorOrientation = "horizontal" | "vertical";

export interface SeparatorProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "role"> {
  orientation?: SeparatorOrientation;
  decorative?: boolean;
}

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  function Separator(
    {
      className,
      decorative = true,
      orientation = "horizontal",
      ...props
    },
    ref,
  ) {
    return (
      <div
        {...props}
        ref={ref}
        className={cx("rams-separator", className)}
        data-orientation={orientation}
        data-rams-primitive="true"
        data-slot="separator"
        aria-orientation={decorative ? undefined : orientation}
        role={decorative ? "presentation" : "separator"}
      />
    );
  },
);

Separator.displayName = "Separator";
