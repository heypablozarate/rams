"use client";
import "./motion-fields.css";

import { useState, type CSSProperties } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { useReducedMotion } from "./use-motion-preference";
import { motionTokens } from "./motion-tokens";
import { Avatar } from "./motion-avatar";
import { collectionPresentation } from "./collection-presentation";
import styles from "./motion-avatar-group.module.css";
import { AvatarGroup as RamsAvatarGroup } from './avatar';
import { MotionSwap } from './motion-swap';

export interface AvatarGroupMember { name: string; src?: string; status?: "online" | "offline"; }
export interface AvatarGroupProps { members: AvatarGroupMember[]; max?: number; size?: "sm" | "default" | "lg"; label?: string; }

const groupMotion = motionTokens.keyframes.avatarGroup;

/** The overflow count rolls the way it moved: more people rise in from below, fewer drop in from above. */
const rise: Variants = { hidden: (direction: number) => ({ opacity: 0, y: `${groupMotion.countTravelEm * direction}em`, filter: `blur(${motionTokens.blur.subtle}px)` }), shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] } }, gone: (direction: number) => ({ opacity: 0, y: `${-groupMotion.countTravelEm * direction}em`, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } }) };
// Same keys as `rise` so the settled style is identical whichever branch renders on the server.
const fade: Variants = { hidden: { opacity: 0, y: 0, filter: "blur(0px)" }, shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.instant } }, gone: { opacity: 0, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.instant } } };
// A person joining or leaving opens or closes their slot, so the rest of the stack slides instead of jumping.
const slot = { initial: { width: 0, opacity: 0, scale: groupMotion.slotScale }, animate: { width: "auto", opacity: 1, scale: 1 }, exit: { width: 0, opacity: 0, scale: groupMotion.slotScale } };

export function AvatarGroup({ members, max = collectionPresentation.avatarGroupMaxMembers, size = "default", label = "Team members" }: AvatarGroupProps) {
  const reduceMotion = !!useReducedMotion();
  const visible = members.slice(0, Math.max(0, max));
  const overflow = Math.max(0, members.length - visible.length);
  const transition = reduceMotion ? { duration: motionTokens.reduced.duration } : motionTokens.spring.morph;
  const [count, setCount] = useState({ overflow, direction: 1 });
  if (count.overflow !== overflow) setCount({ overflow, direction: overflow < count.overflow ? -1 : 1 });
  return <RamsAvatarGroup className={[styles.group, `rams-avatar--size-${size}`, styles[size]].join(" ")} role="group" aria-label={label} style={{ "--rams-detail-count": visible.length + (overflow > 0 ? 1 : 0) } as CSSProperties}>
    <AnimatePresence initial={false}>
      {visible.map((member, index) => <MotionSwap key={member.name} className={styles.slot} style={{ "--rams-detail-index": index } as CSSProperties} {...slot} transition={reduceMotion ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : transition}><span className={styles.lift}><Avatar className={styles.avatar} name={member.name} src={member.src} status={member.status} size={size} /><span className={styles.tip} aria-hidden="true">{member.name}</span></span></MotionSwap>)}
      {overflow > 0 ? <MotionSwap key="overflow" className={styles.slot} style={{ "--rams-detail-index": visible.length } as CSSProperties} {...slot} transition={reduceMotion ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : transition}><span className={[styles.lift, styles.overflow, styles[size]].join(" ")} role="img" aria-label={`${overflow} more ${label.toLowerCase()}`}><AnimatePresence mode="popLayout" initial={false} custom={count.direction}><MotionSwap key={overflow} className={styles.count} custom={count.direction} variants={reduceMotion ? ({ hidden: { opacity: 0, y: 0, filter: "blur(0px)" }, shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.reduced.duration } }, gone: { opacity: 0, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.reduced.duration } } }) : rise} initial="hidden" animate="shown" exit="gone" aria-hidden="true" transition={reduceMotion ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : undefined}>+{overflow}</MotionSwap></AnimatePresence></span></MotionSwap> : null}
    </AnimatePresence>
  </RamsAvatarGroup>;
}

export default AvatarGroup;
