"use client";

import * as React from "react";
import { motionTokens } from "@/variants/motion-tokens";
import { Button } from "@/variants/vendor/registry/components/button/button";
import {
  AnnouncementBar,
  type Announcement,
} from "@/variants/vendor/registry/components/announcement-bar/announcement-bar";
import {
  CookieConsent,
  type CookieCategory,
  type CookieConsentHandle,
  type CookieConsentValue,
} from "@/variants/vendor/registry/components/cookie-consent/cookie-consent";
import EmptyStates from "@/variants/vendor/registry/blocks/empty-states/empty-states";
import {
  NotificationCenter,
  type NotificationItem,
} from "@/variants/vendor/registry/components/notification-center/notification-center";
import Toast from "@/variants/vendor/registry/components/toast/toast";
import {
  ToastStack,
  ToastStackProvider,
  useToastStack,
} from "@/variants/vendor/registry/components/toast-stack/toast-stack";

const sceneStyle: React.CSSProperties = {
  display: "grid", gridTemplateColumns: "minmax(0, 1fr)",
  width: "100%",
  maxWidth: "var(--rams-detail-preview-print-scene-measure-narrow)",
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

function Scene({
  title,
  place,
  children,
}: {
  title: string;
  place: string;
  children: React.ReactNode;
}) {
  return (
    <section style={sceneStyle} aria-label={`${place}: ${title}`}>
      <header>
        <p style={{ ...noteStyle, marginBottom: "var(--rams-detail-preview-kicker-gap)" }}>{place} · print room</p>
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

const feedbackNoteStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--rams-detail-text-muted)",
  fontSize: "var(--type-caption-size)",
  lineHeight: "var(--type-caption-leading)",
};

function FeedbackScene({
  title,
  place,
  children,
}: {
  title: string;
  place: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-label={`${place}: ${title}`}
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        inlineSize: "100%",
        maxInlineSize: "var(--rams-detail-feedback-scene-measure)",
        minInlineSize: 0,
        gap: "var(--rams-detail-space-4)",
        marginInline: "auto",
        color: "var(--rams-detail-foreground)",
        fontSize: "var(--type-body-size)",
        lineHeight: "var(--type-body-leading)",
      }}
    >
      <header>
        <p style={{ ...feedbackNoteStyle, marginBlockEnd: "var(--rams-detail-feedback-scene-kicker-gap)" }}>
          {place} · print room
        </p>
        <h2
          style={{
            margin: 0,
            fontSize: "var(--type-title-size)",
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

// The contained overlay reserves its natural expanded height even while tucked.
function ContainedProofNotices() {
  const host = React.useRef<HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    const node = host.current, region = node?.firstElementChild;
    if (!node || !(region instanceof HTMLElement)) return;
    const reserve = () => {
      const inset = Number.parseFloat(getComputedStyle(region).bottom) || 0;
      node.style.setProperty("--rams-proof-notice-content-reserve", `${region.offsetHeight + inset * 2}px`);
    };
    reserve();
    const observer = new ResizeObserver(reserve);
    observer.observe(region);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={host}
      style={{
        position: "relative",
        minBlockSize: "max(var(--rams-detail-feedback-stack-preview-min-block), var(--rams-proof-notice-content-reserve, var(--rams-detail-feedback-stack-preview-min-block)))",
      }}
    >
      <ToastStack contained position="bottom-center" visibleToasts={motionTokens.keyframes.toastStack.proofPreviewVisibleToasts} />
    </div>
  );
}

function ToastStackControls() {
  const { toast, update, dismiss, count } = useToastStack();
  const [checks, setChecks] = React.useState(0);
  const recordAction = React.useRef<HTMLButtonElement>(null);

  function recordSampleCheck() {
    setChecks((current) => current + 1);
    toast({
      type: "info",
      title: "Sample proof check recorded",
      description: "This change is local to the preview.",
      duration: Infinity,
      action: {
        label: "Undo",
        onClick: (id) => {
          setChecks((current) => Math.max(0, current - 1));
          update(id, {
            type: "info",
            title: "Sample check removed",
            description: "The local count was reduced by one.",
            action: undefined,
            duration: 4500,
          });
        },
      },
    });
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "var(--rams-detail-feedback-stack-controls-gap)", minInlineSize: 0 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--rams-detail-feedback-action-group-gap)" }}>
        <Button ref={recordAction} size="sm" variant="outline" onClick={recordSampleCheck}>
          Record sample proof check
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={count === 0}
          onClick={event => {
            if (document.activeElement === event.currentTarget)
              recordAction.current?.focus({ preventScroll: true });
            dismiss();
          }}
        >
          Dismiss all notices
        </Button>
      </div>
      <p role="status" style={feedbackNoteStyle}>
        Local proof checks recorded: {checks}. Open notices: {count}.
      </p>
      <ContainedProofNotices />
    </div>
  );
}

export function PrintProofToastStackDemo() {
  return (
    <FeedbackScene title="Proof-check notices" place="Rosario">
      <ToastStackProvider limit={4}>
        <ToastStackControls />
      </ToastStackProvider>
      <p style={feedbackNoteStyle}>
        The four newest notices stay open for Undo or dismissal. Proof checks
        remain local to this preview.
      </p>
    </FeedbackScene>
  );
}

export function PrintReminderToastDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <FeedbackScene title="Trim-mark reminder" place="Córdoba">
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", justifyItems: "start", gap: "var(--rams-detail-feedback-controls-gap)" }}>
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          Show local proof reminder
        </Button>
        <div style={{ position: "relative", minBlockSize: "var(--rams-detail-feedback-toast-preview-min-block)", inlineSize: "100%" }}>
          <Toast
            open={open}
            onOpenChange={setOpen}
            title="Proof reminder"
            description="Check crop marks before signing the sheet."
          />
        </div>
      </div>
      <p style={feedbackNoteStyle}>
        This is a local reminder. The toast uses its built-in dismissal behavior;
        no proof status is saved.
      </p>
    </FeedbackScene>
  );
}

const workshopNotices: NotificationItem[] = [
  {
    id: "proof-density",
    title: "Density note added",
    description: "Sample proof 03: black plate measured 1.42 on the worksheet.",
    time: "09:20",
    tone: "info",
  },
  {
    id: "trim-review",
    title: "Trim review needed",
    description: "Sample proof 04 records a 0.18 mm offset for review.",
    time: "08:45",
    tone: "warning",
  },
  {
    id: "edition-packed",
    title: "Edition 17 packing list checked",
    description: "Local sample record: 120 cartons listed for dispatch.",
    time: "Yesterday",
    read: true,
    tone: "success",
  },
];

export function PrintWorkshopNotificationCenterDemo() {
  const [status, setStatus] = React.useState("Two sample updates are unread.");
  return (
    <FeedbackScene title="Workshop update desk" place="Mendoza">
      <NotificationCenter
        notifications={workshopNotices}
        label="Sample workshop updates"
        onReadChange={(item, read) =>
          setStatus(`${item.title}: marked ${read ? "read" : "unread"} in this preview.`)
        }
        onDismiss={(item) => setStatus(`${item.title} removed from this local panel.`)}
      />
      <p role="status" style={feedbackNoteStyle}>
        {status} All notices are sample entries; no people or external services
        are involved.
      </p>
    </FeedbackScene>
  );
}

export function PrintScheduleAnnouncementDemo() {
  const [open, setOpen] = React.useState(true);
  const [scheduleOpen, setScheduleOpen] = React.useState(false);
  const bar = React.useRef<HTMLElement>(null);
  const restore = React.useRef<HTMLButtonElement>(null);
  const pendingFocus = React.useRef<HTMLElement | null>(null);
  const notesOrigin = React.useRef<HTMLElement | null>(null);
  React.useLayoutEffect(() => {
    const previous = pendingFocus.current;
    pendingFocus.current = null;
    if (previous && (document.activeElement === previous || document.activeElement === document.body)) {
      if (open) bar.current?.querySelector<HTMLButtonElement>("button")?.focus();
      else restore.current?.focus();
    }
  }, [open]);
  const messages = React.useMemo<Announcement[]>(
    () => [
      {
        id: "proof-window",
        message: "Edition 18 proof review: November 9–13, sample schedule.",
        action: {
          label: "Show proof notes",
          onClick: () => { notesOrigin.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; setScheduleOpen(true); },
        },
      },
      {
        id: "press-window",
        message: "Edition 18 press window: November 16–20, sample schedule.",
        action: {
          label: "Show press notes",
          onClick: () => { notesOrigin.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; setScheduleOpen(true); },
        },
      },
    ],
    [],
  );

  return (
    <Scene title="Edition 18 schedule notices" place="La Plata">
      <AnnouncementBar
          ref={bar}
          messages={messages}
          label="Sample production notices"
          open={open}
          onOpenChange={(next) => {
            if (!next && document.activeElement instanceof HTMLElement && bar.current?.contains(document.activeElement)) pendingFocus.current = document.activeElement;
            setOpen(next);
          }}
          autoPlay={false}
          controls
          dismissible
        />
      {!open && (
        <Button ref={restore} size="sm" variant="outline" onClick={() => { pendingFocus.current = restore.current; setOpen(true); }}>
          Show schedule notices
        </Button>
      )}
      {scheduleOpen && (
        <div
          style={{
            display: "grid", gridTemplateColumns: "minmax(0, 1fr)",
            gap: "var(--rams-detail-preview-schedule-notes-gap)",
            borderInlineStart: "var(--rams-detail-preview-schedule-notes-rule) solid var(--rams-detail-border)",
            paddingInlineStart: "var(--rams-detail-preview-schedule-notes-inset)",
          }}
        >
          <p style={{ margin: 0 }}>Proof review: November 9–13.</p>
          <p style={{ margin: 0 }}>Press window: November 16–20.</p>
          <Button
            size="sm"
            variant="ghost"
            onClick={(event) => { if (document.activeElement === event.currentTarget && notesOrigin.current?.isConnected) notesOrigin.current.focus(); setScheduleOpen(false); }}
          >
            Hide schedule notes
          </Button>
        </div>
      )}
      <p style={noteStyle}>
        Messages move only with the bar controls. Dismissal is not persisted
        between visits in this local preview.
      </p>
    </Scene>
  );
}

const consentCategories: CookieCategory[] = [
  {
    id: "essential",
    label: "Essential settings",
    description: "Required for a site to retain basic session and security preferences.",
    required: true,
  },
  {
    id: "proof-display",
    label: "Proof display preferences",
    description: "Would remember language and reading-density choices in a connected site.",
  },
  {
    id: "guide-counts",
    label: "Aggregate guide counts",
    description: "Would count guide views only if an analytics service were connected.",
  },
];

export function PrintWorkshopCookieConsentDemo() {
  const controller = React.useRef<CookieConsentHandle>(null);
  const [value, setValue] = React.useState<CookieConsentValue | null>(null);
  const [action, setAction] = React.useState("No sample choice saved.");
  return (
    <Scene title="Workshop site preferences" place="Buenos Aires">
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "var(--rams-detail-preview-consent-surface-height)",
          minHeight: "var(--rams-detail-preview-consent-surface-min-height)",
          "--rams-detail-cookie-consent-list-max": "var(--rams-detail-preview-consent-list-max)",
        } as React.CSSProperties}
      >
        <CookieConsent
          ref={controller}
          categories={consentCategories}
          value={value}
          onValueChange={(next, detail) => {
            setValue(next);
            setAction(`Sample preference action: ${detail.action}.`);
          }}
          strategy="absolute"
          labels={{
            message:
              "This local preference preview changes component state only; no cookies or tracking scripts are connected.",
            customize: "Review",
            acceptAll: "Allow optional",
            rejectAll: "Essential",
            save: "Save",
            preferencesTitle: "Cookie settings",
            preferencesDescription:
              "Choose optional categories for the sample site. You can reopen this panel after saving.",
            reopen: "Workshop preferences",
            alwaysOn: "Always on",
            close: "Close preferences",
          }}
        />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--rams-detail-feedback-action-group-gap)" }}>
        <p role="status" style={{ ...noteStyle, flex: "1 1 var(--rams-detail-preview-consent-status-basis)" }}>
          {action} Optional categories selected: {value
            ? consentCategories.filter((category) => !category.required && value[category.id]).length
            : 0}.
        </p>
        {value !== null && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => controller.current?.reset()}
          >
            Reset sample choice
          </Button>
        )}
      </div>
    </Scene>
  );
}

export function PrintRecoveryEmptyStatesDemo() {
  return (
    <Scene title="Empty-state patterns" place="Print workflow">
      <EmptyStates />
      <p style={noteStyle}>
        Clear filters, add a note or proof packet, and open a stored folio. Changes
        stay in this preview.
      </p>
    </Scene>
  );
}
