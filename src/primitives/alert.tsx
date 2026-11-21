"use client";

import * as React from "react";
import "./primitives.css";
import { cx } from "./utils";

export type AlertVariant = "default" | "destructive";

export interface AlertProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "className"
> {
  variant?: AlertVariant;
  className?: string;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  function Alert(
    { className, role = "alert", variant = "default", children, ...props },
    ref,
  ) {
    // Keep the public title/description composition while letting the copy move
    // below its icon when a large text preference leaves too little room.
    const content: React.ReactNode[] = [];
    let copy: React.ReactNode[] = [];
    const flushCopy = () => {
      if (!copy.length) return;
      content.push(
        <div className="rams-alert__copy" key={`copy-${content.length}`}>
          {copy}
        </div>,
      );
      copy = [];
    };
    for (const child of React.Children.toArray(children)) {
      if (
        React.isValidElement(child) &&
        (child.type === AlertTitle || child.type === AlertDescription)
      ) {
        copy.push(child);
      } else {
        flushCopy();
        content.push(child);
      }
    }
    flushCopy();
    return (
      <div
        {...props}
        ref={ref}
        role={role}
        className={cx(
          "rams-alert",
          `rams-alert--variant-${variant}`,
          className,
        )}
        data-rams-primitive="true"
        data-slot="alert"
        data-variant={variant}
      >
        {content}
      </div>
    );
  },
);

function alertPart(slot: string, className: string) {
  return React.forwardRef<
    HTMLDivElement,
    React.ComponentPropsWithoutRef<"div">
  >(function AlertPart({ className: extra, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        className={cx(className, extra)}
        data-rams-primitive="true"
        data-slot={slot}
      />
    );
  });
}

export const AlertTitle = alertPart("alert-title", "rams-alert__title");
export const AlertDescription = alertPart(
  "alert-description",
  "rams-alert__description",
);

Alert.displayName = "Alert";
AlertTitle.displayName = "AlertTitle";
AlertDescription.displayName = "AlertDescription";
