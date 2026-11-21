"use client";

import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import "./primitives.css";
import "./ranges.css";
import { cx } from "./utils";

// Distribute over the library's render/children union so either composition stays valid.
type ValueCallbackProps<Props> = Props extends unknown ? Omit<Props, "onChange"> & {
  /** Receives the next complete string value, rather than a DOM input event. */
  onValueChange?: (value: string) => void;
} : never;
export type InputOTPProps = ValueCallbackProps<React.ComponentPropsWithoutRef<typeof OTPInput>>;

export const InputOTP = React.forwardRef<HTMLInputElement, InputOTPProps>(
  function InputOTP(
    { className, containerClassName, inputMode = "text", onValueChange, ...props },
    ref,
  ) {
    return (
      <OTPInput
        {...props}
        ref={ref}
        onChange={onValueChange}
        className={className}
        containerClassName={cx("rams-otp", containerClassName)}
        inputMode={inputMode}
        data-rams-primitive="true"
        data-slot="input-otp"
      />
    );
  },
);

export type InputOTPGroupProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "className"
> & { className?: string };

export const InputOTPGroup = React.forwardRef<
  HTMLDivElement,
  InputOTPGroupProps
>(function InputOTPGroup({ className, ...props }, ref) {
  return (
    <div
      {...props}
      ref={ref}
      className={cx("rams-otp__group", className)}
      data-rams-primitive="true"
      data-slot="input-otp-group"
    />
  );
});

export type InputOTPSlotProps = Omit<
  React.ComponentPropsWithoutRef<"span">,
  "className" | "children"
> & { className?: string; index: number };

export const InputOTPSlot = React.forwardRef<
  HTMLSpanElement,
  InputOTPSlotProps
>(function InputOTPSlot({ className, index, ...props }, ref) {
  const context = React.useContext(OTPInputContext);
  if (!context?.slots)
    throw new Error("InputOTPSlot must be rendered inside InputOTP.");
  const slot = context.slots[index];

  return (
    <span
      {...props}
      ref={ref}
      aria-hidden="true"
      className={cx("rams-otp__slot", className)}
      data-active={slot?.isActive || undefined}
      data-filled={Boolean(slot?.char) || undefined}
      data-rams-primitive="true"
      data-slot="input-otp-slot"
    >
      {slot?.char ?? slot?.placeholderChar}
      {slot?.hasFakeCaret && (
        <span
          className="rams-otp__caret"
          data-rams-primitive="true"
          data-slot="input-otp-caret"
          aria-hidden="true"
        />
      )}
    </span>
  );
});

export type InputOTPSeparatorProps = Omit<
  React.ComponentPropsWithoutRef<"span">,
  "className"
> & { className?: string };

export const InputOTPSeparator = React.forwardRef<
  HTMLSpanElement,
  InputOTPSeparatorProps
>(function InputOTPSeparator({ children, className, ...props }, ref) {
  return (
    <span
      {...props}
      ref={ref}
      aria-hidden="true"
      className={cx("rams-otp__separator", className)}
      data-rams-primitive="true"
      data-slot="input-otp-separator"
    >
      {children ?? "·"}
    </span>
  );
});

InputOTP.displayName = "InputOTP";
InputOTPGroup.displayName = "InputOTPGroup";
InputOTPSlot.displayName = "InputOTPSlot";
InputOTPSeparator.displayName = "InputOTPSeparator";
