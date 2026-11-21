"use client";
import * as React from "react";
import "./primitives.css";
import { cx } from "./utils";

export type TextareaProps = React.ComponentPropsWithoutRef<"textarea">;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        {...props}
        ref={ref}
        className={cx("rams-textarea", className)}
        data-rams-primitive="true"
        data-slot="textarea"
      />
    );
  },
);

Textarea.displayName = "Textarea";
