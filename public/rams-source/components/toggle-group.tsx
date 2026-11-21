"use client";

import * as React from "react";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import "./primitives.css";
import "./selection.css";
import { cx } from "./utils";
import {
  toggleVariants,
  type ToggleSize,
  type ToggleVariant,
} from "./toggle";

const ToggleGroupStyleContext = React.createContext<{
  variant: ToggleVariant;
  size: ToggleSize;
}>({ variant: "default", size: "default" });

export type ToggleGroupProps = React.ComponentPropsWithoutRef<
  typeof ToggleGroupPrimitive.Root
> & {
  variant?: ToggleVariant;
  size?: ToggleSize;
  className?: string;
};

export const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  ToggleGroupProps
>(function ToggleGroup(
  { className, size = "default", variant = "default", ...props },
  ref,
) {
  return (
    <ToggleGroupStyleContext.Provider value={{ variant, size }}>
      <ToggleGroupPrimitive.Root
        {...props}
        role={props.role ?? (props.type === "single" ? "radiogroup" : "group")}
        ref={ref}
        className={cx("rams-toggle-group", className)}
        data-rams-primitive="true"
        data-size={size}
        data-slot="toggle-group"
        data-variant={variant}
      />
    </ToggleGroupStyleContext.Provider>
  );
});

export type ToggleGroupItemProps = Omit<
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>,
  "className"
> & {
  className?: string;
};

export const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  ToggleGroupItemProps
>(function ToggleGroupItem({ className, ...props }, ref) {
  const { size, variant } = React.useContext(ToggleGroupStyleContext);
  return (
    <ToggleGroupPrimitive.Item
      {...props}
      ref={ref}
      className={cx(
        "rams-toggle-group__item",
        toggleVariants({ variant, size }),
        className,
      )}
      data-rams-primitive="true"
      data-size={size}
      data-slot="toggle-group-item"
      data-variant={variant}
    />
  );
});

ToggleGroup.displayName = "ToggleGroup";
ToggleGroupItem.displayName = "ToggleGroupItem";
