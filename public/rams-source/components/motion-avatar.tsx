"use client";
import "./motion-fields.css";

import { useCallback, type HTMLAttributes } from "react";
import { AnimatePresence } from "motion/react";
import { MotionSwap } from './motion-swap';
import { useReducedMotion } from "./use-motion-preference";
import { Avatar as RamsAvatar, AvatarImage as RamsAvatarImage, AvatarFallback as RamsAvatarFallback, AvatarBadge as RamsAvatarBadge } from "./avatar";
import { motionTokens } from "./motion-tokens";
import type { AvatarSize } from "./avatar";
import styles from "./motion-avatar.module.css";
const statusScale = motionTokens.keyframes.avatar.statusScale;
export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> { name: string; src?: string; size?: AvatarSize; status?: "online" | "offline" }
export function Avatar({ name, src, size = "default", status, className, style, ...props }: AvatarProps) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase()).join("");
  const reduceMotion = !!useReducedMotion();
  const imageReady = useCallback((node:HTMLImageElement|null) => { if(node?.complete)delete node.dataset.loading; },[]);
  // Native Avatar owns loading/error fallback. Cached images do not wait for a decorative fade.
  return <RamsAvatar {...props} size={size} style={style} className={[styles.avatar, size !== "default" && styles[size], className].filter(Boolean).join(" ")} role="img" aria-label={`${name}${status ? `, ${status}` : ""}`}>
    <RamsAvatarImage key={src} ref={imageReady} src={src} alt="" data-loading="" onLoad={event=>{delete event.currentTarget.dataset.loading}} />
    <RamsAvatarFallback className={styles.initials} aria-hidden="true">{initials}</RamsAvatarFallback>
    <AnimatePresence initial={false}>{status && <MotionSwap key={status} className={styles.status} aria-hidden="true" initial={reduceMotion ? false : { opacity: 0, scale: statusScale }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: statusScale, transition: { duration: reduceMotion ? motionTokens.reduced.duration : motionTokens.duration.fast } }} transition={reduceMotion ? { duration: motionTokens.reduced.duration } : motionTokens.spring.snappy}><RamsAvatarBadge className={[styles.statusFill,styles[status]].join(' ')} /></MotionSwap>}</AnimatePresence>
  </RamsAvatar>;
}
