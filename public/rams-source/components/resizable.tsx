"use client";

import * as React from "react";
import {
  Group as PanelGroup,
  Panel,
  Separator,
  type GroupProps,
  type PanelProps,
  type SeparatorProps,
} from "react-resizable-panels";
import "./primitives.css";
import "./containers.css";
import { cx } from "./utils";
// The pinned engine drops callback-ref return values. Let React own the
// external ref lifecycle while the engine only assigns this internal DOM ref.
function usePanelElementRefs(
  forwarded: React.ForwardedRef<HTMLDivElement>,
  elementRef: React.Ref<HTMLDivElement | null> | undefined,
) {
  const actual = React.useRef<HTMLDivElement | null>(null);
  React.useImperativeHandle(forwarded, () => actual.current!, []);
  React.useImperativeHandle(elementRef, () => actual.current!, []);
  return actual;
}

export interface ResizablePanelGroupProps extends GroupProps {}

export const ResizablePanelGroup = React.forwardRef<
  HTMLDivElement,
  ResizablePanelGroupProps
>(function ResizablePanelGroup(
  { className, elementRef, orientation = "horizontal", style, ...props },
  ref,
) {
  const combinedRef = usePanelElementRefs(ref, elementRef);
  return (
    <PanelGroup
      {...props}
      elementRef={combinedRef}
      data-rams-primitive="true"
      data-slot="resizable-panel-group"
      orientation={orientation}
      data-orientation={orientation}
      style={{ padding: "var(--rams-detail-space-2)", ...style }}
      className={cx("rams-resizable-group", className)}
    />
  );
});
ResizablePanelGroup.displayName = "ResizablePanelGroup";

export interface ResizablePanelProps extends PanelProps {}

export const ResizablePanel = React.forwardRef<
  HTMLDivElement,
  ResizablePanelProps
>(function ResizablePanel({ className, elementRef, ...props }, ref) {
  const combinedRef = usePanelElementRefs(ref, elementRef);
  return (
    <Panel
      {...props}
      elementRef={combinedRef}
      data-rams-primitive="true"
      data-slot="resizable-panel"
      className={cx("rams-resizable-panel", className)}
    />
  );
});
ResizablePanel.displayName = "ResizablePanel";

export interface ResizableHandleProps extends SeparatorProps {
  withHandle?: boolean;
}

function HandleGrip() {
  return (
    <svg aria-hidden="true" viewBox="0 0 8 20" fill="currentColor">
      <circle cx="2" cy="4" r="1" />
      <circle cx="6" cy="4" r="1" />
      <circle cx="2" cy="10" r="1" />
      <circle cx="6" cy="10" r="1" />
      <circle cx="2" cy="16" r="1" />
      <circle cx="6" cy="16" r="1" />
    </svg>
  );
}

export const ResizableHandle = React.forwardRef<
  HTMLDivElement,
  ResizableHandleProps
>(function ResizableHandle(
  { children, className, elementRef, withHandle = false, ...props },
  ref,
) {
  const combinedRef = usePanelElementRefs(ref, elementRef);
  return (
    <Separator
      {...props}
      elementRef={combinedRef}
      data-rams-primitive="true"
      data-slot="resizable-handle"
      className={cx("rams-resizable-handle", className)}
    >
      {children}
      {withHandle ? (
        <span aria-hidden="true" className="rams-resizable-handle__grip">
          <HandleGrip />
        </span>
      ) : null}
    </Separator>
  );
});
ResizableHandle.displayName = "ResizableHandle";
