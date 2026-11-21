"use client";

import { useTheme } from "next-themes";
import { ThemeSwitch, type ThemeSwitchVariant } from "@/variants/vendor/registry/components/theme-switch/theme-switch";
import { transitionTheme } from "@/variants/theme-transition";
import "@/variants/theme-transition.css";

function PrintThemeScene({ variant }: { variant: ThemeSwitchVariant }) {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  return <section aria-label="Rosario print proof" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", width: "100%", maxWidth: "var(--rams-detail-preview-print-scene-measure)", gap: "var(--rams-detail-space-4, calc(var(--rams-detail-preview-space-step-fallback) * 4))", fontSize: "var(--type-body-size)", lineHeight: "var(--rams-detail-preview-print-scene-leading)", minWidth: 0 }}>
    <header>
      <p style={{ margin: 0, fontSize: "var(--type-caption-size)", color: "var(--muted-foreground,var(--rams-muted,var(--rams-detail-native-muted-ink-fallback)))" }}>Rosario · proof desk</p>
      <h2 style={{ margin: 0, fontSize: "var(--type-title-size)", lineHeight: "var(--type-title-leading)", overflowWrap: "anywhere" }}>Review the same proof in light and dark</h2>
    </header>
    <svg viewBox="0 0 360 168" role="img" aria-label="RS-12 booklet proof: two imposed pages with a central fold guide" style={{ width: "100%", height: "auto", color: "var(--foreground,var(--rams-ink))", background: "var(--muted,var(--rams-subtle))" }}>
      <g stroke="currentColor" fill="none"><path d="M24 24h312v120H24z"/><path d="M180 16v136" strokeDasharray="3 5"/><path d="M40 100h112m-112 8h96m72-56h112m-112 8h96"/></g>
      <g fill="currentColor" fontFamily="inherit"><text x="40" y="68" fontSize="26">RS-12</text><text x="208" y="118" fontSize="14">FOLD / 02</text></g>
    </svg>
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", justifyItems: "start", gap: "var(--rams-detail-space-2, calc(var(--rams-detail-preview-space-step-fallback) * 2))" }}>
      <ThemeSwitch variant={variant} theme={dark ? "dark" : "light"} onThemeChange={(next, movement, trigger) => void transitionTheme(next, movement, trigger, setTheme)} />
      <p style={{ margin: 0, color: "var(--muted-foreground,var(--rams-muted,var(--rams-detail-native-muted-ink-fallback)))", fontSize: "var(--type-caption-size)" }}>Current viewing mode: {dark ? "dark" : "light"}. Proof content stays unchanged.</p>
    </div>
  </section>;
}

export function PrintProofThemeRevealDemo() { return <PrintThemeScene variant="reveal" />; }
export function PrintProofThemeEclipseDemo() { return <PrintThemeScene variant="eclipse" />; }
export function PrintProofThemeSplitDemo() { return <PrintThemeScene variant="split" />; }
export function PrintProofThemeRiseDemo() { return <PrintThemeScene variant="rise" />; }
