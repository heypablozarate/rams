"use client";

import * as React from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { cx } from "./utils";
import "./primitives.css";
import "./forms.css";

export type InputGroupProps = React.ComponentPropsWithoutRef<"div">;

export const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  function InputGroup({ className, role = "group", ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        role={role}
        data-rams-primitive="true"
        data-slot="input-group"
        className={cx("rams-input-group", className)}
      />
    );
  },
);
InputGroup.displayName = "InputGroup";

export type InputGroupAddonAlign =
  | "inline-start"
  | "inline-end"
  | "block-start"
  | "block-end";

export interface InputGroupAddonProps extends React.ComponentPropsWithoutRef<"div"> {
  align?: InputGroupAddonAlign;
}

const interactiveTarget = [
  "button",
  "a[href]",
  "input",
  "textarea",
  "select",
  "[contenteditable]:not([contenteditable='false'])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export const InputGroupAddon = React.forwardRef<
  HTMLDivElement,
  InputGroupAddonProps
>(function InputGroupAddon(
  { align = "inline-start", className, onClick, ...props },
  ref,
) {
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(event);
    const interactive =
      event.target instanceof Element
        ? event.target.closest(interactiveTarget)
        : null;
    if (
      event.defaultPrevented ||
      (interactive && event.currentTarget.contains(interactive))
    ) {
      return;
    }
    const group = event.currentTarget.closest<HTMLElement>(
      '[data-slot="input-group"]',
    );
    const control = group?.querySelector<
      HTMLInputElement | HTMLTextAreaElement
    >("input:not(:disabled), textarea:not(:disabled)");
    control?.focus();
  };

  return (
    <div
      {...props}
      ref={ref}
      data-rams-primitive="true"
      data-slot="input-group-addon"
      data-align={align}
      className={cx(
        "rams-input-group__addon",
        `rams-input-group__addon--${align}`,
        className,
      )}
      onClick={handleClick}
    />
  );
});
InputGroupAddon.displayName = "InputGroupAddon";

export type InputGroupTextProps = React.ComponentPropsWithoutRef<"span">;

export const InputGroupText = React.forwardRef<
  HTMLSpanElement,
  InputGroupTextProps
>(function InputGroupText({ className, ...props }, ref) {
  return (
    <span
      {...props}
      ref={ref}
      data-rams-primitive="true"
      data-slot="input-group-text"
      className={cx("rams-input-group__text", className)}
    />
  );
});
InputGroupText.displayName = "InputGroupText";

export interface InputGroupButtonProps extends React.ComponentPropsWithoutRef<
  typeof Button
> {}

export const InputGroupButton = React.forwardRef<
  React.ElementRef<typeof Button>,
  InputGroupButtonProps
>(function InputGroupButton(
  { className, type = "button", variant = "ghost", size = "xs", ...props },
  ref,
) {
  return (
    <Button
      {...props}
      ref={ref}
      type={type}
      variant={variant}
      size={size}
      data-slot="input-group-button"
      className={cx("rams-input-group__button", className)}
    />
  );
});
InputGroupButton.displayName = "InputGroupButton";

export type InputGroupInputProps = React.ComponentPropsWithoutRef<typeof Input>;

export const InputGroupInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  InputGroupInputProps
>(function InputGroupInput({ className, ...props }, ref) {
  return (
    <Input
      {...props}
      ref={ref}
      className={cx("rams-input-group__control", className)}
    />
  );
});
InputGroupInput.displayName = "InputGroupInput";

export type InputGroupTextareaProps = React.ComponentPropsWithoutRef<
  typeof Textarea
>;

export const InputGroupTextarea = React.forwardRef<
  React.ElementRef<typeof Textarea>,
  InputGroupTextareaProps
>(function InputGroupTextarea({ className, ...props }, ref) {
  return (
    <Textarea
      {...props}
      ref={ref}
      className={cx("rams-input-group__control", className)}
    />
  );
});
InputGroupTextarea.displayName = "InputGroupTextarea";
