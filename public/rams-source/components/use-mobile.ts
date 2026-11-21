"use client";

import { mobileViewportQuery } from "./mobile-viewport-query";
import { useMediaQuery } from "./use-media-query";

/** Return whether the current viewport matches the mobile breakpoint. */
export function useIsMobile(serverMatches = false): boolean {
  return useMediaQuery(mobileViewportQuery, serverMatches);
}

