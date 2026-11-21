"use client";

import * as React from "react";
import { Accordion as AccordionPrimitive } from "radix-ui";
import "./primitives.css";
import "./selection.css";
import { cx } from "./utils";

export type AccordionProps = React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>;

export const Accordion = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  AccordionProps
>(function Accordion({ className, ...props }, ref) {
  return (
    <AccordionPrimitive.Root
      {...props}
      ref={ref}
      className={cx("rams-accordion", className)}
      data-rams-primitive="true"
      data-slot="accordion"
    />
  );
});

export type AccordionItemProps = Omit<
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>,
  "className"
> & { className?: string };

export const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  AccordionItemProps
>(function AccordionItem({ className, ...props }, ref) {
  return (
    <AccordionPrimitive.Item
      {...props}
      ref={ref}
      className={cx("rams-accordion__item", className)}
      data-rams-primitive="true"
      data-slot="accordion-item"
    />
  );
});

export type AccordionTriggerProps = Omit<
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>,
  "className"
> & { className?: string };

function AccordionChevron() {
  return (
    <svg
      aria-hidden="true"
      className="rams-accordion__chevron"
      viewBox="0 0 16 16"
      fill="none"
      data-rams-primitive="true"
      data-slot="accordion-chevron"
    >
      <path d="m4 6 4 4 4-4" />
    </svg>
  );
}

export const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(function AccordionTrigger({ asChild = false, children, className, ...props }, ref) {
  const trigger = asChild && React.isValidElement(children)
    ? React.cloneElement(
        children as React.ReactElement<{ children?: React.ReactNode }>,
        undefined,
        (children as React.ReactElement<{ children?: React.ReactNode }>).props.children,
        <AccordionChevron />,
      )
    : <>{children}<AccordionChevron /></>;

  return (
    <AccordionPrimitive.Header
      className="rams-accordion__header"
      data-rams-primitive="true"
      data-slot="accordion-header"
    >
      <AccordionPrimitive.Trigger
        {...props}
        ref={ref}
        asChild={asChild}
        className={cx("rams-accordion__trigger", className)}
        data-rams-primitive="true"
        data-slot="accordion-trigger"
      >
        {trigger}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});

export type AccordionContentProps = Omit<
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>,
  "className"
> & { className?: string };

export const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  AccordionContentProps
>(function AccordionContent({ className, ...props }, ref) {
  return (
    <AccordionPrimitive.Content
      {...props}
      ref={ref}
      className={cx("rams-accordion__content", className)}
      data-rams-primitive="true"
      data-slot="accordion-content"
    />
  );
});

Accordion.displayName = "Accordion";
AccordionItem.displayName = "AccordionItem";
AccordionTrigger.displayName = "AccordionTrigger";
AccordionContent.displayName = "AccordionContent";
