import { useSyncExternalStore } from "react";

const query = "(prefers-reduced-motion: reduce)";
const snapshot = () => typeof window !== "undefined" && typeof window.matchMedia === "function"
  ? window.matchMedia(query).matches : false;
const subscribe = (notify: () => void) => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
  const preference = window.matchMedia(query);
  preference.addEventListener("change", notify);
  return () => preference.removeEventListener("change", notify);
};

/** Live system preference, including changes while an interaction is running. */
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, snapshot, () => false);
}
