"use client";
import * as React from "react";
import { useComposedRefs } from "@radix-ui/react-compose-refs";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";
import { Button, type ButtonProps } from "./button";
import { useMediaQuery } from "./use-media-query";
import { cx } from "./utils";
import "./primitives.css";
import "./containers.css";
export type CarouselApi = UseEmblaCarouselType[1];
export type CarouselOptions = Parameters<typeof useEmblaCarousel>[0];
export type CarouselPlugin = Parameters<typeof useEmblaCarousel>[1];
type State = {
  viewport: UseEmblaCarouselType[0];
  orientation: "horizontal" | "vertical";
  direction: "ltr" | "rtl";
  previous: boolean;
  next: boolean;
  root: React.RefObject<HTMLDivElement | null>;
  move: (forward: boolean) => boolean | undefined;
};
const Context = React.createContext<State | null>(null);
function useCarousel() {
  const state = React.useContext(Context);
  if (!state) throw new Error("Carousel parts require a Carousel root.");
  return state;
}
function useScrollBoundary(api: CarouselApi, previous: boolean) {
  const subscribe = React.useCallback(
    (notify: () => void) => {
      if (!api) return () => {};
      api.on("select", notify).on("reInit", notify);
      return () => {
        api.off("select", notify).off("reInit", notify);
      };
    },
    [api],
  );
  const read = React.useCallback(
    () =>
      api ? (previous ? api.canScrollPrev() : api.canScrollNext()) : false,
    [api, previous],
  );
  return React.useSyncExternalStore(subscribe, read, () => false);
}
export type CarouselProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "dir"
> & {
  orientation?: "horizontal" | "vertical";
  dir?: "ltr" | "rtl";
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  setApi?: (api: CarouselApi) => void;
};
export const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  function Carousel(
    {
      orientation = "horizontal",
      dir,
      opts,
      plugins,
      setApi,
      children,
      className,
      onKeyDown,
      tabIndex = 0,
      ...props
    },
    ref,
  ) {
    const root = React.useRef<HTMLDivElement>(null),
      composed = useComposedRefs(ref, root);
    const direction = opts?.direction ?? dir ?? "ltr";
    const [viewport, api] = useEmblaCarousel(
      { ...opts, direction, axis: orientation === "vertical" ? "y" : "x" },
      plugins,
    );
    const previous = useScrollBoundary(api, true),
      next = useScrollBoundary(api, false),
      reduce = useMediaQuery("(prefers-reduced-motion: reduce)"),
      gesture = React.useRef<{ api: CarouselApi; active: boolean }>({
        api: undefined,
        active: false,
      });
    const move = React.useCallback(
      (forward: boolean) => {
        if (forward) api?.scrollNext(reduce);
        else api?.scrollPrev(reduce);
        return forward ? api?.canScrollNext() : api?.canScrollPrev();
      },
      [api, reduce],
    );
    React.useLayoutEffect(() => {
      if (gesture.current.api !== api) gesture.current = { api, active: false };
      if (!api) return;
      const down = () => {
        gesture.current.active = true;
      };
      const finish = () => {
        gesture.current.active = false;
        if (reduce) api.scrollTo(api.selectedScrollSnap(), true);
      };
      api.on("pointerDown", down).on("pointerUp", finish).on("reInit", finish);
      if (reduce && !gesture.current.active)
        api.scrollTo(api.selectedScrollSnap(), true);
      return () => {
        api
          .off("pointerDown", down)
          .off("pointerUp", finish)
          .off("reInit", finish);
      };
    }, [reduce, api]);
    React.useEffect(() => {
      if (!api) return;
      setApi?.(api);
      return () => setApi?.(undefined);
    }, [api, setApi]);
    return (
      <Context.Provider
        value={{ viewport, orientation, direction, previous, next, move, root }}
      >
        <div
          {...props}
          ref={composed}
          dir={direction}
          role={props.role ?? "region"}
          aria-roledescription={props["aria-roledescription"] ?? "carousel"}
          tabIndex={tabIndex}
          data-slot="carousel"
          data-rams-primitive="true"
          data-orientation={orientation}
          className={cx("rams-carousel", className)}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.defaultPrevented || event.target !== event.currentTarget)
              return;
            const back =
              orientation === "vertical"
                ? "ArrowUp"
                : direction === "rtl"
                  ? "ArrowRight"
                  : "ArrowLeft";
            const forward =
              orientation === "vertical"
                ? "ArrowDown"
                : direction === "rtl"
                  ? "ArrowLeft"
                  : "ArrowRight";
            if (event.key === back || event.key === forward) {
              event.preventDefault();
              move(event.key === forward);
            } else if (event.key === "Home" || event.key === "End") {
              event.preventDefault();
              api?.scrollTo(
                event.key === "Home"
                  ? 0
                  : Math.max(0, api.scrollSnapList().length - 1),
                reduce,
              );
            }
          }}
        >
          {children}
        </div>
      </Context.Provider>
    );
  },
);
export const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(function CarouselContent({ className, ...props }, ref) {
  const { viewport } = useCarousel();
  return (
    <div
      ref={viewport}
      className="rams-carousel__viewport"
      data-slot="carousel-content"
    >
      <div
        {...props}
        ref={ref}
        className={cx("rams-carousel__track", className)}
        data-rams-primitive="true"
      />
    </div>
  );
});
export const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(function CarouselItem({ className, ...props }, ref) {
  useCarousel();
  return (
    <div
      {...props}
      ref={ref}
      role={props.role ?? "group"}
      aria-roledescription={props["aria-roledescription"] ?? "slide"}
      data-slot="carousel-item"
      data-rams-primitive="true"
      className={cx("rams-carousel__slide", className)}
    />
  );
});
function Arrow({
  forward,
  vertical,
  rtl,
}: {
  forward: boolean;
  vertical: boolean;
  rtl: boolean;
}) {
  let path = forward ? "m9 5 7 7-7 7" : "m15 5-7 7 7 7";
  if (vertical) path = forward ? "m5 9 7 7 7-7" : "m5 15 7-7 7 7";
  else if (rtl) path = forward ? "m15 5-7 7 7 7" : "m9 5 7 7-7 7";
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={path}
        stroke="currentColor"
        style={{ strokeWidth: "var(--rams-detail-native-carousel-arrow-stroke)" }}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function control(forward: boolean) {
  return React.forwardRef<HTMLButtonElement, ButtonProps>(
    function CarouselControl(
      {
        className,
        children,
        onClick,
        disabled,
        variant = "outline",
        size = "icon",
        ...props
      },
      ref,
    ) {
      const state = useCarousel();
      return (
        <Button
          {...props}
          ref={ref}
          type={props.type ?? "button"}
          aria-label={
            props["aria-label"] ?? (forward ? "Next slide" : "Previous slide")
          }
          variant={variant}
          size={size}
          disabled={disabled || !(forward ? state.next : state.previous)}
          className={cx("rams-carousel__control", className)}
          onClick={(event) => {
            onClick?.(event);
            if (event.defaultPrevented) return;
            const button = event.currentTarget,
              ownedFocus = document.activeElement === button,
              more = state.move(forward);
            if (
              more === false &&
              ownedFocus &&
              (document.activeElement === button ||
                document.activeElement === document.body)
            )
              state.root.current?.focus({ preventScroll: true });
          }}
        >
          {children ?? (
            <Arrow
              forward={forward}
              vertical={state.orientation === "vertical"}
              rtl={state.direction === "rtl"}
            />
          )}
        </Button>
      );
    },
  );
}
export const CarouselPrevious = control(false),
  CarouselNext = control(true);
