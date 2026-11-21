"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/primitives/button";
import { UsageMeter } from "@/variants/vendor/registry/components/usage-meter/usage-meter";
import { OnboardingChecklist } from "@/variants/vendor/registry/components/onboarding-checklist/onboarding-checklist";
import { Timeline, type TimelineEvent } from "@/variants/vendor/registry/components/timeline/timeline";
import { Stepper, type StepperStep } from "@/variants/vendor/registry/components/stepper/stepper";
import { Countdown } from "@/variants/vendor/registry/components/countdown/countdown";
import { PasswordStrength } from "@/variants/vendor/registry/components/password-strength/password-strength";

const sceneStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  width: "100%",
  maxWidth: "var(--rams-detail-preview-print-scene-measure)",
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

function Scene({ title, place, children }: { title: string; place: string; children: React.ReactNode }) {
  return (
    <section style={sceneStyle} aria-label={`${place}: ${title}`}>
      <header>
        <p style={{ ...noteStyle, marginBottom: "var(--rams-detail-preview-kicker-gap)" }}>{place} · print room</p>
        <h2 style={{ margin: 0, fontSize: "var(--type-title-size, var(--rams-detail-preview-print-scene-title-size-fallback))", fontWeight: "var(--type-title-weight)", lineHeight: "var(--type-title-leading)", letterSpacing: "var(--type-title-tracking)" }}>{title}</h2>
      </header>
      {children}
    </section>
  );
}

export function PrintWeekUsageMeterDemo() {
  return (
    <Scene title="Paper used in the sample print week" place="Rosario">
      <UsageMeter
        label="Paper allocation"
        unit="kg"
        limit={16}
        decimals={1}
        segments={[
          { id: "text-stock", label: "Text stock", value: 6.4 },
          { id: "cover-stock", label: "Cover stock", value: 3.2 },
          { id: "proof-sheets", label: "Proof sheets", value: 2.1 },
        ]}
      />
      <p style={noteStyle}>Sample worksheet: 11.7 kg of 16 kg allocated (4.3 kg unassigned).</p>
      <p style={noteStyle}>Illustrative quantities only; this is not a live inventory reading.</p>
    </Scene>
  );
}

const bookletSetupSteps = [
  { id: "stock", title: "Choose paper stock", description: "Record the text and cover stock for the sample booklet." },
  { id: "plates", title: "Prepare plate separations", description: "Check that the black and vermilion plates match the proof." },
  { id: "proof", title: "Review a press proof", description: "Mark the sample proof for registration and trim review." },
  { id: "fold", title: "Fold and count copies", description: "Record the folded sample quantity for the worksheet." },
];

export function BookletSetupChecklistDemo() {
  return (
    <Scene title="Booklet setup checklist" place="Córdoba">
      <OnboardingChecklist
        title="Prepare the 16-page sample booklet"
        doneTitle="Sample setup steps complete"
        steps={bookletSetupSteps}
        defaultCompleted={["stock"]}
      />
      <p style={noteStyle}>Checklist state stays in this example; marking a step does not trigger production work.</p>
    </Scene>
  );
}

const sampleTimelineNow = Date.parse("2026-09-18T17:00:00-03:00");
const sampleTimelineEvents: TimelineEvent[] = [
  {
    id: "stock-entry",
    at: Date.parse("2026-09-18T09:10:00-03:00"),
    title: "Paper stock entered in worksheet",
    meta: "Sample run · 18 Sep 2026",
    tone: "success",
    detail: <p style={{ margin: 0 }}>Sample entry records 120 text-stock sheets and 40 cover sheets for the booklet exercise.</p>,
  },
  {
    id: "plate-check",
    at: Date.parse("2026-09-18T10:25:00-03:00"),
    title: "Two plate separations checked",
    meta: "Black and vermilion · sample proof",
    tone: "success",
    detail: <p style={{ margin: 0 }}>The fictional worksheet records a black plate and a vermilion plate for the same sample edition.</p>,
  },
  {
    id: "proof-mark",
    at: Date.parse("2026-09-18T13:05:00-03:00"),
    title: "Trim mark noted on proof",
    meta: "Review note · sample workflow",
    detail: <p style={{ margin: 0 }}>A local example note records the trim mark for later comparison; it does not certify a press result.</p>,
  },
  {
    id: "fold-count",
    at: Date.parse("2026-09-18T15:40:00-03:00"),
    title: "Folded sample quantity recorded",
    meta: "Worksheet count · 24 copies",
    tone: "success",
    detail: <p style={{ margin: 0 }}>This sample timeline ends with a worksheet count of 24 folded copies.</p>,
  },
];

const timelineSceneStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  width: "100%",
  minWidth: 0,
  marginInline: "auto",
  maxWidth: "var(--rams-detail-preview-print-scene-measure)",
  gap: "var(--rams-detail-space-4, var(--rams-detail-docs-space-standard))",
  color: "var(--foreground, var(--rams-ink, var(--rams-detail-foreground)))",
  fontSize: "var(--type-body-size, var(--rams-detail-native-body-size-fallback))",
  lineHeight: "var(--type-body-leading, var(--rams-detail-preview-print-scene-leading))",
};
const timelineNoteStyle: React.CSSProperties = {
  margin: 0,
  lineHeight: "var(--type-caption-leading)",
  color: "var(--muted-foreground, var(--rams-muted, var(--rams-detail-text-muted)))",
  fontSize: "var(--type-caption-size, var(--rams-detail-preview-print-scene-caption-size-fallback))",
};

export function BookletWorkflowTimelineDemo() {
  return (
    <section style={timelineSceneStyle} aria-label="Mendoza: Sample booklet workflow">
      <header>
        <p style={{ ...timelineNoteStyle, marginBottom: "var(--rams-detail-preview-kicker-gap)" }}>Mendoza · print room</p>
        <h2 style={{ margin: 0, fontSize: "var(--type-title-size, var(--rams-detail-preview-print-scene-title-size-fallback))", fontWeight: "var(--type-title-weight)", lineHeight: "var(--type-title-leading)", letterSpacing: "var(--type-title-tracking)" }}>Sample booklet workflow</h2>
      </header>
      <Timeline
        events={sampleTimelineEvents}
        now={sampleTimelineNow}
        relativeTime={false}
        label="Sample booklet workflow events"
        timeZone="America/Argentina/Buenos_Aires"
        locale="en-GB"
        defaultExpanded={["stock-entry"]}
      />
      <p style={timelineNoteStyle}>Fixed sample worksheet entries dated September 18, 2026; no live activity feed is connected.</p>
    </section>
  );
}

const bookletSteps: StepperStep[] = [
  { id: "cut", label: "Cut stock", description: "Trim the sample sheets to size." },
  { id: "print", label: "Print plates", description: "Record the two-plate sample run." },
  { id: "fold", label: "Fold sheets", description: "Fold and collate the booklet pages." },
  { id: "bundle", label: "Count bundle", description: "Enter the final sample copy count." },
];

export function BookletProductionStepperDemo() {
  const [current, setCurrent] = useState(1);
  const complete = current === bookletSteps.length;
  const backControl = React.useRef<HTMLButtonElement>(null);
  const nextControl = React.useRef<HTMLButtonElement>(null);
  const completeStatus = "All four sample stages are marked complete.";
  const status = complete ? completeStatus : `Current sample stage: ${bookletSteps[current]?.label ?? "complete"}.`;
  const advance = (next: number, control: HTMLButtonElement) => {
    // Transfer only focus owned by the control that is about to be disabled.
    if (document.activeElement === control) {
      if (next === bookletSteps.length) backControl.current?.focus({ preventScroll: true });
      else if (next === 0) nextControl.current?.focus({ preventScroll: true });
    }
    setCurrent(next);
  };
  return (
    <Scene title="Sample booklet sequence" place="La Plata">
      <Stepper
        steps={bookletSteps}
        current={current}
        onStepSelect={setCurrent}
        label="Booklet sample workflow"
        completeLabel="Sample sequence reviewed"
        details="current"
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, var(--rams-detail-preview-stepper-action-track-min)), 1fr))", gap: "var(--rams-detail-space-2, calc(var(--rams-detail-preview-space-step-fallback) * 2))", minWidth: 0 }}>
        <Button ref={backControl} type="button" variant="secondary" disabled={current === 0} onClick={event => advance(Math.max(0, current - 1), event.currentTarget)}>Back</Button>
        <Button ref={nextControl} type="button" disabled={complete} onClick={event => advance(Math.min(bookletSteps.length, current + 1), event.currentTarget)}>Continue</Button>
      </div>
      <p style={{ ...noteStyle, display: "grid" }} aria-live="polite">
        {[...bookletSteps.map(step => `Current sample stage: ${step.label}.`), completeStatus].map(text => <span key={text} aria-hidden="true" style={{ gridArea: "1 / 1", visibility: "hidden" }}>{text}</span>)}
        <span style={{ gridArea: "1 / 1" }}>{status}</span>
      </p>
      <p style={noteStyle}>Navigation updates only this example; it does not start a print job.</p>
    </Scene>
  );
}

export function SampleHandoffCountdownDemo() {
  return (
    <Scene title="Sample handoff window" place="Buenos Aires">
      <Countdown
        target="2026-11-20T09:00:00"
        timeZone="America/Argentina/Buenos_Aires"
        label="Sample handoff window starts in"
        completeLabel="Sample handoff time reached"
      />
      <p style={noteStyle}>Illustrative target: November 20, 2026 at 09:00 ART. This fixed example date is not a real booking or deadline.</p>
    </Scene>
  );
}

export function SamplePassphraseStrengthDemo() {
  const [value, setValue] = useState("");
  return (
    <Scene title="Passphrase strength estimate" place="Rosario">
      <PasswordStrength
        label="Sample proof-station passphrase"
        value={value}
        onValueChange={setValue}
        autoComplete="off"
        placeholder="Enter a sample phrase"
      />
      <p style={noteStyle}>The meter applies its built-in length, letter-case, number, and symbol rules locally.</p>
      <p style={noteStyle}>This estimate is not a server policy check. Do not enter a real account password in this sample.</p>
    </Scene>
  );
}
