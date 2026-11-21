import { flushSync } from "react-dom";
import { motionTokens } from "./motion-tokens";

export type ThemeTransitionVariant = "reveal" | "eclipse" | "split" | "rise";
type Theme = "light" | "dark";
type Transition = {
  ready: Promise<void>;
  finished: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition(): void;
};
type TransitionDocument = Document & {
  startViewTransition?: (update: () => void) => Transition;
};
const active = new WeakMap<Document, Transition>();
const requests = new WeakMap<Document, number>();

/** Pure geometry, shared by native transitions and the contract tests. */
export function themeTransitionFrames(
  variant: ThemeTransitionVariant,
  width: number,
  height: number,
  origin: { x: number; y: number },
): Keyframe[] {
  if (variant === "split") return [
    { clipPath: motionTokens.keyframes.themeSwitch.splitStartInset }, { clipPath: motionTokens.keyframes.themeSwitch.splitEndInset },
  ];
  if (variant === "rise") return [
    { clipPath: motionTokens.keyframes.themeSwitch.riseStartInset }, { clipPath: motionTokens.keyframes.themeSwitch.riseEndInset },
  ];
  const x = variant === "eclipse" ? -width * motionTokens.keyframes.themeSwitch.eclipseOriginOffsetRatio : Math.max(0, Math.min(width, origin.x));
  const y = variant === "eclipse" ? height / 2 : Math.max(0, Math.min(height, origin.y));
  const radius = Math.hypot(Math.max(x, width - x), Math.max(y, height - y));
  return [
    { clipPath: `circle(0px at ${x}px ${y}px)` },
    { clipPath: `circle(${radius}px at ${x}px ${y}px)` },
  ];
}

/** The button only requests a change. This bridge applies it and animates the whole view.
 * Import theme-transition.css once in the app. The provider owns persistence/system mode.
 * Unsupported/reduced-motion browsers change immediately, without a decorative substitute.
 */
export async function transitionTheme(
  next: Theme,
  variant: ThemeTransitionVariant,
  trigger: HTMLElement,
  applyTheme: (next: Theme) => void,
): Promise<void> {
  const doc = trigger.ownerDocument as TransitionDocument;
  const view = doc.defaultView;
  const preference = view?.matchMedia("(prefers-reduced-motion: reduce)");
  const request = (requests.get(doc) ?? 0) + 1;
  requests.set(doc, request);
  active.get(doc)?.skipTransition();
  if (!view || preference?.matches ||
      typeof doc.startViewTransition !== "function" || typeof doc.documentElement.animate !== "function") {
    active.delete(doc);
    doc.documentElement.removeAttribute("data-rams-theme-transition");
    applyTheme(next);
    return;
  }
  const rect = trigger.getBoundingClientRect();
  // React must commit the provider's theme before the new view is captured.
  let transition: Transition;
  try {
    transition = doc.startViewTransition(() => {
      // Skipping a native transition does not cancel its update callback.
      if (requests.get(doc) === request) flushSync(() => applyTheme(next));
    });
  } catch {
    active.delete(doc);
    doc.documentElement.removeAttribute("data-rams-theme-transition");
    applyTheme(next);
    return;
  }
  active.set(doc, transition);
  doc.documentElement.setAttribute("data-rams-theme-transition", variant);
  let animation: Animation | undefined;
  let reduced = false;
  const reduce = () => {
    if (!preference?.matches) return;
    reduced = true;
    animation?.cancel();
    transition.skipTransition();
  };
  preference?.addEventListener?.("change", reduce);
  reduce();
  try {
    await transition.ready;
    if (active.get(doc) !== transition || reduced) return;
    animation = doc.documentElement.animate(
      themeTransitionFrames(variant, view.innerWidth, view.innerHeight, {
        x: rect.left + rect.width / 2, y: rect.top + rect.height / 2,
      }),
      {
        duration: motionTokens.duration.considered * 1000,
        easing: `cubic-bezier(${motionTokens.ease.inOut.join(",")})`,
        pseudoElement: "::view-transition-new(root)",
      },
    );
    await animation.finished;
  } catch {
    // A superseded snapshot or unsupported pseudo-element animation must not undo the theme.
    transition.skipTransition();
  } finally {
    preference?.removeEventListener?.("change", reduce);
    await Promise.allSettled([transition.finished, transition.updateCallbackDone]);
    if (active.get(doc) === transition) {
      active.delete(doc);
      doc.documentElement.removeAttribute("data-rams-theme-transition");
    }
  }
}
