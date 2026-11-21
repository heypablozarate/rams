"use client";

import * as React from "react";
import { Slot } from "radix-ui";
import "./primitives.css";
import "./navigation.css";
import { cx } from "./utils";

type DivProps = Omit<React.ComponentPropsWithoutRef<"div">, "className"> & {
  className?: string;
};

export type EmptyProps = DivProps;

export const Empty = React.forwardRef<HTMLDivElement, EmptyProps>(
  function Empty({ className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        className={cx("rams-empty", className)}
        data-rams-primitive="true"
        data-slot="empty"
      />
    );
  },
);

export type EmptyHeaderProps = DivProps;

export const EmptyHeader = React.forwardRef<HTMLDivElement, EmptyHeaderProps>(
  function EmptyHeader({ className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        className={cx("rams-empty__header", className)}
        data-rams-primitive="true"
        data-slot="empty-header"
      />
    );
  },
);

export type EmptyMediaVariant = "default" | "icon";
export type EmptyMediaProps = DivProps & { variant?: EmptyMediaVariant };

export const EmptyMedia = React.forwardRef<HTMLDivElement, EmptyMediaProps>(
  function EmptyMedia({ className, variant = "default", ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        className={cx("rams-empty__media", className)}
        data-variant={variant}
        data-rams-primitive="true"
        data-slot="empty-media"
      />
    );
  },
);

export type EmptyTitleProps = DivProps & { asChild?: boolean };
export const EmptyTitle = React.forwardRef<HTMLDivElement, EmptyTitleProps>(
  function EmptyTitle({ className, asChild = false, ...props }, ref) {
    const shared = {
      ...props,
      className: cx("rams-empty__title", className),
      "data-rams-primitive": "true",
      "data-slot": "empty-title",
    };
    return asChild ? (
      <Slot.Root {...shared} ref={ref} />
    ) : (
      <div {...shared} ref={ref} />
    );
  },
);

export type EmptyDescriptionProps = Omit<
  React.ComponentPropsWithoutRef<"p">,
  "className"
> & { className?: string };

export const EmptyDescription = React.forwardRef<
  HTMLParagraphElement,
  EmptyDescriptionProps
>(function EmptyDescription({ className, ...props }, ref) {
  return (
    <p
      {...props}
      ref={ref}
      className={cx("rams-empty__description", className)}
      data-rams-primitive="true"
      data-slot="empty-description"
    />
  );
});

export type EmptyContentProps = DivProps;

export const EmptyContent = React.forwardRef<HTMLDivElement, EmptyContentProps>(
  function EmptyContent({ className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        className={cx("rams-empty__content", className)}
        data-rams-primitive="true"
        data-slot="empty-content"
      />
    );
  },
);

Empty.displayName = "Empty";
EmptyHeader.displayName = "EmptyHeader";
EmptyMedia.displayName = "EmptyMedia";
EmptyTitle.displayName = "EmptyTitle";
EmptyDescription.displayName = "EmptyDescription";
EmptyContent.displayName = "EmptyContent";
