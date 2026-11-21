"use client";
import * as React from "react";
import { Combobox as B } from "@base-ui/react";
import { Button } from "./button";
import { Input } from "./input";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "./input-group";
import { cx } from "./utils";
import { floatingPlacement } from "./floating-placement";
import { MenuCheckIcon } from "./menu-parts";
import "./primitives.css";
import "./menus.css";
export const Combobox = B.Root,
  ComboboxValue = B.Value,
  ComboboxCollection = B.Collection;
function partClass<T>(
  own: string,
  extra?: string | ((state: T) => string | undefined),
) {
  return typeof extra === "function"
    ? (state: T) => cx(own, extra(state))
    : cx(own, extra);
}
function Chevron() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
      <path
        d="m4 6 4 4 4-4"
        stroke="currentColor"
        style={{ strokeWidth: "var(--rams-detail-combobox-control-icon-stroke)" }}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function Cross() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
      <path
        d="m4 4 8 8m0-8-8 8"
        stroke="currentColor"
        style={{ strokeWidth: "var(--rams-detail-combobox-control-icon-stroke)" }}
        strokeLinecap="round"
      />
    </svg>
  );
}
export const ComboboxTrigger = React.forwardRef<
  HTMLButtonElement,
  B.Trigger.Props
>(function ComboboxTrigger({ children, className, ...props }, ref) {
  return (
    <B.Trigger
      aria-label="Show options"
      {...props}
      ref={ref}
      className={partClass("rams-combobox__trigger", className)}
      data-slot="combobox-trigger"
      data-rams-primitive="true"
    >
      {children ?? <Chevron />}
    </B.Trigger>
  );
});
export const ComboboxClear = React.forwardRef<HTMLButtonElement, B.Clear.Props>(
  function ComboboxClear({ children, className, render, ...props }, ref) {
    return (
      <B.Clear
        aria-label="Clear selection"
        {...props}
        ref={ref}
        render={render ?? <InputGroupButton size="icon-xs" />}
        className={partClass("rams-combobox__clear", className)}
        data-slot="combobox-clear"
      >
        {children ?? <Cross />}
      </B.Clear>
    );
  },
);
export type ComboboxInputProps = B.Input.Props & {
  showTrigger?: boolean;
  showClear?: boolean;
  containerClassName?: string;
};
export const ComboboxInput = React.forwardRef<
  HTMLInputElement,
  ComboboxInputProps
>(function ComboboxInput(
  {
    children,
    className,
    showTrigger = true,
    showClear = false,
    containerClassName,
    disabled = false,
    render,
    ...props
  },
  ref,
) {
  return (
    <B.InputGroup
      render={
        <InputGroup
          className={cx("rams-combobox__input-group", containerClassName)}
        />
      }
    >
      <B.Input
        {...props}
        disabled={disabled}
        ref={ref}
        render={render ?? <InputGroupInput />}
        className={partClass("rams-combobox__input", className)}
        data-slot="combobox-input"
      />
      {(showTrigger || showClear) && (
        <InputGroupAddon align="inline-end">
          {showTrigger && (
            <ComboboxTrigger
              disabled={disabled}
              render={<InputGroupButton size="icon-xs" />}
            />
          )}{" "}
          {showClear && <ComboboxClear disabled={disabled} />}
        </InputGroupAddon>
      )}
      {children}
    </B.InputGroup>
  );
});
export type ComboboxContentProps = B.Popup.Props &
  Pick<
    B.Positioner.Props,
    "anchor" | "side" | "align" | "sideOffset" | "alignOffset"
  >;
export const ComboboxContent = React.forwardRef<
  HTMLDivElement,
  ComboboxContentProps
>(function ComboboxContent(
  {
    className,
    anchor,
    side = "bottom",
    align = "start",
    sideOffset = floatingPlacement.nativeCombobox.anchorGapPx,
    alignOffset = floatingPlacement.nativeCombobox.alignOffsetPx,
    ...props
  },
  ref,
) {
  return (
    <B.Portal>
      <B.Positioner
        anchor={anchor}
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className="rams-combobox__positioner"
      >
        <B.Popup
          {...props}
          ref={ref}
          className={partClass("rams-combobox__content", className)}
          data-slot="combobox-content"
          data-rams-primitive="true"
        />
      </B.Positioner>
    </B.Portal>
  );
});
export const ComboboxList = React.forwardRef<HTMLDivElement, B.List.Props>(
  function ComboboxList({ className, ...props }, ref) {
    return (
      <B.List
        {...props}
        ref={ref}
        className={partClass("rams-combobox__list", className)}
        data-slot="combobox-list"
      />
    );
  },
);
export const ComboboxItem = React.forwardRef<HTMLDivElement, B.Item.Props>(
  function ComboboxItem({ children, className, ...props }, ref) {
    return (
      <B.Item
        {...props}
        ref={ref}
        className={partClass("rams-combobox__item", className)}
        data-slot="combobox-item"
        data-rams-primitive="true"
      >
        {children}
        <B.ItemIndicator
          className="rams-combobox__indicator"
          aria-hidden="true"
        >
          <MenuCheckIcon />
        </B.ItemIndicator>
      </B.Item>
    );
  },
);
export const ComboboxGroup = React.forwardRef<HTMLDivElement, B.Group.Props>(
  function ComboboxGroup({ className, ...props }, ref) {
    return (
      <B.Group
        {...props}
        ref={ref}
        className={partClass("rams-combobox__group", className)}
        data-slot="combobox-group"
      />
    );
  },
);
export const ComboboxLabel = React.forwardRef<
  HTMLDivElement,
  B.GroupLabel.Props
>(function ComboboxLabel({ className, ...props }, ref) {
  return (
    <B.GroupLabel
      {...props}
      ref={ref}
      className={partClass("rams-menu__label", className)}
      data-slot="combobox-label"
    />
  );
});
export const ComboboxEmpty = React.forwardRef<HTMLDivElement, B.Empty.Props>(
  function ComboboxEmpty({ className, ...props }, ref) {
    return (
      <B.Empty
        {...props}
        ref={ref}
        className={partClass("rams-combobox__empty", className)}
        data-slot="combobox-empty"
      />
    );
  },
);
export const ComboboxSeparator = React.forwardRef<
  HTMLDivElement,
  B.Separator.Props
>(function ComboboxSeparator({ className, ...props }, ref) {
  return (
    <B.Separator
      {...props}
      ref={ref}
      className={partClass("rams-menu__separator", className)}
      data-slot="combobox-separator"
    />
  );
});
export const ComboboxChips = React.forwardRef<HTMLDivElement, B.Chips.Props>(
  function ComboboxChips({ className, ...props }, ref) {
    return (
      <B.Chips
        {...props}
        ref={ref}
        className={partClass("rams-combobox__chips", className)}
        data-slot="combobox-chips"
        data-rams-primitive="true"
      />
    );
  },
);
export type ComboboxChipProps = B.Chip.Props & {
  showRemove?: boolean;
  removeLabel?: string;
};
export const ComboboxChip = React.forwardRef<HTMLDivElement, ComboboxChipProps>(
  function ComboboxChip(
    { children, className, showRemove = true, removeLabel, ...props },
    ref,
  ) {
    return (
      <B.Chip
        {...props}
        ref={ref}
        className={partClass("rams-combobox__chip", className)}
        data-slot="combobox-chip"
        data-rams-primitive="true"
      >
        {children}
        {showRemove && (
          <B.ChipRemove
            aria-label={
              removeLabel ??
              (typeof children === "string"
                ? "Remove " + children
                : "Remove selection")
            }
            render={<Button variant="ghost" size="icon-xs" />}
            className="rams-combobox__chip-remove"
          >
            <Cross />
          </B.ChipRemove>
        )}
      </B.Chip>
    );
  },
);
export const ComboboxChipsInput = React.forwardRef<
  HTMLInputElement,
  B.Input.Props
>(function ComboboxChipsInput({ className, render, ...props }, ref) {
  return (
    <B.Input
      {...props}
      ref={ref}
      render={render ?? <Input />}
      className={partClass("rams-combobox__chips-input", className)}
      data-slot="combobox-chips-input"
    />
  );
});
export function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null);
}
