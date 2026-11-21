"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "radix-ui";
import "./primitives.css";
import "./selection.css";
import { cx } from "./utils";

export type TabsProps = Omit<
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>,
  "className"
> & { className?: string };

export const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  TabsProps
>(function Tabs({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Root
      {...props}
      ref={ref}
      className={cx("rams-tabs", className)}
      data-rams-primitive="true"
      data-slot="tabs"
    />
  );
});

export type TabsListProps = Omit<
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
  "className"
> & { className?: string; variant?: "default" | "line" };

export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(function TabsList({ className, variant = "default", ...props }, ref) {
  return (
    <TabsPrimitive.List
      {...props}
      ref={ref}
      className={cx("rams-tabs__list", `rams-tabs__list--variant-${variant}`, className)}
      data-rams-primitive="true"
      data-slot="tabs-list"
      data-variant={variant}
    />
  );
});

export type TabsTriggerProps = Omit<
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>,
  "className"
> & { className?: string };

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(function TabsTrigger({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Trigger
      {...props}
      ref={ref}
      className={cx("rams-tabs__trigger", className)}
      data-rams-primitive="true"
      data-slot="tabs-trigger"
    />
  );
});

export type TabsContentProps = Omit<
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>,
  "className"
> & { className?: string };

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  TabsContentProps
>(function TabsContent({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Content
      {...props}
      ref={ref}
      className={cx("rams-tabs__content", className)}
      data-rams-primitive="true"
      data-slot="tabs-content"
    />
  );
});

Tabs.displayName = "Tabs";
TabsList.displayName = "TabsList";
TabsTrigger.displayName = "TabsTrigger";
TabsContent.displayName = "TabsContent";
