"use client";

import * as React from "react";
import { Avatar as AvatarPrimitive } from "radix-ui";
import "./primitives.css";
import "./media.css";
import { cx } from "./utils";

export type AvatarSize = "sm" | "default" | "lg" | "xl";

export interface AvatarProps extends React.ComponentPropsWithoutRef<
  typeof AvatarPrimitive.Root
> {
  size?: AvatarSize;
}

export const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(function Avatar({ className, size = "default", ...props }, ref) {
  return (
    <AvatarPrimitive.Root
      {...props}
      ref={ref}
      data-rams-primitive="true"
      data-slot="avatar"
      data-size={size}
      className={cx("rams-avatar", `rams-avatar--size-${size}`, className)}
    />
  );
});
Avatar.displayName = "Avatar";

export const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(function AvatarImage({ className, ...props }, ref) {
  return (
    <AvatarPrimitive.Image
      {...props}
      ref={ref}
      data-rams-primitive="true"
      data-slot="avatar-image"
      className={cx("rams-avatar__image", className)}
    />
  );
});
AvatarImage.displayName = "AvatarImage";

export const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(function AvatarFallback({ className, ...props }, ref) {
  return (
    <AvatarPrimitive.Fallback
      {...props}
      ref={ref}
      data-rams-primitive="true"
      data-slot="avatar-fallback"
      className={cx("rams-avatar__fallback", className)}
    />
  );
});
AvatarFallback.displayName = "AvatarFallback";

export interface AvatarBadgeProps extends React.ComponentPropsWithoutRef<"span"> {}

export const AvatarBadge = React.forwardRef<HTMLSpanElement, AvatarBadgeProps>(
  function AvatarBadge({ className, ...props }, ref) {
    return (
      <span
        {...props}
        ref={ref}
        data-rams-primitive="true"
        data-slot="avatar-badge"
        className={cx("rams-avatar__badge", className)}
      />
    );
  },
);
AvatarBadge.displayName = "AvatarBadge";

export interface AvatarGroupProps extends React.ComponentPropsWithoutRef<"div"> {
  size?: AvatarSize;
}

export const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  function AvatarGroup({ className, size = "default", ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        data-rams-primitive="true"
        data-slot="avatar-group"
        data-size={size}
        role={props.role ?? "group"}
        className={cx(
          "rams-avatar-group",
          `rams-avatar-group--size-${size}`,
          className,
        )}
      />
    );
  },
);
AvatarGroup.displayName = "AvatarGroup";

export interface AvatarGroupCountProps extends React.ComponentPropsWithoutRef<"span"> {}

export const AvatarGroupCount = React.forwardRef<
  HTMLSpanElement,
  AvatarGroupCountProps
>(function AvatarGroupCount({ className, ...props }, ref) {
  return (
    <span
      {...props}
      ref={ref}
      data-rams-primitive="true"
      data-slot="avatar-group-count"
      className={cx("rams-avatar-group__count", className)}
    />
  );
});
AvatarGroupCount.displayName = "AvatarGroupCount";
