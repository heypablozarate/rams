"use client";

import * as React from "react";
import {
  Toaster as SonnerToaster,
  type ToasterProps as SonnerToasterProps,
} from "sonner";
import "./primitives.css";
import "./containers.css";
import { cx } from "./utils";

export type ToasterProps = SonnerToasterProps;

export const Toaster = React.forwardRef<HTMLElement, ToasterProps>(
  function Toaster({ className, theme = "system", ...props }, ref) {
    return (
      <SonnerToaster
        {...props}
        ref={ref}
        theme={theme}
        className={cx("rams-toaster", className)}
      />
    );
  },
);
Toaster.displayName = "Toaster";
