"use client";
import * as React from "react";
import "./primitives.css";
import { cx } from "./utils";

export type InputProps = React.ComponentPropsWithoutRef<"input">;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        {...props}
        ref={ref}
        className={cx("rams-input", className)}
        data-rams-primitive="true"
        data-slot="input"
      />
    );
  },
);

Input.displayName = "Input";
