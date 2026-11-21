import { useState } from "react";
import { Button, type ButtonVariant } from "../../primitives/button";
import { NativeSelect } from "../../primitives/native-select";
import { Spinner } from "../../primitives/spinner";
function Mark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="var(--rams-detail-preview-button-link-glyph-stroke)"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function Shortlist({ variant = "outline" }: { variant?: ButtonVariant }) {
  const [kept, setKept] = useState(false);
  return (
    <div style={{ display: "grid", justifyItems: "start", gap: "calc(var(--spacing,var(--rams-detail-native-spacing-fallback))*4)" }}>
      <Button variant={variant} onClick={() => setKept((value) => !value)}>
        {kept ? "Remove from shortlist" : "Keep terrace study"}
      </Button>
      <p role="status" style={{ display: "grid", margin: 0 }}>
        <span aria-hidden="true" style={{ gridArea: "1 / 1", visibility: "hidden" }}>Shortlist: Terrace study / Rosario.</span>
        <span style={{ gridArea: "1 / 1" }}>{kept ? "Shortlist: Terrace study / Rosario." : ""}</span>
      </p>
    </div>
  );
}
export function ButtonDemo() {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-start",
        gap: "calc(var(--spacing,var(--rams-detail-native-spacing-fallback))*4)",
      }}
    >
      <Shortlist />
      <Button
        variant="outline"
        size="icon"
        aria-label="Open Pablo Zarate’s work"
        asChild
      >
        <a href="https://pablozarate.com">
          <Mark />
        </a>
      </Button>
    </div>
  );
}
export function ButtonOutline() {
  return <Shortlist />;
}
export function ButtonSecondary() {
  return <Shortlist variant="secondary" />;
}
export function ButtonGhost() {
  return <Shortlist variant="ghost" />;
}
export function ButtonLink() {
  return (
    <Button variant="link" asChild>
      <a href="https://pablozarate.com">Pablo Zarate</a>
    </Button>
  );
}
export function ButtonDestructive() {
  const [proof, setProof] = useState(true);
  return (
    <div style={{ display: "grid", justifyItems: "start", gap: "calc(var(--spacing,var(--rams-detail-native-spacing-fallback))*4)" }}>
      <Button
        variant={proof ? "destructive" : "outline"}
        onClick={() => setProof((value) => !value)}
      >
        {proof ? "Discard proof" : "Restore proof"}
      </Button>
      <p role="status" style={{ display: "grid", margin: 0 }}>
        {["Folded proof / 03 is ready for review.", "Folded proof / 03 was removed."].map(text => <span key={text} aria-hidden="true" style={{ gridArea: "1 / 1", visibility: "hidden" }}>{text}</span>)}
        <span style={{ gridArea: "1 / 1" }}>{proof ? "Folded proof / 03 is ready for review." : "Folded proof / 03 was removed."}</span>
      </p>
    </div>
  );
}
export function ButtonSize() {
  const [variant, setVariant] = useState<ButtonVariant>("outline");
  return (<div style={{display:"grid",gap:"var(--spacing)"}}><label>Style<NativeSelect value={variant} onChange={event=>setVariant(event.target.value as ButtonVariant)}>{(["default","secondary","outline","ghost","link","destructive"] as const).map(value=><option key={value} value={value}>{value}</option>)}</NativeSelect></label>
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "calc(var(--spacing,var(--rams-detail-native-spacing-fallback))*3)",
      }}
    >
      {(["xs", "sm", "default", "lg"] as const).map((size) => (
        <Button key={size} variant={variant} size={size}>
          Keep edition
        </Button>
      ))}
    </div></div>
  );
}
export function ButtonIcon() {
  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Open Pablo Zarate’s work"
      asChild
    >
      <a href="https://pablozarate.com">
        <Mark />
      </a>
    </Button>
  );
}
export function ButtonLoading() {
  return (
    <Button disabled aria-busy="true">
      <Spinner aria-hidden="true" />
      Preparing
    </Button>
  );
}
