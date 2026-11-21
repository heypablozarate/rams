"use client";
import * as React from "react";
import {
  DayPicker,
  getDefaultClassNames,
  type DayButtonProps,
  type ChevronProps,
  type RootProps,
  type SelectProps,
} from "react-day-picker";
import { Button, type ButtonProps } from "./button";
import { collectionPresentation } from "./collection-presentation";
import { NativeSelect } from "./native-select";
import { cx } from "./utils";
import "./primitives.css";
import "./dates.css";
const NavigationVariant = React.createContext<ButtonProps["variant"]>("ghost");
function CalendarRoot({ rootRef, className, ...props }: RootProps) {
  return (
    <div
      {...props}
      ref={rootRef}
      data-rams-primitive="true"
      data-slot="calendar"
      className={cx("rams-calendar", className)}
    />
  );
}
function CalendarNavigation(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>,
) {
  const variant = React.useContext(NavigationVariant);
  return <Button {...props} variant={variant} size="icon-sm" type="button" />;
}
function CalendarChevron({
  orientation = "left",
  className,
  size,
  ...props
}: ChevronProps) {
  const renderedSize = size ?? "var(--rams-detail-calendar-chevron-size)";
  const path =
    orientation === "left"
      ? "m14 5-7 7 7 7"
      : orientation === "right"
        ? "m10 5 7 7-7 7"
        : orientation === "up"
          ? "m5 14 7-7 7 7"
          : "m5 10 7 7 7-7";
  return (
    <svg
      {...props}
      className={className}
      width={renderedSize}
      height={renderedSize}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={path}
        stroke="currentColor"
        strokeWidth="var(--rams-detail-disclosure-chevron-stroke-width)"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function CalendarSelect({ size: _listRows, ...props }: SelectProps) {
  // DayPicker's caption is a single-choice dropdown, not an HTML size-N listbox.
  return <NativeSelect {...props} size="sm" />;
}
export function CalendarDayButton({
  day: _day,
  modifiers,
  className,
  ...props
}: DayButtonProps) {
  const button = React.useRef<HTMLButtonElement>(null);
  // DayPicker moves its logical focused day; the custom RAMS control receives focus.
  React.useEffect(() => {
    if (modifiers.focused) {
      button.current?.focus();
      button.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }, [modifiers.focused]);
  const single =
    modifiers.selected &&
    !modifiers.range_start &&
    !modifiers.range_end &&
    !modifiers.range_middle;
  return (
    <Button
      {...props}
      ref={button}
      type="button"
      variant="ghost"
      size="icon"
      data-selected-single={single || undefined}
      data-range-start={modifiers.range_start || undefined}
      data-range-end={modifiers.range_end || undefined}
      data-range-middle={modifiers.range_middle || undefined}
      className={cx("rams-calendar__day_button", className)}
    />
  );
}
export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: ButtonProps["variant"];
};
export function Calendar({
  buttonVariant = "ghost",
  className,
  classNames,
  components,
  formatters,
  style,
  showOutsideDays = true,
  captionLayout = "label",
  numberOfMonths = collectionPresentation.calendarDefaultMonths,
  autoFocus,
  initialFocus,
  ...props
}: CalendarProps) {
  const native = getDefaultClassNames();
  const names = Object.fromEntries(
    Object.entries(native).map(([key, value]) => [
      key,
      cx(
        value,
        "rams-calendar__" + key,
        classNames?.[key as keyof typeof classNames],
      ),
    ]),
  ) as typeof native;
  return (
    <NavigationVariant.Provider value={buttonVariant}>
      <DayPicker
        {...props}
        autoFocus={autoFocus ?? initialFocus}
        numberOfMonths={numberOfMonths}
        showOutsideDays={showOutsideDays}
        captionLayout={captionLayout}
        className={className}
        classNames={names}
        formatters={{
          // Retain the date library's locale while keeping caption controls compact.
          formatMonthDropdown: (date, dateLib) =>
            dateLib?.format(date, "LLL") ?? date.toLocaleString(undefined, { month: "short" }),
          ...formatters,
        }}
        style={
          {
            "--rams-calendar-months": numberOfMonths,
            "--rams-calendar-columns": props.showWeekNumber ? 8 : 7,
            ...style,
          } as React.CSSProperties
        }
        components={{
          Root: CalendarRoot,
          PreviousMonthButton: CalendarNavigation,
          NextMonthButton: CalendarNavigation,
          Chevron: CalendarChevron,
          DayButton: CalendarDayButton,
          Select: CalendarSelect,
          ...components,
        }}
      />
    </NavigationVariant.Provider>
  );
}
