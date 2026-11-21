"use client";

import { useId, useState, type CSSProperties } from "react";
import { SignupForm, type SignupDetails } from "@/variants/vendor/registry/blocks/signup-form/signup-form";
import { SignIn, type SignInAccount, type SignInMethod } from "@/variants/vendor/registry/blocks/sign-in/sign-in";
import { LoginCentered, type LoginMethod } from "@/variants/vendor/registry/blocks/login-centered/login-centered";

const sceneStyle: CSSProperties = { display: "grid", gridTemplateColumns: "minmax(0,1fr)", inlineSize: "100%", gap: "var(--rams-detail-space-4,var(--rams-detail-preview-scene-gap))", color: "var(--rams-detail-foreground,currentColor)", lineHeight: "var(--rams-detail-leading-body,var(--rams-detail-native-body-leading-fallback))" };
const noteStyle: CSSProperties = { margin: 0, color: "var(--rams-detail-text-secondary,currentColor)", fontSize: "var(--rams-detail-text-sm,var(--rams-detail-preview-print-scene-caption-size-fallback))", overflowWrap: "anywhere" };
const listStyle: CSSProperties = { display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: "var(--rams-detail-space-2,calc(var(--rams-detail-preview-space-step-fallback) * 2))", margin: 0, paddingInlineStart: "var(--rams-detail-preview-reader-list-indent)", overflowWrap: "anywhere" };

type ReaderEntry = Pick<SignupDetails, "name" | "email" | "productUpdates">;
/** Reader register: the real callback stores only the three displayed, non-secret fields. */
export function PrintReaderSignupDemo() {
  const [readers, setReaders] = useState<ReaderEntry[]>([]);
  function keepReader({ name, email, productUpdates }: SignupDetails) {
    if (readers.some(reader => reader.email.toLowerCase() === email.toLowerCase())) throw new Error("This address is already in the local Folio21 reader register. Use another address.");
    setReaders(current => [...current, { name, email, productUpdates }]);
  }
  return <section style={sceneStyle} aria-label="Buenos Aires edition reader register">
    <p style={noteStyle}>Buenos Aires · Folio21 edition notes.</p>
    <SignupForm onSubmit={keepReader}/>
    <p role="status" style={noteStyle}>{readers.length ? `${readers.length} reader ${readers.length === 1 ? "entry" : "entries"} in this page's register.` : "The local reader register is empty."}</p>
    {readers.length > 0 && <ul style={listStyle} aria-label="Local edition reader register">{readers.map((reader, index) => <li key={`${index}-${reader.email}`}><strong>{reader.name}</strong> · {reader.email} · Edition notes: {reader.productUpdates ? "included" : "declined"}</li>)}</ul>}
  </section>;
}

/** Returning readers compare a local code or record a chosen method for their entered address. */
export function PrintReaderSignInDemo() {
  const [visits, setVisits] = useState<Array<{ account: SignInAccount; method: SignInMethod }>>([]);
  return <section style={sceneStyle} aria-label="Rosario reading-table visit records">
    <p style={noteStyle}>Rosario · Folio21 reading table.</p>
    <SignIn demoCode="210624" onSignIn={(account, method) => setVisits(current => [...current, { account, method }])}/>
    <p role="status" style={noteStyle}>{visits.length ? `${visits.length} reading-table ${visits.length === 1 ? "visit" : "visits"} recorded locally.` : "No reading-table visits recorded yet."}</p>
    {visits.length > 0 && <ol style={listStyle} aria-label="Local reading-table visits">{visits.map(({ account, method }, index) => <li key={index}>{account.email} · {account.name} · {method}</li>)}</ol>}
  </section>;
}

/** The explicit illustrative reader and visit mode accompany every reading-room method record. */
export function PrintReadingRoomLoginDemo() {
  const id = useId();
  const [records, setRecords] = useState<Array<{ email: string; method: LoginMethod; mode: "sign-in" | "sign-up" }>>([]);
  return <section style={sceneStyle} aria-label="Córdoba reading-room method records">
    <p style={noteStyle}>Córdoba · Folio21 reading room.</p>
    <LoginCentered demoCode="241140" demoEmail="cordoba.reader@folio21.example" onSignIn={(email, method, mode) => setRecords(current => [...current, { email, method, mode }])}/>
    <p role="status" style={noteStyle}>{records.length ? `${records.length} reading-room ${records.length === 1 ? "record" : "records"} kept on this page.` : "No reading-room records yet."}</p>
    {records.length > 0 && <ol style={listStyle} aria-label="Local reading-room records">{records.map(({ email, method, mode }, index) => <li key={index}>{email} · {method} · {mode === "sign-up" ? "New reader" : "Returning reader"}</li>)}</ol>}
    <section id={`${id}-terms`} style={sceneStyle} aria-label="Local reader terms"><h3 style={{ margin: 0, fontSize: "var(--rams-detail-text-base,var(--rams-detail-native-body-size-fallback))", fontWeight: "var(--rams-detail-docs-subheading-weight)" }}>Reader terms</h3><p style={noteStyle}>These records document choices in this local reading-room example. They do not grant edition access or create an account.</p></section>
    <section id={`${id}-privacy`} style={sceneStyle} aria-label="Local reader privacy"><h3 style={{ margin: 0, fontSize: "var(--rams-detail-text-base,var(--rams-detail-native-body-size-fallback))", fontWeight: "var(--rams-detail-docs-subheading-weight)" }}>Reader privacy</h3><p style={noteStyle}>Only the address, chosen method and visit mode appear in the list. Records stay in this page's memory and clear when the scene is unmounted.</p></section>
  </section>;
}
