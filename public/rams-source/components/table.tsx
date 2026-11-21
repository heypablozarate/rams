"use client";

import * as React from "react";
import "./primitives.css";
import { cx } from "./utils";

const useTableLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

function tableElement<T extends HTMLElement, K extends keyof React.JSX.IntrinsicElements>(
  tag: K,
  slot: string,
  className: string,
) {
  return React.forwardRef<T, React.ComponentPropsWithoutRef<K> & { className?: string }>(
    function TablePart({ className: extra, ...props }, ref) {
      const Component = tag as React.ElementType;
      return (
        <Component
          {...props}
          ref={ref}
          className={cx(className, extra)}
          data-rams-primitive="true"
          data-slot={slot}
        />
      );
    },
  );
}

export const Table = React.forwardRef<HTMLTableElement, React.ComponentPropsWithoutRef<"table">>(
  function Table({className, ...props}, ref) {
    const regionRef = React.useRef<HTMLDivElement>(null);
    useTableLayoutEffect(() => {
      const region = regionRef.current;
      if (!region) return;
      // Keep the native caption readable without changing intrinsic column sizing.
      const measure = () => {
        if (region.clientWidth > 0) region.style.setProperty("--rams-table-caption-inline-size", `${region.clientWidth}px`);
      };
      measure();
      if (typeof ResizeObserver !== "undefined") {
        const observer = new ResizeObserver(measure);
        observer.observe(region);
        return () => observer.disconnect();
      }
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }, []);
    return <div ref={regionRef} className="rams-table-container" role="region" aria-label={props["aria-label"] ?? "Scrollable table"} tabIndex={0}>
      <table {...props} ref={ref} className={cx("rams-table", className)} data-rams-primitive="true" data-slot="table" />
    </div>;
  },
);
export const TableHeader = tableElement<HTMLTableSectionElement, "thead">("thead", "table-header", "rams-table__header");
export const TableBody = tableElement<HTMLTableSectionElement, "tbody">("tbody", "table-body", "rams-table__body");
export const TableFooter = tableElement<HTMLTableSectionElement, "tfoot">("tfoot", "table-footer", "rams-table__footer");
export const TableRow = tableElement<HTMLTableRowElement, "tr">("tr", "table-row", "rams-table__row");
export const TableHead = tableElement<HTMLTableCellElement, "th">("th", "table-head", "rams-table__head");
export const TableCell = tableElement<HTMLTableCellElement, "td">("td", "table-cell", "rams-table__cell");
export const TableCaption = tableElement<HTMLTableCaptionElement, "caption">("caption", "table-caption", "rams-table__caption");

Table.displayName = "Table";
TableHeader.displayName = "TableHeader";
TableBody.displayName = "TableBody";
TableFooter.displayName = "TableFooter";
TableRow.displayName = "TableRow";
TableHead.displayName = "TableHead";
TableCell.displayName = "TableCell";
TableCaption.displayName = "TableCaption";
