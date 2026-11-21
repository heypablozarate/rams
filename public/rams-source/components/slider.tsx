"use client";

import * as React from "react";
import { Slider as SliderPrimitive } from "radix-ui";
import "./primitives.css";
import "./ranges.css";
import { cx } from "./utils";

export type SliderProps = Omit<
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
  "className" | "asChild" | "children"
> & {
  className?: string;
  thumbLabels?: readonly string[];
};

export const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(function Slider(
  {
    "aria-label": rootLabel,
    "aria-labelledby": labelledBy,
    "aria-describedby": describedBy,
    "aria-valuetext": valueText,
    className,
    defaultValue,
    max = 100,
    min = 0,
    thumbLabels,
    value,
    ...props
  },
  ref,
) {
  const values = value ?? defaultValue ?? [min];

  return (
    <SliderPrimitive.Root
      {...props}
      ref={ref}
      value={value}
      defaultValue={defaultValue ?? (value === undefined ? [min] : undefined)}
      min={min}
      max={max}
      role={values.length > 1 ? "group" : props.role}
      aria-label={values.length > 1 ? rootLabel : undefined}
      aria-labelledby={values.length > 1 ? labelledBy : undefined}
      className={cx("rams-slider", className)}
      data-rams-primitive="true"
      data-slot="slider"
    >
      <SliderPrimitive.Track
        className="rams-slider__track"
        data-rams-primitive="true"
        data-slot="slider-track"
      >
        <SliderPrimitive.Range
          className="rams-slider__range"
          data-rams-primitive="true"
          data-slot="slider-range"
        />
      </SliderPrimitive.Track>
      {values.map((_, index) => {
        const explicitLabel = thumbLabels?.[index]?.trim();
        const singleThumbLabel =
          values.length === 1 ? rootLabel?.trim() : undefined;
        const fallbackLabel =
          values.length === 1
            ? singleThumbLabel || "Value"
            : index === 0
              ? "Minimum"
              : index === values.length - 1
                ? "Maximum"
                : `Value ${index + 1}`;

        return (
          <SliderPrimitive.Thumb
            key={index}
            aria-label={explicitLabel || fallbackLabel}
            aria-labelledby={
              !explicitLabel && values.length === 1 ? labelledBy : undefined
            }
            aria-describedby={describedBy}
            aria-valuetext={values.length === 1 ? valueText : undefined}
            className="rams-slider__thumb"
            data-rams-primitive="true"
            data-slot="slider-thumb"
          />
        );
      })}
    </SliderPrimitive.Root>
  );
});

Slider.displayName = "Slider";
