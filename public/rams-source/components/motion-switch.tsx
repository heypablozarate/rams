"use client";
import "./motion-fields.css";

import { forwardRef, useId, useLayoutEffect, useRef, useState } from "react";
import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { animate } from "motion/react";
import { useComposedRefs } from "@radix-ui/react-compose-refs";
import { useReducedMotion } from "./use-motion-preference";
import { Switch as RamsSwitch } from "./switch";
import { Label } from "./label";
import { motionTokens } from "./motion-tokens";
import styles from "./motion-switch.module.css";

const switchMotion = motionTokens.keyframes.switch;

export interface SwitchProps extends ComponentPropsWithoutRef<typeof RamsSwitch> {
  label?: string;
}

/** Same RAMS track, thumb and external label. Only the thumb's elastic response differs. */
export const Switch = forwardRef<ElementRef<typeof RamsSwitch>, SwitchProps>(function Switch(
  { label, className, checked, defaultChecked, onCheckedChange, onPointerDown, onPointerUp, onPointerLeave, onPointerCancel, onKeyDown, onKeyUp, onBlur, id, ...props },
  ref,
) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const reduceMotion = useReducedMotion();
  const [internal, setInternal] = useState(defaultChecked ?? false);
  const [pressed, setPressed] = useState(false);
  const [geometry, setGeometry] = useState({ thumb: 0, travel: 0, rtl: false });
  const root = useRef<ElementRef<typeof RamsSwitch> | null>(null);
  const combinedRef = useComposedRefs(root, ref);
  const previous = useRef(checked ?? internal);
  const presented = useRef(false);
  const releasedAt = useRef(-Infinity);
  const on = checked ?? internal;

  useLayoutEffect(() => {
    const node = root.current;
    const thumb = node?.querySelector<HTMLElement>('[data-slot="switch-thumb"]');
    if (!node || !thumb) return;
    // CSS owns the canonical dimensions/colors. This adapter is the sole owner of thumb travel/stretch.
    thumb.style.translate = "none";
    thumb.style.transition = "none";
    function measure() {
      const width = parseFloat(getComputedStyle(thumb!).height);
      const computed = getComputedStyle(node!);
      const travel = Math.max(0, parseFloat(computed.width) - parseFloat(computed.paddingInlineStart) - parseFloat(computed.paddingInlineEnd) - parseFloat(computed.borderInlineStartWidth) - parseFloat(computed.borderInlineEndWidth) - width);
      const rtl = computed.direction === "rtl";
      setGeometry(current => current.thumb === width && current.travel === travel && current.rtl === rtl ? current : { thumb: width, travel, rtl });
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    observer.observe(thumb);
    return () => observer.disconnect();
  }, [props.size, props.dir]);

  useLayoutEffect(() => {
    const thumb = root.current?.querySelector<HTMLElement>('[data-slot="switch-thumb"]');
    if (!thumb || !geometry.thumb) return;
    const extra = pressed && !reduceMotion && !props.disabled ? Math.min(geometry.travel, geometry.thumb * switchMotion.pressStretchRatio) : 0;
    const changed = previous.current !== on;
    previous.current = on;
    const fromPress = performance.now() - releasedAt.current < switchMotion.pressContinuationWindowMs;
    const stretch = changed && !fromPress && !reduceMotion ? [...switchMotion.changeStretch] : 1;
    const immediate = reduceMotion || !presented.current;
    presented.current = true;
    const controls = animate(thumb, { x: on ? (geometry.travel - extra) * (geometry.rtl ? -1 : 1) : 0, width: geometry.thumb + extra, scaleX: stretch }, immediate
      ? { duration: motionTokens.reduced.duration }
      : { x: motionTokens.spring.snappy, width: motionTokens.spring.snappy, scaleX: { duration: motionTokens.duration.considered, times: [...switchMotion.changeStretchTimes], ease: [...switchMotion.changeStretchEase] } });
    return () => controls.stop();
  }, [on, pressed, reduceMotion, props.disabled, geometry]);

  const control = <RamsSwitch
    {...props}
    id={controlId}
    ref={combinedRef}
    className={label ? undefined : className}
    checked={on}
    onCheckedChange={next => { if (checked === undefined) setInternal(next); onCheckedChange?.(next); }}
    onPointerDown={event => { onPointerDown?.(event); if (event.button === 0 && !event.defaultPrevented) setPressed(true); }}
    onPointerUp={event => { onPointerUp?.(event); if (pressed && !props.disabled) releasedAt.current = performance.now(); setPressed(false); }}
    onPointerLeave={event => { onPointerLeave?.(event); setPressed(false); }}
    onPointerCancel={event => { onPointerCancel?.(event); setPressed(false); }}
    onKeyDown={event => { onKeyDown?.(event); if (event.key === " " && !event.defaultPrevented) setPressed(true); }}
    onKeyUp={event => { onKeyUp?.(event); if (pressed && !props.disabled) releasedAt.current = performance.now(); setPressed(false); }}
    onBlur={event => { onBlur?.(event); setPressed(false); }}
    aria-label={props["aria-label"]}
  />;
  // A stable wrapper keeps the control, focus and geometry observer when label is added or removed.
  return <span className={[styles.field, label ? className : undefined].filter(Boolean).join(" ")} data-disabled={props.disabled || undefined}>
    {control}{label ? <Label htmlFor={controlId}>{label}</Label> : null}
  </span>;
});

Switch.displayName = "Switch";
export default Switch;
