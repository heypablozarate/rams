"use client";

import * as React from "react";
import { Calendar } from "@/variants/vendor/registry/components/calendar/calendar";
import { DatePicker } from "@/variants/vendor/registry/components/date-picker/date-picker";
import {
  DateRangePicker,
  type DateRange,
  type DateRangePreset,
} from "@/variants/vendor/registry/components/date-range-picker/date-range-picker";
import { TimePicker } from "@/variants/vendor/registry/components/time-picker/time-picker";

const sceneStyle: React.CSSProperties = {
  display: "grid",
  width: "100%",
  maxWidth: "var(--rams-detail-preview-date-field-measure)",
  minWidth: 0,
  gap: "var(--rams-detail-space-4, var(--rams-detail-preview-scene-gap))",
  marginInline: "auto",
  color: "var(--foreground, var(--rams-ink, var(--rams-detail-native-content-ink-fallback)))",
  fontSize: "var(--type-body-size, var(--rams-detail-native-body-size-fallback))",
  lineHeight: "var(--rams-detail-preview-print-scene-leading)",
};

const noteStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--muted-foreground, var(--rams-muted, var(--rams-detail-native-muted-ink-fallback)))",
  fontSize: "var(--type-caption-size, var(--rams-detail-preview-print-scene-caption-size-fallback))",
  lineHeight: "var(--type-caption-leading)",
};

const dateFieldStyle: React.CSSProperties = {
  ...sceneStyle,
  maxWidth: "var(--rams-detail-preview-date-field-measure)",
  gap: "var(--rams-detail-space-4)",
  lineHeight: "var(--type-body-leading)",
};

function Scene({
  title,
  place,
  children,
  dateField = false,
}: {
  title: string;
  place: string;
  children: React.ReactNode;
  dateField?: boolean;
}) {
  return (
    <section style={dateField ? dateFieldStyle : sceneStyle} aria-label={`${place}: ${title}`}>
      <header>
        <p style={{ ...noteStyle, marginBottom: dateField ? "var(--rams-detail-preview-date-field-caption-gap)" : "var(--rams-detail-preview-kicker-gap)" }}>{place} · print room</p>
        <h2
          style={{
            margin: 0,
            fontSize: "var(--type-title-size, var(--rams-detail-preview-print-scene-title-size-fallback))",
            fontWeight: "var(--type-title-weight)",
            lineHeight: "var(--type-title-leading)",
            letterSpacing: "var(--type-title-tracking)",
          }}
        >
          {title}
        </h2>
      </header>
      {children}
    </section>
  );
}

const asLocalDate = (day: number) => new Date(2026, 10, day);
const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);

const calendarSceneStyle: React.CSSProperties = {
  ...dateFieldStyle,
  gap: "var(--rams-detail-space-4, var(--rams-detail-preview-scene-gap))",
  color: "var(--foreground, var(--rams-ink, var(--rams-detail-native-content-ink-fallback)))",
  fontSize: "var(--type-body-size, var(--rams-detail-native-body-size-fallback))",
  lineHeight: "var(--rams-detail-preview-print-scene-leading)",
};

const calendarNoteStyle: React.CSSProperties = {
  ...noteStyle,
  color: "var(--muted-foreground, var(--rams-muted, var(--rams-detail-native-muted-ink-fallback)))",
  fontSize: "var(--type-caption-size, var(--rams-detail-preview-print-scene-caption-size-fallback))",
};

export function PrintProofCalendarDemo() {
  const [date, setDate] = React.useState(() => asLocalDate(12));
  const [month, setMonth] = React.useState(() => asLocalDate(1));
  return (
    <section style={calendarSceneStyle} aria-label="Rosario: Edition 18 · proof sign-off">
      <header>
        <p style={{ ...calendarNoteStyle, marginBottom: "var(--rams-detail-preview-date-field-caption-gap)" }}>Rosario · print room</p>
        <h2 style={{
          margin: 0,
          fontSize: "var(--type-title-size, var(--rams-detail-preview-print-scene-title-size-fallback))",
          fontWeight: "var(--type-title-weight)",
          lineHeight: "var(--type-title-leading)",
          letterSpacing: "var(--type-title-tracking)",
        }}>Edition 18 · proof sign-off</h2>
      </header>
      <Calendar
        value={date}
        onValueChange={setDate}
        month={month}
        onMonthChange={setMonth}
        minDate={asLocalDate(2)}
        maxDate={new Date(2026, 11, 4)}
        disabledDates={(day) => day.getDay() === 0 || day.getDay() === 6}
      />
      <p aria-live="polite" style={calendarNoteStyle}>
        Sign-off date: {formatDate(date)}. The sample press schedule accepts
        weekdays from November 2–December 4, 2026.
      </p>
    </section>
  );
}

export function PrintStockDatePickerDemo() {
  const [date, setDate] = React.useState<Date | undefined>(() => asLocalDate(10));
  const disabledDates = (day: Date) =>
    day.getDay() === 0 || day.getDay() === 6 || day.getDate() === 12;

  return (
    <Scene title="Edition 18 · stock receipt" place="Córdoba" dateField>
      <DatePicker
        label="Delivery date"
        value={date}
        onValueChange={setDate}
        minDate={asLocalDate(9)}
        maxDate={asLocalDate(20)}
        disabledDates={disabledDates}
        locale="en-GB"
        description="Weekday receipts, November 9–20; November 12 is reserved for press calibration."
      />
      <p aria-live="polite" style={noteStyle}>
        {date ? `Current delivery date: ${formatDate(date)}.` : "No delivery date selected."}
      </p>
    </Scene>
  );
}

export function PrintHandoffTimePickerDemo() {
  const [time, setTime] = React.useState("14:30");
  return (
    <Scene title="Edition 18 · press handoff" place="Mendoza">
      <TimePicker
        label="Handoff time"
        value={time}
        onValueChange={setTime}
        minuteStep={30}
        format="24h"
        description="Local workshop time; options are spaced every 30 minutes."
      />
      <p aria-live="polite" style={noteStyle}>
        Scheduled handoff: {time} local workshop time.
      </p>
    </Scene>
  );
}

const proofWindow: DateRange = { start: asLocalDate(9), end: asLocalDate(13) };
const pressWindow: DateRange = { start: asLocalDate(16), end: asLocalDate(20) };
const workshopPresets: DateRangePreset[] = [
  { label: "Proof week", range: () => proofWindow },
  { label: "Press week", range: () => pressWindow },
];

export function PrintEditionDateRangeDemo() {
  const [range, setRange] = React.useState<DateRange>(proofWindow);
  return (
    <Scene title="Edition 18 · production window" place="La Plata" dateField>
      <DateRangePicker
        label="Production window"
        value={range}
        onValueChange={setRange}
        presets={workshopPresets}
        minDate={asLocalDate(2)}
        maxDate={asLocalDate(27)}
        weekStartsOn={1}
        locale="en-GB"
        months={1}
      />
      <p aria-live="polite" style={noteStyle}>
        Applied window: {formatDate(range.start)}–{formatDate(range.end)}.
        {" "}Choose Proof week or Press week, then apply the range.
      </p>
    </Scene>
  );
}
