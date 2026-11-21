"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { motionTokens } from "./motion-tokens";

export type CopyFeedbackState = "idle" | "copied" | "error";

/** Shared clipboard state for actions that render their own button or menu. */
export function useCopyFeedback(duration: number = motionTokens.keyframes.copyFeedback.holdMs) {
  const [state, setState] = useState<CopyFeedbackState>("idle");
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(true);
  const generation = useRef(0);

  const reset = useCallback(() => {
    generation.current += 1;
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = null;
    if (!mounted.current) return;
    setState("idle");
    setActiveKey(null);
  }, []);

  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      generation.current += 1;
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = null;
    };
  }, []);

  const copy = useCallback(async (value: string, key = "default") => {
    if (!mounted.current) return false;
    const request = ++generation.current;
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = null;
    setActiveKey(key);
    // Clipboard writes are not cancellable; only the current request owns feedback.
    const current = () => mounted.current && request === generation.current;
    try {
      await navigator.clipboard.writeText(value);
      if (!current()) return false;
      setState("copied");
      timeout.current = setTimeout(() => { if (current()) reset(); }, duration);
      return true;
    } catch {
      if (!current()) return false;
      setState("error");
      timeout.current = setTimeout(() => { if (current()) reset(); }, duration);
      return false;
    }
  }, [duration, reset]);

  return { state, activeKey, copy, reset };
}
