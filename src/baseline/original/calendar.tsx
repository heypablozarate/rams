import { printPreviewGeometry } from "../../variants/print-preview-geometry";
import { useId, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Calendar } from "../../primitives/calendar";
import { Button } from "../../primitives/button";
import { Label } from "../../primitives/label";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../../primitives/popover";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../primitives/select";
const openingDay = new Date(2026, 10, 9);
function dateLabel(date: Date | undefined) {
  return date
    ? new Intl.DateTimeFormat("en", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date)
    : "Choose a date";
}
const layout = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  gap: "var(--rams-detail-preview-scene-gap)",
  width: "100%",
  maxWidth: "var(--rams-detail-preview-measure-full)",
} as const;
const datePickerLayout = {
  ...layout,
  gap: "var(--rams-detail-docs-space-standard)",
  maxWidth: "var(--rams-detail-preview-measure-full)",
};
export function CalendarDemo() {
  const [date, setDate] = useState<Date | undefined>(openingDay);
  return (
    <section
      style={{
        ...layout,
        gap: "var(--rams-detail-docs-space-standard)",
        maxWidth: "var(--rams-detail-preview-measure-full)",
      }}
      aria-label="Workshop calendar"
    >
      <h3>Rosario print workshop</h3>
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        defaultMonth={openingDay}
        captionLayout="dropdown"
        startMonth={new Date(2025, 0)}
        endMonth={new Date(2028, 11)}
        aria-label="Workshop date"
      />
      <p role="status">Workshop: {dateLabel(date)}</p>
    </section>
  );
}
export function DatePickerDemo() {
  const [date, setDate] = useState<Date>(),
    [open, setOpen] = useState(false);
  return (
    <section style={datePickerLayout} aria-label="Bindery appointment">
      <h3>Bindery appointment</h3>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline">
            {date ? dateLabel(date) : "Choose bindery date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          aria-label="Choose bindery date"
          align="start"
          style={{ width: "max-content", padding: 0 }}
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={(next) => {
              setDate(next);
              if (next) setOpen(false);
            }}
            defaultMonth={date ?? openingDay}
            autoFocus
            aria-label="Bindery date"
          />
        </PopoverContent>
      </Popover>
    </section>
  );
}
export function DatePickerWithRange() {
  const [range, setRange] = useState<DateRange | undefined>({
    from: openingDay,
    to: new Date(2026, 10, 13),
  });
  const label = range?.from
    ? range.to
      ? dateLabel(range.from) + " – " + dateLabel(range.to)
      : dateLabel(range.from) + " – Choose end date"
    : "Choose production dates";
  return (
    <section style={datePickerLayout} aria-label="Production window">
      <h3>Production window</h3>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">{label}</Button>
        </PopoverTrigger>
        <PopoverContent
          aria-label="Choose production window"
          align="start"
          style={{ width: "max-content", padding: 0 }}
        >
          <Calendar
            mode="range"
            selected={range}
            onSelect={setRange}
            defaultMonth={range?.from ?? openingDay}
            numberOfMonths={printPreviewGeometry.calendar.rangeMonths}
            autoFocus
            aria-label="Production dates"
          />
        </PopoverContent>
      </Popover>
      <p role="status">
        {range?.from && range.to
          ? "Selected production window: " + label
          : range?.from
            ? "Choose the final production date."
            : "No production dates selected."}
      </p>
    </section>
  );
}
const milestones = [
  { key: "proof", name: "First proof", date: openingDay },
  { key: "bindery", name: "Bindery handoff", date: new Date(2026, 10, 12) },
  { key: "pickup", name: "Edition pickup", date: new Date(2026, 10, 16) },
  {
    key: "dispatch",
    name: "Print-room dispatch",
    date: new Date(2026, 10, 20),
  },
];
export function DatePickerWithPresets() {
  const id = useId(),
    [date, setDate] = useState<Date>(),
    [month, setMonth] = useState(openingDay),
    [preset, setPreset] = useState("");
  return (
    <section style={datePickerLayout} aria-label="Edition milestones">
      <h3>Edition milestones</h3>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            {date ? dateLabel(date) : "Choose milestone date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          aria-label="Choose edition milestone"
          align="start"
          style={{
            width: "max-content",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr)",
            gap: "var(--rams-detail-docs-space-standard)",
          }}
        >
          <Label htmlFor={id}>Workshop milestone</Label>
          <Select
            value={preset}
            onValueChange={(key) => {
              const milestone = milestones.find((row) => row.key === key);
              if (milestone) {
                setPreset(key);
                setDate(milestone.date);
                setMonth(milestone.date);
              }
            }}
          >
            <SelectTrigger id={id}>
              <SelectValue placeholder="Choose a milestone" />
            </SelectTrigger>
            <SelectContent>
              {milestones.map((row) => (
                <SelectItem key={row.key} value={row.key}>
                  {row.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Calendar
            mode="single"
            selected={date}
            onSelect={(next) => {
              setDate(next);
              setPreset(
                milestones.find((row) => next?.getTime() === row.date.getTime())
                  ?.key ?? "",
              );
            }}
            month={month}
            onMonthChange={setMonth}
            aria-label="Milestone date"
          />
          <p role="status">
            {date ? dateLabel(date) : "Choose a milestone or a calendar day."}
          </p>
        </PopoverContent>
      </Popover>
    </section>
  );
}
