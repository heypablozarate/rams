"use client";

import * as React from "react";
import { Slot } from "radix-ui";
import "./primitives.css";
import "./navigation.css";
import { buttonVariants, type ButtonSize } from "./button";
import { cx } from "./utils";

export type PaginationProps = Omit<
  React.ComponentPropsWithoutRef<"nav">,
  "className"
> & { className?: string };

export const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  function Pagination(
    { "aria-label": ariaLabel = "pagination", className, ...props },
    ref,
  ) {
    return (
      <nav
        {...props}
        ref={ref}
        aria-label={ariaLabel}
        className={cx("rams-pagination", className)}
        data-rams-primitive="true"
        data-slot="pagination"
      />
    );
  },
);

export type PaginationContentProps = Omit<
  React.ComponentPropsWithoutRef<"ul">,
  "className"
> & { className?: string };

export const PaginationContent = React.forwardRef<
  HTMLUListElement,
  PaginationContentProps
>(function PaginationContent({ className, ...props }, ref) {
  return (
    <ul
      {...props}
      ref={ref}
      className={cx("rams-pagination__content", className)}
      data-rams-primitive="true"
      data-slot="pagination-content"
    />
  );
});

export type PaginationItemProps = Omit<
  React.ComponentPropsWithoutRef<"li">,
  "className"
> & { className?: string };

export const PaginationItem = React.forwardRef<
  HTMLLIElement,
  PaginationItemProps
>(function PaginationItem({ className, ...props }, ref) {
  return (
    <li
      {...props}
      ref={ref}
      className={cx("rams-pagination__item", className)}
      data-rams-primitive="true"
      data-slot="pagination-item"
    />
  );
});

export type PaginationLinkProps = Omit<
  React.ComponentPropsWithoutRef<"a">,
  "className"
> & {
  className?: string;
  isActive?: boolean;
  asChild?: boolean;
  size?: ButtonSize;
};

export const PaginationLink = React.forwardRef<
  HTMLAnchorElement,
  PaginationLinkProps
>(function PaginationLink(
  {
    "aria-current": ariaCurrent,
    asChild = false,
    className,
    isActive = false,
    size = "icon",
    ...props
  },
  ref,
) {
  const Component = asChild ? Slot.Root : "a";
  return (
    <Component
      {...props}
      ref={ref}
      aria-current={ariaCurrent ?? (isActive ? "page" : undefined)}
      className={buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
        className: cx("rams-pagination__link", className),
      })}
      data-active={isActive || undefined}
      data-rams-primitive="true"
      data-size={size}
      data-slot="pagination-link"
      data-variant={isActive ? "outline" : "ghost"}
    />
  );
});

export type PaginationPreviousProps = Omit<
  React.ComponentPropsWithoutRef<"a">,
  "className"
> & { className?: string; size?: ButtonSize; asChild?: boolean };

export const PaginationPrevious = React.forwardRef<
  HTMLAnchorElement,
  PaginationPreviousProps
>(function PaginationPrevious(
  { children, asChild = false, className, size = "default", ...props },
  ref,
) {
  const Component = asChild ? Slot.Root : "a";
  return (
    <Component
      {...props}
      ref={ref}
      className={buttonVariants({
        variant: "ghost",
        size,
        className: cx("rams-pagination__previous", className),
      })}
      data-rams-primitive="true"
      data-size={size}
      data-slot="pagination-previous"
      data-variant="ghost"
    >
      {children ?? (
        <>
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="m10 3-5 5 5 5" />
          </svg>
          <span>Previous</span>
        </>
      )}
    </Component>
  );
});

export const PaginationNext = React.forwardRef<
  HTMLAnchorElement,
  PaginationPreviousProps
>(function PaginationNext(
  { children, asChild = false, className, size = "default", ...props },
  ref,
) {
  const Component = asChild ? Slot.Root : "a";
  return (
    <Component
      {...props}
      ref={ref}
      className={buttonVariants({
        variant: "ghost",
        size,
        className: cx("rams-pagination__next", className),
      })}
      data-rams-primitive="true"
      data-size={size}
      data-slot="pagination-next"
      data-variant="ghost"
    >
      {children ?? (
        <>
          <span>Next</span>
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="m6 3 5 5-5 5" />
          </svg>
        </>
      )}
    </Component>
  );
});

export type PaginationEllipsisProps = Omit<
  React.ComponentPropsWithoutRef<"span">,
  "className"
> & { className?: string };

export const PaginationEllipsis = React.forwardRef<
  HTMLSpanElement,
  PaginationEllipsisProps
>(function PaginationEllipsis({ className, ...props }, ref) {
  return (
    <span
      {...props}
      ref={ref}
      className={cx("rams-pagination__ellipsis", className)}
      data-rams-primitive="true"
      data-slot="pagination-ellipsis"
    >
      <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <circle cx="3" cy="8" r="1" />
        <circle cx="8" cy="8" r="1" />
        <circle cx="13" cy="8" r="1" />
      </svg>
      <span className="rams-visually-hidden">More pages</span>
    </span>
  );
});

Pagination.displayName = "Pagination";
PaginationContent.displayName = "PaginationContent";
PaginationItem.displayName = "PaginationItem";
PaginationLink.displayName = "PaginationLink";
PaginationPrevious.displayName = "PaginationPrevious";
PaginationNext.displayName = "PaginationNext";
PaginationEllipsis.displayName = "PaginationEllipsis";
