"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";
import "./primitives.css";
import "./selection.css";
import { cx } from "./utils";

export type SwitchSize = "default" | "sm";

export type SwitchProps = Omit<
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>,
  "className"
> & {
  size?: SwitchSize;
  className?: string;
};

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(function Switch({ asChild = false, className, children, size = "default", ...props }, ref) {
  const thumb = <SwitchPrimitive.Thumb
    className="rams-switch__thumb"
    data-rams-primitive="true"
    data-slot="switch-thumb"
  />;
  const child = asChild ? React.Children.only(children) as React.ReactElement<{children?: React.ReactNode}> : null;
  const content = child
    ? React.cloneElement(child, undefined, thumb, child.props.children)
    : <>{thumb}{children}</>;
  return (
    <SwitchPrimitive.Root
      {...props}
      asChild={asChild}
      ref={ref}
      className={cx("rams-switch", `rams-switch--size-${size}`, className)}
      data-rams-primitive="true"
      data-size={size}
      data-slot="switch"
    >
      {content}
    </SwitchPrimitive.Root>
  );
});

Switch.displayName = "Switch";
