"use client";

import * as React from "react";
import { useLayoutEffect, useState } from "react";
import { AlignLeft, FileText, Layers } from "lucide-react";
import { Button } from "@/primitives/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/primitives/select";
import { printPreviewGeometry } from "@/variants/print-preview-geometry";
import { ExpandableCard } from "@/variants/vendor/registry/components/expandable-card/expandable-card";
import { BottomSheet } from "@/variants/vendor/registry/components/bottom-sheet/bottom-sheet";
import { UserMenu, type ThemePreference, type UserStatus } from "@/variants/vendor/registry/components/user-menu/user-menu";

const sceneStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  width: "100%",
  maxWidth: "var(--rams-detail-preview-print-surface-measure)",
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

export function LaPlataBroadsideExpandableCardDemo() {
  const [reviewed, setReviewed] = useState(false);
  return (
    <section style={sceneStyle} aria-labelledby="broadside-card-title">
      <header>
        <p style={{ ...noteStyle, marginBottom: "var(--rams-detail-preview-kicker-gap)" }}>La Plata · sample print sheet</p>
        <h2 id="broadside-card-title" style={{ margin: 0, fontSize: "var(--type-title-size, var(--rams-detail-preview-print-scene-title-size-fallback))", fontWeight: "var(--type-title-weight)", lineHeight: "var(--type-title-leading)", letterSpacing: "var(--type-title-tracking)" }}>Folded broadside worksheet</h2>
      </header>
      <ExpandableCard
        title="Edition 12 · trim and fold notes"
        description="8-page broadside · 360 sample copies"
        width={printPreviewGeometry.expandableCard.width}
        expandedWidth={printPreviewGeometry.expandableCard.expandedWidth}
      >
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "var(--rams-detail-space-3, calc(var(--rams-detail-preview-space-step-fallback) * 3))" }}>
          <p style={{ margin: 0 }}>Two imposed sheets make one 8-page sample copy. The trim note leaves a 4 mm outer margin.</p>
          <p style={noteStyle}>Paper: uncoated 120 gsm · plates: black and river blue.</p>
          <Button type="button" variant={reviewed ? "secondary" : "default"} onClick={() => setReviewed((current) => !current)}>
            {reviewed ? "Undo review" : "Mark reviewed"}
          </Button>
          <p style={noteStyle} aria-live="polite">{reviewed ? "Local worksheet review mark is set." : "No local review mark is set."}</p>
        </div>
      </ExpandableCard>
      <p style={noteStyle}>The review mark is a local worksheet state.</p>
    </section>
  );
}

export function RosarioPlateNotesBottomSheetDemo() {
  const [open, setOpen] = useState(false);
  const [detent, setDetent] = useState(0);
  const [plate, setPlate] = useState("black");
  const [addedPlate, setAddedPlate] = useState<string | null>(null);
  const added = addedPlate === plate;
  const listedPlateNote = addedPlate === "black" ? "Black plate · text and crop marks" : "River-blue plate · cover illustration";
  const plateNote = plate === "black" ? "Black plate · text and crop marks" : "River-blue plate · cover illustration";
  return (
    <section style={sceneStyle} aria-labelledby="plate-sheet-title">
      <header>
        <p style={{ ...noteStyle, marginBottom: "var(--rams-detail-preview-kicker-gap)" }}>Rosario · sample plate notes</p>
        <h2 id="plate-sheet-title" style={{ margin: 0, fontSize: "var(--type-title-size, var(--rams-detail-preview-print-scene-title-size-fallback))", fontWeight: "var(--type-title-weight)", lineHeight: "var(--type-title-leading)", letterSpacing: "var(--type-title-tracking)" }}>Review a plate note</h2>
      </header>
      <BottomSheet
        trigger={<Button type="button">Open plate notes</Button>}
        open={open}
        onOpenChange={(next) => { setOpen(next); if (next) setDetent(0); }}
        title="Edition 12 · plates"
        description="Local worksheet · two sample inks"
        detents={[...printPreviewGeometry.bottomSheet.detents]}
        initialDetent={0}
        onDetentChange={setDetent}
      >
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "var(--rams-detail-space-3, calc(var(--rams-detail-preview-space-step-fallback) * 3))", width: "100%", maxWidth: "var(--rams-detail-preview-sheet-content-measure)", marginInline: "auto", paddingBlockEnd: "var(--rams-detail-space-6, calc(var(--rams-detail-preview-space-step-fallback) * 6))" }}>
          <div style={{ display: "grid", gap: "var(--rams-detail-space-1, var(--rams-detail-preview-space-step-fallback))" }}>
            <label htmlFor="plate-select" style={{ fontSize: "var(--type-caption-size, var(--rams-detail-preview-print-scene-caption-size-fallback))" }}>Ink plate</label>
            <Select value={plate} onValueChange={setPlate}>
              <SelectTrigger id="plate-select" aria-label="Ink plate"><SelectValue>{plate === "black" ? "Black" : "River blue"}</SelectValue></SelectTrigger>
              <SelectContent>
                <SelectItem value="black">Black · text and crop marks</SelectItem>
                <SelectItem value="river-blue">River blue · cover illustration</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p style={{ margin: 0 }} aria-live="polite">{plateNote}</p>
          <Button type="button" variant={added ? "secondary" : "default"} onClick={() => setAddedPlate(added ? null : plate)}>
            {added ? "Remove from local review note" : "Add to local review note"}
          </Button>
          <p style={noteStyle} aria-live="polite">{addedPlate ? `${listedPlateNote} is listed in this local review note.` : "No plate is listed in the local review note."}</p>
        </div>
      </BottomSheet>
      <p style={noteStyle} aria-live="polite">Sheet state: {open ? (detent === 0 ? "peek detent" : "expanded detent") : "closed"}. Choose an ink plate to update its local note.</p>
      <p style={noteStyle}>Selected plate: {plate === "black" ? "Black" : "River blue"}.</p>
    </section>
  );
}

const menuItems = [
  { label: "Paper ledger", icon: <FileText style={{ width: "var(--rams-detail-preview-menu-glyph-size)", height: "var(--rams-detail-preview-menu-glyph-size)" }} aria-hidden="true" /> },
  { label: "Plate notes", icon: <Layers style={{ width: "var(--rams-detail-preview-menu-glyph-size)", height: "var(--rams-detail-preview-menu-glyph-size)" }} aria-hidden="true" /> },
  { label: "Edition colophon", icon: <AlignLeft style={{ width: "var(--rams-detail-preview-menu-glyph-size)", height: "var(--rams-detail-preview-menu-glyph-size)" }} aria-hidden="true" /> },
];

type MenuDestination = "ledger" | "plates" | "colophon";

function DestinationPanel({ destination }: { destination: MenuDestination }) {
  const panelStyle: React.CSSProperties = {
    display: "grid",
    gap: "var(--rams-detail-space-2, calc(var(--rams-detail-preview-space-step-fallback) * 2))",
    padding: "var(--rams-detail-space-3, calc(var(--rams-detail-preview-space-step-fallback) * 3))",
    border: "var(--rams-detail-primitive-border-width) solid var(--border, var(--rams-detail-preview-panel-border-fallback))",
    borderRadius: "var(--rams-detail-radius, var(--rams-detail-preview-panel-radius-fallback))",
  };
  if (destination === "ledger") return (
    <section style={panelStyle} aria-labelledby="ledger-panel-title">
      <h3 id="ledger-panel-title" style={{ margin: 0, fontSize: "var(--type-title-size, var(--rams-detail-native-body-size-fallback))" }}>Paper ledger · Edition 12</h3>
      <p style={{ margin: 0 }}>Uncoated stock · 120 gsm · 360 sample copies</p>
      <p style={noteStyle}>Two imposed sheets per copy · 720 sheets planned</p>
    </section>
  );
  if (destination === "plates") return (
    <section style={panelStyle} aria-labelledby="plate-panel-title">
      <h3 id="plate-panel-title" style={{ margin: 0, fontSize: "var(--type-title-size, var(--rams-detail-native-body-size-fallback))" }}>Plate notes · Edition 12</h3>
      <p style={{ margin: 0 }}>Black: text and crop marks</p>
      <p style={{ margin: 0 }}>River blue: cover illustration</p>
      <p style={noteStyle}>Both plates are listed on the sample press sheet.</p>
    </section>
  );
  return (
    <section style={panelStyle} aria-labelledby="colophon-panel-title">
      <h3 id="colophon-panel-title" style={{ margin: 0, fontSize: "var(--type-title-size, var(--rams-detail-native-body-size-fallback))" }}>Edition colophon</h3>
      <p style={{ margin: 0 }}>Ribera · workshop booklet 12</p>
      <p style={{ margin: 0 }}>La Plata · November 2026</p>
      <p style={noteStyle}>A fictional sample imprint for this print-room preview.</p>
    </section>
  );
}

export function SamplePrintRoomUserMenuDemo() {
  const [status, setStatus] = useState<UserStatus>("available");
  const [theme, setTheme] = useState<ThemePreference>("system");
  const [destination, setDestination] = useState<MenuDestination | null>(null);
  const [closed, setClosed] = useState(false);
  const [systemDark, setSystemDark] = useState(false);
  const focusBeforeClose = React.useRef<HTMLElement | null>(null);
  const reopenRef = React.useRef<HTMLButtonElement | null>(null);
  const menuRef = React.useRef<HTMLButtonElement | null>(null);
  const focusBeforeReopen = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemDark(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useLayoutEffect(() => {
    const origin = focusBeforeClose.current;
    if (closed && origin && !origin.isConnected && document.activeElement === document.body) {
      reopenRef.current?.focus({ preventScroll: true });
    }
    const reopening = focusBeforeReopen.current;
    if (!closed && reopening && !reopening.isConnected && document.activeElement === document.body) menuRef.current?.focus({ preventScroll: true });
    focusBeforeClose.current = null;
    focusBeforeReopen.current = null;
  }, [closed]);

  const resolvedTheme = theme === "system" ? (systemDark ? "dark" : "light") : theme;
  const specimenStyle: React.CSSProperties = {
    display: "grid",
    gap: "var(--rams-detail-space-2, calc(var(--rams-detail-preview-space-step-fallback) * 2))",
    padding: "var(--rams-detail-space-4, var(--rams-detail-preview-scene-gap))",
    border: "var(--rams-detail-primitive-border-width) solid currentColor",
    borderRadius: "var(--rams-detail-radius, var(--rams-detail-preview-panel-radius-fallback))",
    background: resolvedTheme === "dark" ? "var(--rams-detail-preview-paper-ink)" : "var(--rams-detail-preview-paper-fill)",
    color: resolvedTheme === "dark" ? "var(--rams-detail-preview-paper-fill)" : "var(--rams-detail-preview-paper-ink)",
  };
  if (closed) {
    return (
      <section style={sceneStyle} aria-label="Sample print-room menu closed">
        <p style={noteStyle}>Menu closed · print-room sample</p>
        <Button ref={reopenRef} type="button" variant="secondary" onClick={() => { focusBeforeReopen.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; setClosed(false); }}>Reopen print-room menu</Button>
      </section>
    );
  }
  return (
    <section style={sceneStyle} aria-label="Sample print-room account menu">
      <header>
        <p style={{ ...noteStyle, marginBottom: "var(--rams-detail-preview-kicker-gap)" }}>Mendoza · local menu preview</p>
        <h2 style={{ margin: 0, fontSize: "var(--type-title-size, var(--rams-detail-preview-print-scene-title-size-fallback))", fontWeight: "var(--type-title-weight)", lineHeight: "var(--type-title-leading)", letterSpacing: "var(--type-title-tracking)" }}>Print-room preferences</h2>
      </header>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", justifyItems: "start", gap: "var(--rams-detail-space-2, calc(var(--rams-detail-preview-space-step-fallback) * 2))" }}>
        <UserMenu
          ref={menuRef}
          user={{ name: "Print room editor", email: "editor@example.invalid" }}
          status={status}
          onStatusChange={setStatus}
          theme={theme}
          onThemeChange={setTheme}
          items={menuItems.map((item, index) => ({ ...item, onSelect: () => setDestination((["ledger", "plates", "colophon"] as const)[index] ?? "ledger") }))}
          onSignOut={() => {
            focusBeforeClose.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            setClosed(true);
            setDestination(null);
          }}
          showName
          align="start"
          portal={false}
        />
      </div>
      <p style={noteStyle} aria-live="polite">Presence: {status} · paper specimen: {theme} preference ({resolvedTheme}).</p>
      <div style={specimenStyle} aria-label={`${resolvedTheme} paper specimen`}>
        <strong>Edition 12 · field note</strong>
        <span>Uncoated 120 gsm · black and river blue</span>
      </div>
      {destination && <DestinationPanel destination={destination} />}
      <p style={noteStyle}>Sample identity · editor@example.invalid</p>
    </section>
  );
}
