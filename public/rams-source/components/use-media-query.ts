"use client";

import { useCallback, useSyncExternalStore } from "react";
import { responsiveSurfaceQuery } from "./responsive-surface-query";

type MediaQueryListener = (event: MediaQueryListEvent) => void;

/** Choose a compact surface at open time; callers retain their open surface on resize. */
export function useCompactSurface(serverMatches = false): boolean {
  return useMediaQuery(responsiveSurfaceQuery, serverMatches);
}

/** Subscribe to a browser media query with a deterministic server snapshot. */
export function useMediaQuery(query: string, serverMatches = false): boolean {
  const subscribe = useCallback(
    (notify: () => void) => {
      if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
        return () => {};
      }

      const mediaQuery = window.matchMedia(query);
      const listener: MediaQueryListener = () => notify();
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    },
    [query],
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return false;
    }
    return window.matchMedia(query).matches;
  }, [query]);

  const getServerSnapshot = useCallback(() => serverMatches, [serverMatches]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

