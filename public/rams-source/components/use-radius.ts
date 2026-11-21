"use client";
import { useLayoutEffect, useState } from "react";
import {
  shapeRadii,
  shapeRadiiAt16,
  type ShapeRadiusRole,
} from "./shape-tokens";

export type { ShapeRadiusRole } from "./shape-tokens";

// The generated authored values provide deterministic server and hydration markup.
// Resolve their rem terms against the 16px baseline without consulting the DOM.
/** Resolves a semantic radius to CSS pixels for Motion's numeric interpolation. */
export function useShapeRadius(role: ShapeRadiusRole): number {
  const [pixels, setPixels] = useState<number>(() => shapeRadiiAt16[role]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const probe = document.createElement("span");
    probe.setAttribute("aria-hidden", "true");
    Object.assign(probe.style, {
      position: "fixed",
      inset: "0 auto auto 0",
      visibility: "hidden",
      pointerEvents: "none",
      display: "block",
      boxSizing: "content-box",
      minWidth: "0",
      maxWidth: "none",
      height: "0",
      margin: "0",
      padding: "0",
      border: "0",
      contain: "strict",
    });
    document.body.appendChild(probe);
    let active = true;

    const read = () => {
      if (!active) return;
      // Let the CSS engine resolve rem, calc() and custom property references.
      probe.style.width = `var(--radius-${role}, ${shapeRadii[role]})`;
      const resolved = Number.parseFloat(getComputedStyle(probe).width);
      if (Number.isFinite(resolved) && resolved >= 0) {
        setPixels((current) => (current === resolved ? current : resolved));
      }
    };
    read();

    const mutations =
      typeof MutationObserver === "undefined"
        ? undefined
        : new MutationObserver(read);
    mutations?.observe(root, { attributes: true });
    const resize =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(read);
    resize?.observe(root);
    resize?.observe(probe);
    window.addEventListener("resize", read);
    const fonts = document.fonts;
    fonts?.addEventListener("loadingdone", read);
    fonts?.ready.then(read);

    return () => {
      active = false;
      mutations?.disconnect();
      resize?.disconnect();
      window.removeEventListener("resize", read);
      fonts?.removeEventListener("loadingdone", read);
      probe.remove();
    };
  }, [role]);

  return pixels;
}
