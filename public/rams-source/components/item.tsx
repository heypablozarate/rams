"use client";

import * as React from "react";
import { Slot } from "radix-ui";
import "./primitives.css";
import "./navigation.css";
import { Separator, type SeparatorProps } from "./separator";
import { cx } from "./utils";

export type ItemVariant = "default" | "outline" | "muted";
export type ItemSize = "default" | "sm" | "xs";

export type ItemProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "className"
> & {
  asChild?: boolean;
  className?: string;
  size?: ItemSize;
  variant?: ItemVariant;
};

export const Item = React.forwardRef<HTMLDivElement, ItemProps>(function Item(
  {
    asChild = false,
    className,
    size = "default",
    variant = "default",
    ...props
  },
  ref,
) {
  const shared = {
    ...props,
    className: cx(
      "rams-item",
      `rams-item--variant-${variant}`,
      `rams-item--size-${size}`,
      className,
    ),
    "data-rams-primitive": "true",
    "data-size": size,
    "data-slot": "item",
    "data-variant": variant,
  };
  return asChild ? (
    <Slot.Root {...shared} ref={ref} />
  ) : (
    <div {...shared} ref={ref} />
  );
});

type DivProps = Omit<React.ComponentPropsWithoutRef<"div">, "className"> & {
  className?: string;
};

function itemPart(
  slot: string,
  classToken: string,
): React.ForwardRefExoticComponent<
  DivProps & React.RefAttributes<HTMLDivElement>
> {
  return React.forwardRef<HTMLDivElement, DivProps>(function ItemPart(
    { className, ...props },
    ref,
  ) {
    return (
      <div
        {...props}
        ref={ref}
        className={cx(classToken, className)}
        data-rams-primitive="true"
        data-slot={slot}
      />
    );
  });
}

export const ItemContent = itemPart("item-content", "rams-item__content");
export const ItemActions = itemPart("item-actions", "rams-item__actions");
export const ItemHeader = itemPart("item-header", "rams-item__header");
export const ItemFooter = itemPart("item-footer", "rams-item__footer");
export const ItemGroup = itemPart("item-group", "rams-item__group");

export type ItemMediaVariant = "default" | "icon" | "image";
export type ItemMediaProps = DivProps & { variant?: ItemMediaVariant };

export const ItemMedia = React.forwardRef<HTMLDivElement, ItemMediaProps>(
  function ItemMedia({ className, variant = "default", ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        className={cx("rams-item__media", className)}
        data-variant={variant}
        data-rams-primitive="true"
        data-slot="item-media"
      />
    );
  },
);

export const ItemTitle = React.forwardRef<
  HTMLDivElement,
  DivProps & { asChild?: boolean }
>(function ItemTitle({ className, asChild = false, ...props }, ref) {
  const shared = {
    ...props,
    className: cx("rams-item__title", className),
    "data-rams-primitive": "true",
    "data-slot": "item-title",
  };
  return asChild ? (
    <Slot.Root {...shared} ref={ref} />
  ) : (
    <div {...shared} ref={ref} />
  );
});

export const ItemDescription = React.forwardRef<
  HTMLParagraphElement,
  Omit<React.ComponentPropsWithoutRef<"p">, "className"> & {
    className?: string;
  }
>(function ItemDescription({ className, ...props }, ref) {
  return (
    <p
      {...props}
      ref={ref}
      className={cx("rams-item__description", className)}
      data-rams-primitive="true"
      data-slot="item-description"
    />
  );
});

export type ItemSeparatorProps = Omit<SeparatorProps, "className"> & {
  className?: string;
};

export const ItemSeparator = React.forwardRef<
  HTMLDivElement,
  ItemSeparatorProps
>(function ItemSeparator({ className, ...props }, ref) {
  return (
    <Separator
      {...props}
      ref={ref}
      className={cx("rams-item__separator", className)}
      data-rams-primitive="true"
      data-slot="item-separator"
    />
  );
});

Item.displayName = "Item";
ItemTitle.displayName = "ItemTitle";
ItemDescription.displayName = "ItemDescription";
ItemMedia.displayName = "ItemMedia";
ItemSeparator.displayName = "ItemSeparator";
