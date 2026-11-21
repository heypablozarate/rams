"use client";

import * as React from "react";
import "./primitives.css";
import "./navigation.css";
import { Separator, type SeparatorProps } from "./separator";
import { cx } from "./utils";

export type ButtonGroupOrientation = "horizontal" | "vertical";

export type ButtonGroupProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "className"
> & { className?: string; orientation?: ButtonGroupOrientation };

export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  function ButtonGroup(
    { className, orientation = "horizontal", ...props },
    ref,
  ) {
    return (
      <div
        {...props}
        ref={ref}
        role="group"
        className={cx("rams-button-group", className)}
        data-orientation={orientation}
        data-rams-primitive="true"
        data-slot="button-group"
      />
    );
  },
);

export type ButtonGroupTextProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "className"
> & { className?: string };

export const ButtonGroupText = React.forwardRef<
  HTMLDivElement,
  ButtonGroupTextProps
>(function ButtonGroupText({ className, ...props }, ref) {
  return (
    <div
      {...props}
      ref={ref}
      className={cx("rams-button-group__text", className)}
      data-rams-primitive="true"
      data-slot="button-group-text"
    />
  );
});

export type ButtonGroupSeparatorProps = Omit<SeparatorProps, "className"> & {
  className?: string;
};

export const ButtonGroupSeparator = React.forwardRef<
  HTMLDivElement,
  ButtonGroupSeparatorProps
>(function ButtonGroupSeparator(
  { className, orientation = "vertical", decorative = true, ...props },
  ref,
) {
  return (
    <Separator
      {...props}
      ref={ref}
      orientation={orientation}
      decorative={decorative}
      className={cx("rams-button-group__separator", className)}
      data-rams-primitive="true"
      data-slot="button-group-separator"
    />
  );
});

ButtonGroup.displayName = "ButtonGroup";
ButtonGroupText.displayName = "ButtonGroupText";
ButtonGroupSeparator.displayName = "ButtonGroupSeparator";
