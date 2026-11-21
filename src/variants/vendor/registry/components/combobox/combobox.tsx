"use client";

import { MotionPresenceButton as MotionOwnButton, MotionPresenceDiv } from "@/variants/presence-controls";
import { Input as OwnInput } from "@/primitives/input";
import { floatingPlacement } from "@/primitives/floating-placement";

import { animate, AnimatePresence, motion, visualElementStore, useMotionValue } from "motion/react";
import { Popover as Floating } from "radix-ui";
import { useReducedMotion } from "@/variants/use-motion-preference";
import { Check, ChevronDown, Search, X } from "rams-icons";
import {
  forwardRef,
  useEffect,
  useId,
  useLayoutEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type { InputHTMLAttributes, KeyboardEvent, MouseEvent as ReactMouseEvent, ReactNode } from "react";
import { motionTokens } from "@/variants/vendor/lib/motion-tokens";
import styles from "./combobox.module.css";

const { combobox: comboboxMotion, popover: popoverMotion, menuValueSwap, searchField, statusSwap } = motionTokens.keyframes;
const placement = floatingPlacement.motionCombobox;


export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
  keywords?: string[];
}

export interface ComboboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "placeholder"> {
  label: string;
  options: ComboboxOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  description?: string;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
}

/** Follows the listbox height with a critically damped spring, so filtering never snaps the menu. */
function AutoHeight({ children, reduceMotion }: { children: ReactNode; reduceMotion: boolean | null }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const height = useMotionValue<number | "auto">("auto");
  useLayoutEffect(() => {
    const inner = innerRef.current;
    if (reduceMotion || !inner || typeof ResizeObserver === "undefined") return;
    height.jump(inner.offsetHeight);
    const observer = new ResizeObserver(() => {
      const next = inner.offsetHeight;
      if (height.get() !== next) animate(height, next, motionTokens.spring.smooth);
    });
    observer.observe(inner);
    return () => { observer.disconnect(); height.stop(); };
  }, [height, reduceMotion]);
  return <motion.div className={styles.autoHeight} style={{ height: reduceMotion ? "auto" : height }}><div ref={innerRef}>{children}</div></motion.div>;
}

function EmptyOption({ message, reduced }: { message: string; reduced: boolean | null }) {
  const reducedWhileEmpty = useRef(Boolean(reduced));
  useLayoutEffect(() => {
    if (reduced) reducedWhileEmpty.current = true;
  }, [reduced]);
  if (reduced || reducedWhileEmpty.current) return <div className={styles.empty} role="status">{message}</div>;
  return <motion.div className={styles.empty} role="status"
    initial={{ opacity: 0, y: comboboxMotion.emptyEnterTravelPx, filter: `blur(${motionTokens.blur.soft}px)` }}
    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    transition={{ duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] }}>{message}</motion.div>;
}

export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(function Combobox(
  {
    label,
    options,
    value: controlledValue,
    defaultValue = "",
    onValueChange,
    description,
    placeholder = "Search or select…",
    emptyMessage = "No matches found",
    id,
    className,
    disabled,
    readOnly,
    onClick,
    onKeyDown,
    onFocus,
    ...inputProps
  },
  forwardedRef,
) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const listboxId = `${controlId}-listbox`;
  const hintId = description ? `${controlId}-description` : undefined;
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const reduceMotion = useReducedMotion();
  useLayoutEffect(() => {
    if (!reduceMotion || !panelRef.current) return;
    const visual = visualElementStore.get(panelRef.current);
    for (const key of ["opacity", "y", "scale"]) {
      const controls = visual?.getValue(key)?.animation;
      if (controls && "complete" in controls && typeof controls.complete === "function") controls.complete();
    }
  }, [reduceMotion]);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const [{ open, opening }, setOpenState] = useState({ open: false, opening: 0 });
  const setOpen = (next: boolean) => setOpenState(state => ({ open: next, opening: next && !state.open ? state.opening + 1 : state.opening }));
  const visibleOpen = open && !disabled && !readOnly;
  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr");
  useLayoutEffect(() => {
    const control = inputRef.current;
    if (!visibleOpen || !control) return;
    const sync = () => setDirection(getComputedStyle(control).direction === "rtl" ? "rtl" : "ltr");
    sync();
    if (typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver(sync);
    for (let element: Element | null = control; element; element = element.parentElement) {
      observer.observe(element, { attributes: true, attributeFilter: ["dir", "class", "style"] });
    }
    return () => observer.disconnect();
  }, [visibleOpen]);
  useEffect(() => { if (disabled || readOnly) setOpen(false); }, [disabled, readOnly]);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const selectedValue = controlledValue ?? uncontrolledValue;
  const selectedOption = options.find((option) => option.value === selectedValue);

  useImperativeHandle(forwardedRef, () => inputRef.current as HTMLInputElement);

  // A chosen label settles into the field: it rises in from below with a soft blur. Clearing fades the
  // placeholder in instead of snapping from the old label.
  const settledValue = useRef(selectedValue);
  useEffect(() => {
    if (settledValue.current === selectedValue) return;
    settledValue.current = selectedValue;
    const input = inputRef.current;
    if (!input || reduceMotion || (selectedValue && open)) return;
    const controls = selectedValue
      ? animate(input, { opacity: [0, 1], y: [`${menuValueSwap.selectValueEnterTravelEm}em`, "0em"], filter: [`blur(${motionTokens.blur.soft}px)`, "blur(0px)"] }, { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] })
      : animate(input, { opacity: [0, 1] }, { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.enter] });
    return () => controls.complete();
  }, [selectedValue, reduceMotion, open]);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return options;
    return options.filter((option) =>
      [option.label, ...(option.keywords ?? [])].some((term) => term.toLocaleLowerCase().includes(normalizedQuery)),
    );
  }, [options, query]);

  const enabledIndices = filteredOptions.reduce<number[]>((indices, option, index) => {
    if (!option.disabled) indices.push(index);
    return indices;
  }, []);

  useEffect(() => {
    if (!open) return;
    const activeOption = activeIndex >= 0 ? filteredOptions[activeIndex] : undefined;
    const option = activeOption ? optionRefs.current[activeOption.value] : null;
    const listbox = option?.parentElement;
    if (option && listbox) {
      const top = option.offsetTop;
      const bottom = top + option.offsetHeight;
      if (top < listbox.scrollTop) listbox.scrollTop = top;
      else if (bottom > listbox.scrollTop + listbox.clientHeight) listbox.scrollTop = bottom - listbox.clientHeight;
    }
  }, [activeIndex, filteredOptions, open]);


  const choose = (option: ComboboxOption) => {
    if (disabled || readOnly || option.disabled) return;
    setUncontrolledValue(option.value);
    setQuery("");
    setOpen(false);
    inputRef.current?.focus({ preventScroll: true });
    onValueChange?.(option.value);
  };

  const clear = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (disabled || readOnly) return;
    setUncontrolledValue("");
    setQuery("");
    setOpen(true);
    inputRef.current?.focus({ preventScroll: true });
    onValueChange?.("");
  };

  const openMenu = () => {
    if (disabled || readOnly || open) return;
    setOpen(true);
    setQuery("");
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (disabled || readOnly) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        openMenu();
        return;
      }
      if (!enabledIndices.length) return;
      const currentPosition = enabledIndices.indexOf(activeIndex);
      const nextPosition = currentPosition < 0
        ? (event.key === "ArrowDown" ? 0 : enabledIndices.length - 1)
        : event.key === "ArrowDown"
          ? (currentPosition + 1) % enabledIndices.length
          : (currentPosition - 1 + enabledIndices.length) % enabledIndices.length;
      setActiveIndex(enabledIndices[nextPosition]!);
      return;
    }
    if (event.key === "Enter" && open && activeIndex >= 0) {
      event.preventDefault();
      const option = filteredOptions[activeIndex];
      if (option) choose(option);
      return;
    }
    if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
      setQuery("");
      return;
    }
  };

  const inputValue = visibleOpen ? query : selectedOption?.label ?? "";
  const activeOption = activeIndex >= 0 ? filteredOptions[activeIndex] : undefined;

  return (
    <Floating.Root open={visibleOpen} onOpenChange={next => { setOpen(next); if (!next) setQuery(""); }}><div ref={rootRef} className={styles.field}>
      <label htmlFor={controlId}>{label}</label>
      <Floating.Anchor asChild><div className={[styles.control, visibleOpen ? styles.open : "", disabled ? styles.disabled : "", className ?? ""].filter(Boolean).join(" ")}>
        <Search className={styles.searchIcon} size="var(--rams-detail-motion-button-glyph-size)" strokeWidth="var(--rams-detail-motion-button-glyph-stroke)" aria-hidden="true" />
        <OwnInput
          {...inputProps}
          ref={inputRef}
          id={controlId}
          type="text"
          role="combobox"
          value={inputValue}
          // While searching, the chosen label stays in place as muted placeholder copy instead of vanishing.
          placeholder={selectedOption?.label ?? placeholder}
          disabled={disabled}
          readOnly={readOnly}
          aria-describedby={[inputProps["aria-describedby"], hintId].filter(Boolean).join(" ") || undefined}
          aria-expanded={visibleOpen}
          aria-controls={visibleOpen ? listboxId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={visibleOpen && activeOption ? `${controlId}-option-${activeOption.value}` : undefined}
          onFocus={(event) => {
            onFocus?.(event);
            if (!event.defaultPrevented) openMenu();
          }}
          onClick={event => { onClick?.(event); if (!event.defaultPrevented) openMenu(); }}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
        />
        <AnimatePresence initial={false}>
          {selectedOption && !disabled && (
            <MotionOwnButton
              type="button"
              className={styles.clear}
              disabled={disabled || readOnly}
              aria-label="Clear selection"
              onMouseDown={event => event.preventDefault()}
              onClick={clear}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: statusSwap.iconEnterScale, filter: `blur(${motionTokens.blur.subtle}px)` }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)", transition: reduceMotion ? { duration: motionTokens.reduced.duration } : { ...motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.fast } } }}
              exit={{ opacity: 0, ...(reduceMotion ? {} : { scale: statusSwap.iconEnterScale, filter: `blur(${motionTokens.blur.subtle}px)` }), transition: { duration: motionTokens.duration.instant, ease: [...motionTokens.ease.standard] } }}
              whileTap={{ scale: reduceMotion ? 1 : searchField.clearPressScale, transition: { duration: motionTokens.duration.instant, ease: [...motionTokens.ease.standard] } }} transition={reduceMotion ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : undefined}
            >
              <X size="var(--rams-detail-motion-button-glyph-size)" strokeWidth="var(--rams-detail-motion-button-glyph-stroke)" aria-hidden="true" />
            </MotionOwnButton>
          )}
        </AnimatePresence>
        <ChevronDown className={styles.chevron} size="var(--rams-detail-motion-button-glyph-size)" strokeWidth="var(--rams-detail-motion-button-glyph-stroke)" aria-hidden="true" />
      </div></Floating.Anchor>
      {description && <span id={hintId} className={styles.hint}>{description}</span>}
      <AnimatePresence initial={false}>
        {visibleOpen && (
          <Floating.Portal forceMount><Floating.Content key={opening} forceMount asChild side="bottom" dir={direction} align="start" sideOffset={placement.anchorGapPx} collisionPadding={placement.collisionInsetPx}
            onOpenAutoFocus={event => event.preventDefault()} onCloseAutoFocus={event => event.preventDefault()}
            onInteractOutside={event => { if (rootRef.current?.contains(event.target as Node)) event.preventDefault(); }}><MotionPresenceDiv ref={panelRef}
            className={styles.popover}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -comboboxMotion.panelEnterTravelPx, scale: popoverMotion.enterScale }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: reduceMotion ? { duration: motionTokens.reduced.duration } : { ...motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.enter] } } }}
            exit={{ opacity: 0, ...(reduceMotion ? {} : { y: -comboboxMotion.panelExitTravelPx, scale: popoverMotion.exitScale }), transition: { duration: motionTokens.duration.instant, ease: [...motionTokens.ease.standard] } }}
            role="presentation" transition={reduceMotion ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : undefined}
          >
            <AutoHeight reduceMotion={reduceMotion}>
            <div id={listboxId} className={styles.listbox} role="listbox" aria-label={`${label} options`}>
              {filteredOptions.length ? filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  ref={(element) => { optionRefs.current[option.value] = element; }}
                  id={`${controlId}-option-${option.value}`}
                  className={styles.option}
                  data-active={index === activeIndex ? "true" : undefined}
                  data-disabled={option.disabled ? "true" : undefined}
                  role="option"
                  aria-selected={option.value === selectedValue}
                  aria-disabled={option.disabled || undefined}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => !option.disabled && setActiveIndex(index)}
                  onClick={() => choose(option)}
                >
                  <span>{option.label}</span>
                  {option.value === selectedValue && <Check className={styles.check} size="var(--rams-detail-motion-button-glyph-size)" strokeWidth="var(--rams-detail-motion-button-glyph-stroke)" aria-hidden="true" />}
                </div>
              )) : <EmptyOption message={emptyMessage} reduced={reduceMotion} />}
            </div>
            </AutoHeight>
          </MotionPresenceDiv></Floating.Content></Floating.Portal>
        )}
      </AnimatePresence>
    </div></Floating.Root>
  );
});

Combobox.displayName = "Combobox";
