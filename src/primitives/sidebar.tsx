"use client";
import { motionTokens } from "./motion-tokens";
import * as React from "react";
import { Slot } from "radix-ui";
import { useComposedRefs } from "@radix-ui/react-compose-refs";
import { Button, type ButtonProps } from "./button";
import { Input } from "./input";
import { Separator } from "./separator";
import { Skeleton } from "./skeleton";
import { Sheet, SheetContent, SheetTitle } from "./sheet";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  type TooltipContentProps,
} from "./tooltip";
import { useIsMobile } from "./use-mobile";
import { cx } from "./utils";
import "./primitives.css";
import "./sidebars.css";

type SidebarState = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openMobile: boolean;
  setOpenMobile: React.Dispatch<React.SetStateAction<boolean>>;
  isMobile: boolean;
  toggleSidebar: () => void;
  id: string;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  variables: React.CSSProperties;
};
const State = React.createContext<SidebarState | null>(null);
export function useSidebar() {
  const state = React.useContext(State);
  if (!state) throw new Error("Sidebar components require SidebarProvider.");
  return state;
}
export type SidebarProviderProps = React.ComponentPropsWithoutRef<"div"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};
export const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  SidebarProviderProps
>(function SidebarProvider(
  {
    defaultOpen = true,
    open: controlled,
    onOpenChange,
    children,
    className,
    style,
    ...props
  },
  ref,
) {
  const [internal, setInternal] = React.useState(defaultOpen),
    [openMobile, setOpenMobile] = React.useState(false),
    open = controlled ?? internal,
    isMobile = useIsMobile(),
    id = React.useId(),
    triggerRef = React.useRef<HTMLButtonElement>(null),
    current = React.useRef(open),
    persisted = React.useRef(open);
  current.current = open;
  const variables = Object.fromEntries(
    Object.entries(style ?? {}).filter(([key]) => key.startsWith("--sidebar-")),
  ) as React.CSSProperties;
  const setOpen = React.useCallback<SidebarState["setOpen"]>(
    (value) => {
      const next = typeof value === "function" ? value(current.current) : value;
      if (controlled === undefined) {
        current.current = next;
        setInternal(next);
      }
      onOpenChange?.(next);
    },
    [controlled, onOpenChange],
  );
  React.useEffect(() => {
    if (persisted.current !== open) {
      document.cookie = `sidebar_state=${open}; path=/; max-age=604800; SameSite=Lax`;
      persisted.current = open;
    }
  }, [open]);
  const toggleSidebar = React.useCallback(() => {
    if (isMobile) setOpenMobile((value) => !value);
    else setOpen((value) => !value);
  }, [isMobile, setOpen]);
  React.useEffect(() => {
    const key = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        event.defaultPrevented ||
        event.altKey ||
        !(event.metaKey || event.ctrlKey) ||
        event.key.toLowerCase() !== "b" ||
        target?.isContentEditable ||
        target?.closest("input,textarea,select")
      )
        return;
      event.preventDefault();
      toggleSidebar();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [toggleSidebar]);
  React.useEffect(() => {
    if (!isMobile) setOpenMobile(false);
  }, [isMobile]);
  const value = {
    state: open ? "expanded" : "collapsed",
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
    id,
    triggerRef,
    variables,
  } as SidebarState;
  return (
    <State.Provider value={value}>
      <TooltipProvider delayDuration={motionTokens.keyframes.tooltip.directOpenDelayMs}>
        <div
          {...props}
          ref={ref}
          className={cx("rams-sidebar-layout", className)}
          style={style}
          data-rams-primitive="true"
          data-slot="sidebar-wrapper"
        >
          {children}
        </div>
      </TooltipProvider>
    </State.Provider>
  );
});
export type SidebarProps = React.ComponentPropsWithoutRef<"div"> & {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
};
export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  function Sidebar(
    {
      side = "left",
      variant = "sidebar",
      collapsible = "offcanvas",
      className,
      children,
      "aria-label": label = "Navigation",
      ...props
    },
    ref,
  ) {
    const context = useSidebar(),
      local = React.useRef<HTMLDivElement>(null),
      composed = useComposedRefs(local, ref),
      hidden = !context.open && collapsible === "offcanvas";
    React.useLayoutEffect(() => {
      const active = document.activeElement as HTMLElement | null;
      if (
        !context.open &&
        collapsible !== "none" &&
        !context.isMobile &&
        active &&
        local.current?.contains(active) &&
        (hidden || active.getClientRects().length === 0)
      )
        context.triggerRef.current?.focus();
    }, [
      hidden,
      context.open,
      collapsible,
      context.isMobile,
      context.triggerRef,
    ]);
    if (context.isMobile && collapsible !== "none")
      return (
        <Sheet open={context.openMobile} onOpenChange={context.setOpenMobile}>
          <SheetContent
            {...props}
            id={context.id}
            ref={composed}
            side={side}
            style={{ ...context.variables, ...props.style }}
            aria-describedby={undefined}
            className={cx("rams-sidebar__mobile", className)}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              context.triggerRef.current?.focus();
            }}
          >
            <SheetTitle className="rams-sidebar__sr">{label}</SheetTitle>
            <div className="rams-sidebar__inside">{children}</div>
          </SheetContent>
        </Sheet>
      );
    return (
      <div
        {...props}
        ref={composed}
        id={context.id}
        className={cx("rams-sidebar", className)}
        data-rams-primitive="true"
        data-slot="sidebar"
        data-side={side}
        data-variant={variant}
        data-state={context.open ? "expanded" : "collapsed"}
        data-collapsible={collapsible}
        aria-label={label}
        role={props.role ?? "complementary"}
        inert={hidden || undefined}
        aria-hidden={hidden || undefined}
      >
        <div className="rams-sidebar__inside">{children}</div>
      </div>
    );
  },
);
export const SidebarTrigger = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function SidebarTrigger({ onClick, children, ...props }, ref) {
    const state = useSidebar(),
      composed = useComposedRefs(ref, state.triggerRef);
    return (
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Toggle sidebar"
        {...props}
        ref={composed}
        aria-expanded={state.isMobile ? state.openMobile : state.open}
        aria-controls={state.id}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) state.toggleSidebar();
        }}
      >
        {children ?? (
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
            <rect
              x="3"
              y="4"
              width="18"
              height="16"
              rx="2"
              stroke="currentColor"
            />
            <path d="M9 4v16" stroke="currentColor" />
          </svg>
        )}
      </Button>
    );
  },
);
export const SidebarRail = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button">
>(function SidebarRail({ className, onClick, ...props }, ref) {
  const state = useSidebar();
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-label="Toggle sidebar"
      {...props}
      ref={ref}
      className={cx("rams-sidebar__rail", className)}
      data-rams-primitive="true"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) state.toggleSidebar();
      }}
    />
  );
});
function divPart(slot: string, asChildAllowed = false) {
  return React.forwardRef<
    HTMLDivElement,
    React.ComponentPropsWithoutRef<"div"> & { asChild?: boolean }
  >(function SidebarPart({ className, asChild = false, ...props }, ref) {
    const Component = asChildAllowed && asChild ? Slot.Root : "div";
    return (
      <Component
        {...props}
        ref={ref}
        className={cx("rams-sidebar__" + slot, className)}
        data-rams-primitive="true"
        data-slot={"sidebar-" + slot}
      />
    );
  });
}
export const SidebarHeader = divPart("header"),
  SidebarFooter = divPart("footer"),
  SidebarContent = divPart("content"),
  SidebarGroup = divPart("group"),
  SidebarGroupContent = divPart("group-content"),
  SidebarGroupLabel = divPart("group-label", true);
export const SidebarInset = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"main">
>(function SidebarInset({ className, ...props }, ref) {
  return (
    <main
      {...props}
      ref={ref}
      className={cx("rams-sidebar__inset", className)}
      data-rams-primitive="true"
      data-slot="sidebar-inset"
    />
  );
});
export const SidebarInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<typeof Input>
>(function SidebarInput(props, ref) {
  return <Input {...props} ref={ref} data-slot="sidebar-input" />;
});
export const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentPropsWithoutRef<typeof Separator>
>(function SidebarSeparator(props, ref) {
  return <Separator {...props} ref={ref} data-slot="sidebar-separator" />;
});
export const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentPropsWithoutRef<"ul">
>(function SidebarMenu({ className, ...props }, ref) {
  return (
    <ul
      {...props}
      ref={ref}
      className={cx("rams-sidebar__menu", className)}
      data-rams-primitive="true"
      data-slot="sidebar-menu"
    />
  );
});
export const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(function SidebarMenuItem({ className, ...props }, ref) {
  return (
    <li
      {...props}
      ref={ref}
      className={cx("rams-sidebar__menu-item", className)}
      data-rams-primitive="true"
      data-slot="sidebar-menu-item"
    />
  );
});
export const SidebarMenuSub = React.forwardRef<
  HTMLUListElement,
  React.ComponentPropsWithoutRef<"ul">
>(function SidebarMenuSub({ className, ...props }, ref) {
  return (
    <ul
      {...props}
      ref={ref}
      className={cx("rams-sidebar__menu-sub", className)}
      data-rams-primitive="true"
      data-slot="sidebar-menu-sub"
    />
  );
});
export const SidebarMenuSubItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(function SidebarMenuSubItem({ className, ...props }, ref) {
  return (
    <li
      {...props}
      ref={ref}
      className={cx("rams-sidebar__menu-sub-item", className)}
      data-rams-primitive="true"
      data-slot="sidebar-menu-sub-item"
    />
  );
});
export type SidebarMenuButtonProps = Omit<ButtonProps, "variant" | "size"> & {
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  isActive?: boolean;
  tooltip?: string | TooltipContentProps;
};
export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(function SidebarMenuButton(
  {
    variant = "default",
    size = "default",
    isActive = false,
    tooltip,
    className,
    ...props
  },
  ref,
) {
  const state = useSidebar(),
    button = (
      <Button
        {...props}
        ref={ref}
        variant={variant === "outline" ? "outline" : "ghost"}
        size={size}
        className={cx("rams-sidebar__menu-button", className)}
        data-active={isActive || undefined}
        data-size={size}
        aria-current={isActive ? "page" : props["aria-current"]}
        data-slot="sidebar-menu-button"
      />
    );
  if (!tooltip) return button;
  const tip = typeof tooltip === "string" ? { children: tooltip } : tooltip;
  return (
    <Tooltip open={state.open || state.isMobile ? false : undefined}>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right" {...tip} />
    </Tooltip>
  );
});
export const SidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & {
    asChild?: boolean;
    size?: "sm" | "default";
    isActive?: boolean;
  }
>(function SidebarMenuSubButton(
  { asChild = false, size = "default", isActive = false, className, ...props },
  ref,
) {
  const Component = asChild ? Slot.Root : "a";
  return (
    <Component
      {...props}
      ref={ref}
      className={cx("rams-sidebar__sub-button", className)}
      data-size={size}
      data-active={isActive || undefined}
      aria-current={isActive ? "page" : props["aria-current"]}
      data-rams-primitive="true"
      data-slot="sidebar-menu-sub-button"
    />
  );
});
function actionPart(part: string) {
  return React.forwardRef<
    HTMLButtonElement,
    ButtonProps & { showOnHover?: boolean }
  >(function SidebarAction({ className, showOnHover, ...props }, ref) {
    return (
      <Button
        variant="ghost"
        size="icon-sm"
        {...props}
        ref={ref}
        className={cx("rams-sidebar__" + part, className)}
        data-show-on-hover={showOnHover || undefined}
        data-slot={"sidebar-" + part}
      />
    );
  });
}
export const SidebarMenuAction = actionPart("menu-action"),
  SidebarGroupAction = actionPart("group-action");
export const SidebarMenuBadge = divPart("menu-badge");
export const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & { showIcon?: boolean }
>(function SidebarMenuSkeleton({ showIcon = false, className, ...props }, ref) {
  return (
    <div
      {...props}
      ref={ref}
      className={cx("rams-sidebar__skeleton", className)}
      data-rams-primitive="true"
      data-slot="sidebar-menu-skeleton"
    >
      {showIcon && <Skeleton className="rams-sidebar__skeleton-icon" />}
      <Skeleton className="rams-sidebar__skeleton-label" />
    </div>
  );
});
