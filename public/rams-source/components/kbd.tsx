"use client";

import * as React from "react";
import "./primitives.css";
import { cx } from "./utils";

export interface KbdProps extends Omit<React.ComponentPropsWithoutRef<"kbd">, "className"> {
  className?: string;
}

export const Kbd = React.forwardRef<HTMLElement, KbdProps>(
  function Kbd({ className, ...props }, ref) {
    return (
      <kbd
        {...props}
        ref={ref}
        className={cx("rams-kbd", className)}
        data-rams-primitive="true"
        data-slot="kbd"
      />
    );
  },
);

export interface KbdGroupProps extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  className?: string;
}

export const KbdGroup = React.forwardRef<HTMLDivElement, KbdGroupProps>(
  function KbdGroup({ className, ...props }, ref) {
    return (
      <div
        role="group"
        {...props}
        ref={ref}
        className={cx("rams-kbd-group", className)}
        data-rams-primitive="true"
        data-slot="kbd-group"
      />
    );
  },
);

Kbd.displayName = "Kbd";
KbdGroup.displayName = "KbdGroup";
