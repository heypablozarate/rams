"use client";

import * as React from "react";
import { useComposedRefs } from "@radix-ui/react-compose-refs";
import "./primitives.css";
import "./selection.css";
import { cx } from "./utils";

export interface RadioGroupProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "defaultValue" | "dir"
> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Empty or omitted names receive a shared, nonempty generated name. */
  name?: string;
  form?: string;
  required?: boolean;
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
  dir?: "ltr" | "rtl";
  loop?: boolean;
  /** Selection palette only; keyboard, validation and grouping stay unchanged. */
  tone?: "accent" | "neutral";
}

type GroupContext = {
  id: string;
  value: string | undefined;
  resetValue: string | undefined;
  name: string;
  form: string | undefined;
  required: boolean;
  disabled: boolean;
  select: (value: string) => void;
  hasPendingReset: (owner: HTMLFormElement | null) => boolean;
  register: (node: HTMLInputElement) => () => void;
};
const Context = React.createContext<GroupContext | null>(null);

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  function RadioGroup(
    {
      value,
      defaultValue,
      onValueChange,
      name,
      form,
      required = false,
      disabled = false,
      orientation,
      dir,
      loop = true,
      tone = "accent",
      className,
      onKeyDown,
      ...props
    },
    ref,
  ) {
    if ("asChild" in props) {
      throw new Error("RadioGroup renders a div; asChild is not supported.");
    }
    const id = React.useId();
    const groupName =
      name === undefined || name === "" ? `rams-radio-${id}` : name;
    const root = React.useRef<HTMLDivElement>(null);
    const composedRef = useComposedRefs(root, ref);
    const initial = React.useRef(defaultValue);
    const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
    const controlled = value !== undefined;
    const selected = controlled ? value : uncontrolled;
    const latest = React.useRef({ controlled, selected, onValueChange });
    React.useLayoutEffect(() => {
      latest.current = { controlled, selected, onValueChange };
    }, [controlled, selected, onValueChange]);
    const selectionGeneration = React.useRef(0);
    const forms = React.useRef(
      new Map<
        HTMLFormElement,
        {
          count: number;
          reset: (event: Event) => void;
          detach: () => void;
          hasPending: (generation: number) => boolean;
        }
      >(),
    );

    const select = React.useCallback((next: string) => {
      selectionGeneration.current += 1;
      if (!latest.current.controlled) setUncontrolled(next);
      latest.current.onValueChange?.(next);
    }, []);
    const hasPendingReset = React.useCallback(
      (owner: HTMLFormElement | null) =>
        !latest.current.controlled &&
        owner !== null &&
        (forms.current.get(owner)?.hasPending(selectionGeneration.current) ??
          false),
      [],
    );

    // Microtasks can run before the reset default action and delegated cancellation.
    // Native defaults supply correct form data immediately; the next frame only
    // reconciles uncontrolled React state after the entire dispatch has completed.
    const register = React.useCallback((node: HTMLInputElement) => {
      const owner = node.form;
      if (owner) {
        const existing = forms.current.get(owner);
        if (existing) existing.count += 1;
        else {
          let attached = true;
          let frame: number | undefined;
          let pending: { event: Event; generation: number }[] = [];
          const reset = (event: Event) => {
            pending.push({ event, generation: selectionGeneration.current });
            if (frame !== undefined) return;
            frame = requestAnimationFrame(() => {
              frame = undefined;
              const valid = pending.some(
                (row) =>
                  !row.event.defaultPrevented &&
                  row.generation === selectionGeneration.current,
              );
              pending = [];
              if (
                !attached ||
                !valid ||
                !root.current ||
                latest.current.controlled
              )
                return;
              setUncontrolled(initial.current);
            });
          };
          // Cleanup invalidates an already queued reset as well as the listener.
          const entry = {
            count: 1,
            reset,
            hasPending: (generation: number) =>
              attached &&
              pending.some(
                (row) =>
                  row.generation === generation && !row.event.defaultPrevented,
              ),
            detach: () => {
              attached = false;
              if (frame !== undefined) cancelAnimationFrame(frame);
              pending = [];
            },
          };
          forms.current.set(owner, entry);
          owner.addEventListener("reset", reset);
        }
      }
      return () => {
        if (!owner) return;
        const entry = forms.current.get(owner);
        if (!entry || --entry.count > 0) return;
        owner.removeEventListener("reset", entry.reset);
        entry.detach();
        forms.current.delete(owner);
      };
    }, []);

    function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
      onKeyDown?.(event);
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey
      )
        return;
      const target = event.target as HTMLInputElement;
      if (target.dataset?.radioGroup !== id || target.type !== "radio") return;
      const items = Array.from(
        root.current?.querySelectorAll<HTMLInputElement>(
          "input[data-slot='radio-group-item']",
        ) ?? [],
      ).filter(
        (input) =>
          input.dataset.radioGroup === id && !input.matches(":disabled"),
      );
      if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        (event.key === "Home" ? items[0] : items.at(-1))?.focus();
        return;
      }
      const horizontal =
        event.key === "ArrowLeft" || event.key === "ArrowRight";
      const vertical = event.key === "ArrowUp" || event.key === "ArrowDown";
      if (!horizontal && !vertical) return;
      if (
        (orientation === "vertical" && horizontal) ||
        (orientation === "horizontal" && vertical)
      ) {
        event.preventDefault();
        return;
      }
      if (!loop) {
        const rtl = getComputedStyle(target).direction === "rtl";
        const forward =
          event.key === "ArrowDown" ||
          event.key === (rtl ? "ArrowLeft" : "ArrowRight");
        if (target === (forward ? items.at(-1) : items[0]))
          event.preventDefault();
      }
      // All accepted arrows retain the input's native focus/selection default.
    }

    return (
      <Context.Provider
        value={{
          id,
          value: selected,
          resetValue: controlled ? selected : initial.current,
          name: groupName,
          form,
          required,
          disabled,
          select,
          hasPendingReset,
          register,
        }}
      >
        <div
          {...props}
          ref={composedRef}
          role="radiogroup"
          dir={dir}
          aria-orientation={orientation}
          aria-required={required || undefined}
          aria-disabled={disabled || undefined}
          className={cx("rams-radio-group", className)}
          data-rams-primitive="true"
          data-slot="radio-group"
          data-tone={tone}
          data-orientation={orientation}
          data-disabled={disabled || undefined}
          onKeyDown={handleKeyDown}
        />
      </Context.Provider>
    );
  },
);

type UnsupportedItemProp =
  | "children"
  | "type"
  | "checked"
  | "defaultChecked"
  | "name"
  | "form";
export type RadioGroupItemProps = Omit<
  React.ComponentPropsWithoutRef<"input">,
  UnsupportedItemProp | "value"
> & {
  value: string;
};

export const RadioGroupItem = React.forwardRef<
  HTMLInputElement,
  RadioGroupItemProps
>(function RadioGroupItem(
  { value, className, disabled = false, required, onChange, onInput, ...props },
  ref,
) {
  for (const key of [
    "children",
    "asChild",
    "type",
    "checked",
    "defaultChecked",
    "name",
    "form",
  ] as const) {
    if (key in props)
      throw new Error(
        `RadioGroupItem is a native radio input; ${key} is owned by RadioGroup or unsupported.`,
      );
  }
  const group = React.useContext(Context);
  if (!group) throw new Error("RadioGroupItem must be inside RadioGroup.");
  const input = React.useRef<HTMLInputElement>(null);
  const composedRef = useComposedRefs(input, ref);
  React.useLayoutEffect(() => {
    // React updates checked without updating defaultChecked on controlled inputs.
    // Keep native reset's destination current without supplying competing props.
    if (input.current)
      input.current.defaultChecked =
        group.resetValue !== undefined && group.resetValue === value;
  }, [group.resetValue, value]);
  const { register, form } = group;
  React.useLayoutEffect(() => {
    const node = input.current;
    return node ? register(node) : undefined;
  }, [register, form]);
  const checked = group.value !== undefined && group.value === value;
  return (
    <input
      {...props}
      ref={composedRef}
      type="radio"
      name={group.name}
      form={form}
      value={value}
      checked={checked}
      required={group.required || required}
      disabled={group.disabled || disabled}
      className={cx("rams-radio-group__item", className)}
      data-rams-primitive="true"
      data-slot="radio-group-item"
      data-radio-group={group.id}
      data-state={checked ? "checked" : "unchecked"}
      onChange={(event) => {
        onChange?.(event);
        if (!event.defaultPrevented && event.currentTarget.checked)
          group.select(value);
      }}
      onInput={(event) => {
        // Native reset can leave React's change tracker at the prior selection.
        // Recover only an actual input during that still-pending reset; ordinary
        // onChange already advances its generation, so it cannot emit twice.
        const owner = event.currentTarget.form;
        const pending = group.hasPendingReset(owner);
        onInput?.(event);
        if (
          pending &&
          !event.defaultPrevented &&
          event.currentTarget.checked &&
          event.currentTarget.form === owner &&
          group.hasPendingReset(owner)
        )
          group.select(value);
      }}
    />
  );
});

RadioGroup.displayName = "RadioGroup";
RadioGroupItem.displayName = "RadioGroupItem";
