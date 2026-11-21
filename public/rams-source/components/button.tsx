"use client";
import * as React from "react";
import { Slot } from "radix-ui";
import "./primitives.css";
import { cx } from "./utils";

export type ButtonVariant =
  | "default"
  | "secondary"
  | "outline"
  | "ghost"
  | "link"
  | "destructive";

export type ButtonTextSize = "xs" | "sm" | "default" | "lg";

export type ButtonSize =
  | ButtonTextSize
  | "icon"
  | "icon-xs"
  | "icon-sm"
  | "icon-lg";

export interface ButtonVariantOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

export function buttonSizeClass(size: ButtonSize = "default"): string {
  return `rams-button--size-${size}`;
}

export function buttonVariants({
  variant = "default",
  size = "default",
  className,
}: ButtonVariantOptions = {}): string {
  return cx(
    "rams-button",
    `rams-button--variant-${variant}`,
    buttonSizeClass(size),
    className,
  );
}

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  className?: string;
}

const blockActivation = (event: React.SyntheticEvent) => { event.preventDefault(); event.stopPropagation(); };
const blockActivationKey = (event: React.KeyboardEvent) => { if (event.key === "Enter" || event.key === " ") blockActivation(event); };

/** Shared native/Slot behavior without the styled Button's layout or surface. */
export const ButtonBase = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function ButtonBase(
    {
      asChild = false,
      className,
      children,
      disabled,
      size: _size,
      type,
      variant: _variant,
      ...props
    },
    ref,
  ) {
    const ariaDisabled = props["aria-disabled"] === true || props["aria-disabled"] === "true";
    const sharedProps = {
      ...props,
      className,
      "data-rams-primitive": "true",
    };

    if (asChild) {
      // Slot combines child handlers before its own handlers. Override both
      // sides when disabled so a child link cannot activate independently.
      const inactive = disabled || ariaDisabled ? {
        "aria-disabled": true as const, tabIndex: disabled ? -1 : props.tabIndex ?? 0,
        onClick: blockActivation, onClickCapture: blockActivation,
        onPointerDown: blockActivation, onPointerDownCapture: blockActivation,
        onAuxClick: blockActivation,
        onKeyDown: blockActivationKey, onKeyDownCapture: blockActivationKey,
      } : {};
      const child = React.Children.only(children) as React.ReactElement<React.AnchorHTMLAttributes<HTMLAnchorElement>>;
      const content = disabled || ariaDisabled
        ? React.cloneElement(child, {
            ...inactive,
            // A disabled native link must also lose browser-owned navigation
            // (for example Open Link from its context menu).
            ...(child.type === "a" ? { href: undefined, role: child.props.role ?? "link" } : {}),
          })
        : children;
      return <Slot.Root {...sharedProps} {...inactive}
        {...(type === undefined ? {} : { type })} ref={ref}>{content}</Slot.Root>;
    }

    return (
      <button {...sharedProps} ref={ref} type={type ?? "button"} disabled={disabled}
        {...(ariaDisabled ? {onClick:blockActivation,onClickCapture:blockActivation,onPointerDown:blockActivation,onPointerDownCapture:blockActivation,onAuxClick:blockActivation,onKeyDown:blockActivationKey,onKeyDownCapture:blockActivationKey} : {})}>
        {children}
      </button>
    );
  },
);

ButtonBase.displayName = "ButtonBase";

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, size = "default", variant = "default", ...props }, ref) {
    return <ButtonBase {...props} ref={ref}
      className={cx(buttonVariants({ variant, size }), className)}
      data-slot="button" data-size={size} data-variant={variant} />;
  },
);

Button.displayName = "Button";
