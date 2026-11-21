"use client";

import * as React from "react";
import { Slot } from "radix-ui";
import "./primitives.css";
import "./navigation.css";
import { cx } from "./utils";

export type BreadcrumbProps = Omit<
  React.ComponentPropsWithoutRef<"nav">,
  "className"
> & { className?: string };

export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  function Breadcrumb(
    { "aria-label": ariaLabel = "Breadcrumb", className, ...props },
    ref,
  ) {
    return (
      <nav
        {...props}
        ref={ref}
        aria-label={ariaLabel}
        className={cx("rams-breadcrumb", className)}
        data-rams-primitive="true"
        data-slot="breadcrumb"
      />
    );
  },
);

export type BreadcrumbListProps = Omit<
  React.ComponentPropsWithoutRef<"ol">,
  "className"
> & { className?: string };

export const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  BreadcrumbListProps
>(function BreadcrumbList({ className, ...props }, ref) {
  return (
    <ol
      {...props}
      ref={ref}
      className={cx("rams-breadcrumb__list", className)}
      data-rams-primitive="true"
      data-slot="breadcrumb-list"
    />
  );
});

export type BreadcrumbItemProps = Omit<
  React.ComponentPropsWithoutRef<"li">,
  "className"
> & { className?: string };

export const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  BreadcrumbItemProps
>(function BreadcrumbItem({ className, ...props }, ref) {
  return (
    <li
      {...props}
      ref={ref}
      className={cx("rams-breadcrumb__item", className)}
      data-rams-primitive="true"
      data-slot="breadcrumb-item"
    />
  );
});

export type BreadcrumbLinkProps = Omit<
  React.ComponentPropsWithoutRef<"a">,
  "className"
> & { asChild?: boolean; className?: string };

export const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  BreadcrumbLinkProps
>(function BreadcrumbLink({ asChild = false, className, ...props }, ref) {
  const shared = {
    ...props,
    className: cx("rams-breadcrumb__link", className),
    "data-rams-primitive": "true",
    "data-slot": "breadcrumb-link",
  };
  return asChild ? (
    <Slot.Root {...shared} ref={ref} />
  ) : (
    <a {...shared} ref={ref} />
  );
});

export type BreadcrumbPageProps = Omit<
  React.ComponentPropsWithoutRef<"span">,
  "className"
> & { className?: string };

export const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  BreadcrumbPageProps
>(function BreadcrumbPage({ className, ...props }, ref) {
  return (
    <span
      {...props}
      ref={ref}
      aria-current="page"
      className={cx("rams-breadcrumb__page", className)}
      data-rams-primitive="true"
      data-slot="breadcrumb-page"
    />
  );
});

export type BreadcrumbSeparatorProps = Omit<
  React.ComponentPropsWithoutRef<"li">,
  "className"
> & { className?: string };

export const BreadcrumbSeparator = React.forwardRef<
  HTMLLIElement,
  BreadcrumbSeparatorProps
>(function BreadcrumbSeparator({ children, className, ...props }, ref) {
  return (
    <li
      {...props}
      ref={ref}
      aria-hidden="true"
      className={cx("rams-breadcrumb__separator", className)}
      data-rams-primitive="true"
      data-slot="breadcrumb-separator"
    >
      {children ?? (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="m6 3 5 5-5 5" />
        </svg>
      )}
    </li>
  );
});

export type BreadcrumbEllipsisProps = Omit<
  React.ComponentPropsWithoutRef<"span">,
  "className"
> & { className?: string };

export const BreadcrumbEllipsis = React.forwardRef<
  HTMLSpanElement,
  BreadcrumbEllipsisProps
>(function BreadcrumbEllipsis({ className, ...props }, ref) {
  return (
    <span
      {...props}
      ref={ref}
      className={cx("rams-breadcrumb__ellipsis", className)}
      data-rams-primitive="true"
      data-slot="breadcrumb-ellipsis"
    >
      <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <circle cx="3" cy="8" r="1" />
        <circle cx="8" cy="8" r="1" />
        <circle cx="13" cy="8" r="1" />
      </svg>
      <span className="rams-visually-hidden">More</span>
    </span>
  );
});

Breadcrumb.displayName = "Breadcrumb";
BreadcrumbList.displayName = "BreadcrumbList";
BreadcrumbItem.displayName = "BreadcrumbItem";
BreadcrumbLink.displayName = "BreadcrumbLink";
BreadcrumbPage.displayName = "BreadcrumbPage";
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis";
