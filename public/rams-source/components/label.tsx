"use client";
import * as React from "react";
import "./primitives.css";
import { cx } from "./utils";

export type LabelProps = React.ComponentPropsWithoutRef<"label">;

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  function Label({ className, ...props }, ref) {
    return (
      <label
        {...props}
        ref={ref}
        className={cx("rams-label", className)}
        data-rams-primitive="true"
        data-slot="label"
      />
    );
  },
);

Label.displayName = "Label";
