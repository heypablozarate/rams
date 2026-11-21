"use client";
import * as React from "react";
import {
  ResponsiveContainer,
  Tooltip,
  Legend,
  usePlotArea,
  type TooltipContentProps,
  type DefaultLegendContentProps,
  type TooltipValueType,
} from "recharts";
import { nativeChartGeometry } from "./native-chart-geometry";
import { Card } from "./card";
import { cx } from "./utils";
import "./primitives.css";
import "./charts.css";
export type ChartConfig = Record<
  string,
  { label?: React.ReactNode; icon?: React.ComponentType } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: { light: string; dark: string } }
  )
>;
const Context = React.createContext<ChartConfig | null>(null);
const fallbackSeries = [
  ["--chart-1", "var(--rams-detail-chart-fallback-weight-1)"],
  ["--chart-2", "var(--rams-detail-chart-fallback-weight-2)"],
  ["--chart-3", "var(--rams-detail-chart-fallback-weight-3)"],
  ["--chart-4", "var(--rams-detail-chart-fallback-weight-4)"],
  ["--chart-5", "var(--rams-detail-chart-fallback-weight-5)"],
] as const;
function useChart() {
  const value = React.useContext(Context);
  if (!value) throw new Error("Chart content requires a ChartContainer.");
  return value;
}
function entries(config: ChartConfig) {
  return Object.entries(config).map(([key, item], index) => {
    if (!/^[A-Za-z0-9_-]+$/.test(key))
      throw new Error(
        "Chart series keys must use letters, digits, underscores or hyphens.",
      );
    const [series, weight] = fallbackSeries[index % fallbackSeries.length];
    const fallback = `var(${series}, color-mix(in oklch, var(--rams-primary, var(--rams-detail-native-action-fill-fallback)) ${weight}, var(--rams-surface, var(--rams-detail-native-surface-fill-fallback))))`;
    const light = item.theme?.light ?? item.color ?? fallback,
      dark = item.theme?.dark ?? item.color ?? fallback;
    for (const value of [light, dark])
      if (
        typeof value !== "string" ||
        [...value].some(
          (character) =>
            character.charCodeAt(0) < 32 || ";{}<>\\!".includes(character),
        ) ||
        /(?:url|image|paint)\s*\(/i.test(value)
      )
        throw new Error("Chart colors must be single CSS color values.");
    return { key, light, dark };
  });
}
export function ChartStyle({
  id,
  config,
}: {
  id: string;
  config: ChartConfig;
}) {
  if (!/^[A-Za-z0-9_-]+$/.test(id))
    throw new Error("ChartStyle id must be a simple identifier.");
  const values = entries(config);
  if (!values.length) return null;
  const declarations = (dark: boolean) =>
    values
      .map((item) => `--color-${item.key}:${dark ? item.dark : item.light};`)
      .join("");
  const selector = `[data-chart="${id}"]`;
  return (
    <style>{`${selector}{${declarations(false)}} .dark ${selector},${selector}.dark{${declarations(true)}}`}</style>
  );
}
export type ChartContainerProps = React.ComponentPropsWithoutRef<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<typeof ResponsiveContainer>["children"];
  initialDimension?: { width: number; height: number };
};
export const ChartContainer = React.forwardRef<
  HTMLDivElement,
  ChartContainerProps
>(function ChartContainer(
  {
    config,
    className,
    children,
    // Recharts uses this SSR seed until its observer measures the chart box.
    initialDimension = nativeChartGeometry.initialDimension,
    ...props
  },
  ref,
) {
  const id = "rams-chart-" + React.useId().replace(/[^A-Za-z0-9_-]/g, "");
  return (
    <Context.Provider value={config}>
      <div
        {...props}
        ref={ref}
        className={cx("rams-chart", className)}
        data-rams-primitive="true"
        data-slot="chart"
        data-chart={id}
      >
        <ChartStyle id={id} config={config} />
        <ResponsiveContainer initialDimension={initialDimension}>
          {children}
        </ResponsiveContainer>
      </div>
    </Context.Provider>
  );
});
export function ChartTooltip(props: React.ComponentProps<typeof Tooltip>) {
  const plot = usePlotArea();
  return (
    <Tooltip
      {...props}
      wrapperStyle={{
        maxWidth: plot && plot.width > 0 ? plot.width : undefined,
        ...props.wrapperStyle,
      }}
    />
  );
}
export const ChartLegend = Legend;
type Name = number | string;
type Tip = Pick<
  Partial<TooltipContentProps<TooltipValueType, Name>>,
  | "active"
  | "payload"
  | "label"
  | "formatter"
  | "labelFormatter"
  | "itemSorter"
  | "contentStyle"
  | "itemStyle"
  | "labelStyle"
  | "accessibilityLayer"
>;
export type ChartTooltipContentProps = Tip &
  Pick<
    React.ComponentPropsWithoutRef<"div">,
    "id" | "className" | "style" | "role" | "aria-label"
  > & {
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: "dot" | "line" | "dashed";
    nameKey?: string;
    labelKey?: string;
    color?: string;
    labelClassName?: string;
  };
function metadata(
  config: ChartConfig,
  item: Record<string, unknown>,
  field?: string,
) {
  const datum =
    item.payload && typeof item.payload === "object"
      ? (item.payload as Record<string, unknown>)
      : {};
  const key = field
    ? (item[field] ?? datum[field] ?? field)
    : (item.dataKey ?? item.name ?? item.value ?? "value");
  return (
    config[String(key)] ??
    config[String(item.name)] ??
    config[String(item.dataKey)]
  );
}
function numeric(value: unknown): React.ReactNode {
  if (typeof value === "number")
    return new Intl.NumberFormat("en-US").format(value);
  if (Array.isArray(value)) return value.map(numeric).join("–");
  return value == null ? null : String(value);
}
function Marker({
  icon: Icon,
  color,
  kind = "dot",
}: {
  icon?: React.ComponentType;
  color?: string;
  kind?: "dot" | "line" | "dashed";
}) {
  return (
    <span
      aria-hidden="true"
      className={cx("rams-chart__marker", "rams-chart__marker--" + kind)}
      style={{ color }}
    >
      {Icon ? <Icon /> : null}
    </span>
  );
}
export const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentProps
>(function ChartTooltipContent(
  {
    active,
    payload,
    label,
    formatter,
    labelFormatter,
    itemSorter,
    contentStyle,
    itemStyle,
    labelStyle,
    accessibilityLayer,
    hideLabel = false,
    hideIndicator = false,
    indicator = "dot",
    nameKey,
    labelKey,
    color,
    labelClassName,
    className,
    ...props
  },
  ref,
) {
  const config = useChart();
  if (!active || !payload?.length) return null;
  const rows = [...payload];
  if (itemSorter) {
    const read = (item: (typeof rows)[number]) => {
      if (typeof itemSorter === "function") return itemSorter(item);
      if (itemSorter === "name") return item.name;
      if (itemSorter === "value") return item.value;
      return item.dataKey;
    };
    rows.sort((a, b) => {
      const x = read(a),
        y = read(b);
      if (x === y) return 0;
      if (x == null) return 1;
      if (y == null) return -1;
      if (String(x) === String(y)) return 0;
      return typeof x === "number" && typeof y === "number"
        ? x - y
        : String(x) < String(y)
          ? -1
          : 1;
    });
  }
  const firstVisible = rows.find((item) => item.type !== "none");
  if (!firstVisible) return null;
  const first = firstVisible as unknown as Record<string, unknown>;
  const heading = labelKey
    ? metadata(config, first, labelKey)?.label
    : typeof label === "string"
      ? (config[label]?.label ?? label)
      : label;
  const title = hideLabel
    ? null
    : labelFormatter
      ? labelFormatter(heading, payload)
      : heading;
  return (
    <Card
      ref={ref}
      id={props.id}
      style={{ ...contentStyle, ...props.style }}
      role={props.role ?? (accessibilityLayer ? "status" : "tooltip")}
      aria-live={accessibilityLayer ? "assertive" : undefined}
      aria-label={props["aria-label"]}
      className={cx("rams-chart__tooltip", className)}
    >
      {title != null && title !== "" && (
        <div
          style={labelStyle}
          className={cx("rams-chart__tooltip-title", labelClassName)}
        >
          {title}
        </div>
      )}
      <dl className="rams-chart__values">
        {rows.map((item, index) => {
          if (item.type === "none") return null;
          const meta = metadata(
            config,
            item as unknown as Record<string, unknown>,
            nameKey,
          );
          let name: React.ReactNode =
              meta?.label ??
              item.name ??
              (typeof item.dataKey === "function" ? "Value" : item.dataKey),
            value: React.ReactNode = numeric(item.value);
          const format = item.formatter ?? formatter;
          if (format) {
            const result = format(item.value, item.name, item, index, payload);
            if (result == null) return null;
            if (Array.isArray(result)) {
              [value, name] = result;
            } else value = result;
          }
          return (
            <div
              key={String(item.dataKey ?? item.name ?? index) + "-" + index}
              className="rams-chart__value-row"
              style={itemStyle}
            >
              <dt>
                {!hideIndicator && (
                  <Marker
                    icon={meta?.icon}
                    kind={indicator}
                    color={color ?? item.color}
                  />
                )}
                <span>{name}</span>
              </dt>
              <dd className="rams-numeric" data-rams-numeric="true">
                {value}
                {item.unit}
              </dd>
            </div>
          );
        })}
      </dl>
    </Card>
  );
});
export type ChartLegendContentProps = Pick<
  Partial<DefaultLegendContentProps>,
  | "payload"
  | "verticalAlign"
  | "layout"
  | "align"
  | "formatter"
  | "onClick"
  | "onMouseEnter"
  | "onMouseLeave"
> &
  Pick<
    React.ComponentPropsWithoutRef<"div">,
    "className" | "style" | "id" | "aria-label"
  > & { hideIcon?: boolean; nameKey?: string };
export const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  ChartLegendContentProps
>(function ChartLegendContent(
  {
    payload,
    hideIcon = false,
    nameKey,
    verticalAlign = "bottom",
    layout = "horizontal",
    align = "center",
    formatter,
    onClick,
    onMouseEnter,
    onMouseLeave,
    className,
    ...props
  },
  ref,
) {
  const config = useChart();
  if (!payload?.length) return null;
  return (
    <div
      ref={ref}
      id={props.id}
      style={props.style}
      className={cx("rams-chart__legend", className)}
      data-align={verticalAlign}
      data-layout={layout}
      data-justify={align}
    >
      <ul aria-label={props["aria-label"] ?? "Chart series"}>
        {payload
          .filter((item) => item.type !== "none")
          .map((item, index) => {
            const meta = metadata(
              config,
              item as unknown as Record<string, unknown>,
              nameKey,
            );
            const format = item.formatter ?? formatter;
            const label = format
              ? format(item.value, item, index)
              : (meta?.label ??
                item.value ??
                (typeof item.dataKey === "function"
                  ? "Value"
                  : String(item.dataKey ?? "")));
            const content = (
              <>
                {!hideIcon && <Marker icon={meta?.icon} color={item.color} />}
                <span className="rams-chart__series-label">{label}</span>
                {item.inactive && (
                  <span className="rams-chart__sr">Inactive</span>
                )}
              </>
            );
            return (
              <li
                key={String(item.dataKey ?? item.value ?? index) + "-" + index}
                data-inactive={item.inactive || undefined}
                onMouseEnter={(event) => onMouseEnter?.(item, index, event)}
                onMouseLeave={(event) => onMouseLeave?.(item, index, event)}
              >
                {onClick ? (
                  <button
                    type="button"
                    data-rams-primitive="true"
                    onClick={(event) => onClick(item, index, event)}
                  >
                    {content}
                  </button>
                ) : (
                  content
                )}
              </li>
            );
          })}
      </ul>
    </div>
  );
});
