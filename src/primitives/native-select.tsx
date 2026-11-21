"use client";

import * as React from "react";
import "./primitives.css";
import { cx } from "./utils";

export type NativeSelectSize = "default" | "sm";

export interface NativeSelectProps extends Omit<React.ComponentPropsWithoutRef<"select">, "className" | "size"> {
  size?: NativeSelectSize;
  className?: string;
}

export const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  function NativeSelect({ className, size = "default", ...props }, ref) {
    return (
      <select
        {...props}
        ref={ref}
        className={cx("rams-native-select", `rams-native-select--size-${size}`, className)}
        data-rams-primitive="true"
        data-size={size}
        data-slot="native-select"
      />
    );
  },
);

export interface NativeSelectOptionProps extends Omit<React.ComponentPropsWithoutRef<"option">, "className"> {
  className?: string;
}

export const NativeSelectOption = React.forwardRef<HTMLOptionElement, NativeSelectOptionProps>(
  function NativeSelectOption({ className, ...props }, ref) {
    return <option {...props} ref={ref} className={cx("rams-native-select__option", className)} data-rams-primitive="true" data-slot="native-select-option" />;
  },
);

export interface NativeSelectOptGroupProps extends Omit<React.ComponentPropsWithoutRef<"optgroup">, "className"> {
  className?: string;
}

export const NativeSelectOptGroup = React.forwardRef<HTMLOptGroupElement, NativeSelectOptGroupProps>(
  function NativeSelectOptGroup({ className, ...props }, ref) {
    return <optgroup {...props} ref={ref} className={cx("rams-native-select__optgroup", className)} data-rams-primitive="true" data-slot="native-select-optgroup" />;
  },
);

NativeSelect.displayName = "NativeSelect";
NativeSelectOption.displayName = "NativeSelectOption";
NativeSelectOptGroup.displayName = "NativeSelectOptGroup";
