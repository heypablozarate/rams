"use client";

import * as React from "react";
import { Label } from "./label";
import { Separator } from "./separator";
import { cx } from "./utils";
import "./primitives.css";
import "./forms.css";

export type FieldSetProps = React.ComponentPropsWithoutRef<"fieldset">;

export const FieldSet = React.forwardRef<HTMLFieldSetElement, FieldSetProps>(
  function FieldSet({ className, ...props }, ref) {
    return (
      <fieldset
        {...props}
        ref={ref}
        data-rams-primitive="true"
        data-slot="field-set"
        className={cx("rams-field-set", className)}
      />
    );
  },
);
FieldSet.displayName = "FieldSet";

export type FieldLegendVariant = "legend" | "label";
export interface FieldLegendProps extends React.ComponentPropsWithoutRef<"legend"> {
  variant?: FieldLegendVariant;
}
export const FieldLegend = React.forwardRef<
  HTMLLegendElement,
  FieldLegendProps
>(function FieldLegend({ className, variant = "legend", ...props }, ref) {
  return (
    <legend
      {...props}
      ref={ref}
      data-rams-primitive="true"
      data-slot="field-legend"
      data-variant={variant}
      className={cx("rams-field__legend", className)}
    />
  );
});
FieldLegend.displayName = "FieldLegend";

export type FieldGroupProps = React.ComponentPropsWithoutRef<"div">;

export const FieldGroup = React.forwardRef<HTMLDivElement, FieldGroupProps>(
  function FieldGroup({ className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        data-rams-primitive="true"
        data-slot="field-group"
        className={cx("rams-field-group", className)}
      />
    );
  },
);
FieldGroup.displayName = "FieldGroup";

export type FieldOrientation = "vertical" | "horizontal" | "responsive";
export interface FieldProps extends React.ComponentPropsWithoutRef<"div"> {
  orientation?: FieldOrientation;
}

export const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  function Field({ className, orientation = "vertical", ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        data-rams-primitive="true"
        data-slot="field"
        data-orientation={orientation}
        className={cx("rams-field", `rams-field--${orientation}`, className)}
      />
    );
  },
);
Field.displayName = "Field";

export type FieldContentProps = React.ComponentPropsWithoutRef<"div">;

export const FieldContent = React.forwardRef<HTMLDivElement, FieldContentProps>(
  function FieldContent({ className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        data-rams-primitive="true"
        data-slot="field-content"
        className={cx("rams-field__content", className)}
      />
    );
  },
);
FieldContent.displayName = "FieldContent";

export type FieldLabelProps = React.ComponentPropsWithoutRef<typeof Label>;

export const FieldLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  FieldLabelProps
>(function FieldLabel({ className, ...props }, ref) {
  return (
    <Label
      {...props}
      ref={ref}
      data-slot="field-label"
      className={cx("rams-field__label", className)}
    />
  );
});
FieldLabel.displayName = "FieldLabel";

export type FieldTitleProps = React.ComponentPropsWithoutRef<"div">;

export const FieldTitle = React.forwardRef<HTMLDivElement, FieldTitleProps>(
  function FieldTitle({ className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        data-rams-primitive="true"
        data-slot="field-title"
        className={cx("rams-field__title", className)}
      />
    );
  },
);
FieldTitle.displayName = "FieldTitle";

export type FieldDescriptionProps = React.ComponentPropsWithoutRef<"p">;

export const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  FieldDescriptionProps
>(function FieldDescription({ className, ...props }, ref) {
  return (
    <p
      {...props}
      ref={ref}
      data-rams-primitive="true"
      data-slot="field-description"
      className={cx("rams-field__description", className)}
    />
  );
});
FieldDescription.displayName = "FieldDescription";

export const FieldSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(function FieldSeparator({ children, className, ...props }, ref) {
  return (
    <div
      {...props}
      ref={ref}
      data-rams-primitive="true"
      data-slot="field-separator"
      className={cx("rams-field__separator", className)}
    >
      <Separator />
      {children !== undefined &&
        children !== null &&
        children !== false &&
        children !== "" && (
          <>
            <span>{children}</span>
            <Separator />
          </>
        )}
    </div>
  );
});
FieldSeparator.displayName = "FieldSeparator";

export interface FieldErrorItem {
  message?: unknown;
}

export interface FieldErrorProps extends React.ComponentPropsWithoutRef<"div"> {
  errors?: readonly (FieldErrorItem | undefined)[];
}

export const FieldError = React.forwardRef<HTMLDivElement, FieldErrorProps>(
  function FieldError({ children, className, errors, ...props }, ref) {
    let content = children;
    if (content === undefined || content === null) {
      const messages = Array.from(
        new Set(
          (errors ?? [])
            .map((error) => error?.message)
            .filter(
              (message): message is string =>
                typeof message === "string" && message.trim().length > 0,
            ),
        ),
      );
      if (messages.length === 0) return null;
      content =
        messages.length === 1 ? (
          messages[0]
        ) : (
          <ul>
            {messages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        );
    }

    if (content === false || content === "") return null;
    return (
      <div
        {...props}
        ref={ref}
        role="alert"
        data-rams-primitive="true"
        data-slot="field-error"
        className={cx("rams-field__error", className)}
      >
        {content}
      </div>
    );
  },
);
FieldError.displayName = "FieldError";
