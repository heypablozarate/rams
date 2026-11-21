"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { motion, useIsPresent } from "motion/react";
import { ButtonBase, type ButtonProps } from "@/primitives/button";

// Exit paint may finish, but its controls leave keyboard and pointer interaction now.
const PresenceButton = forwardRef<HTMLButtonElement, ButtonProps>(function PresenceButton(props, ref) {
  const present = useIsPresent();
  return <ButtonBase {...props} ref={ref} disabled={props.disabled || !present}
    inert={props.inert || !present} aria-hidden={present ? props["aria-hidden"] : true}
    tabIndex={present ? props.tabIndex : -1} />;
});
const PresenceDiv = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function PresenceDiv(props, ref) {
  const present = useIsPresent();
  return <div {...props} ref={ref} inert={props.inert || !present}
    aria-hidden={present ? props["aria-hidden"] : true} />;
});
const PresenceSpan = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(function PresenceSpan(props, ref) {
  const present = useIsPresent();
  return <span {...props} ref={ref} inert={props.inert || !present}
    aria-hidden={present ? props["aria-hidden"] : true} />;
});

const PresenceLi = forwardRef<HTMLLIElement, HTMLAttributes<HTMLLIElement>>(function PresenceLi(props, ref) {
  const present = useIsPresent();
  return <li {...props} ref={ref} inert={props.inert || !present} aria-hidden={present ? props["aria-hidden"] : true} />;
});
const PresenceSection = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(function PresenceSection(props, ref) {
  const present = useIsPresent();
  return <section {...props} ref={ref} inert={props.inert || !present} aria-hidden={present ? props["aria-hidden"] : true} />;
});

export const MotionPresenceButton = motion.create(PresenceButton);
export const MotionPresenceDiv = motion.create(PresenceDiv);
export const MotionPresenceSpan = motion.create(PresenceSpan);

export const MotionPresenceLi = motion.create(PresenceLi);
export const MotionPresenceSection = motion.create(PresenceSection);
