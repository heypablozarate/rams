"use client";

import { useId, useState } from "react";
import type { CSSProperties } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/primitives/select";
import { ContactSection } from "@/variants/vendor/registry/blocks/contact-section/contact-section";
import type { ContactMessage, ContactSectionVariant } from "@/variants/vendor/registry/blocks/contact-section/contact-section";
import { NewsletterSignup } from "@/variants/vendor/registry/blocks/newsletter-signup/newsletter-signup";
import type { NewsletterVariant } from "@/variants/vendor/registry/blocks/newsletter-signup/newsletter-signup";
import { CtaSectionBlock } from "@/variants/vendor/registry/blocks/cta-section/cta-section";

const sceneStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  width: "100%",
  maxWidth: "var(--rams-detail-preview-print-forms-scene-measure)",
  gap: "var(--rams-detail-space-4, calc(var(--rams-detail-preview-space-step-fallback) * 4))",
  marginInline: "auto",
  color: "var(--rams-detail-foreground, currentColor)",
  fontSize: "var(--rams-detail-text-base, var(--rams-detail-native-body-size-fallback))",
  lineHeight: "var(--type-body-leading, var(--rams-detail-native-body-leading-fallback))",
};

const noteStyle: CSSProperties = {
  margin: 0,
  color: "var(--rams-detail-text-secondary, currentColor)",
  fontSize: "var(--rams-detail-text-sm, var(--rams-detail-preview-print-scene-caption-size-fallback))",
  overflowWrap: "anywhere",
};

export function PrintDeskContactFormDemo() {
  const layoutId = useId();
  const [variant, setVariant] = useState<ContactSectionVariant>("form");
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  return (
    <section style={sceneStyle} aria-label="Folio 21 print desk contact form">
      <div style={{ maxWidth: "var(--rams-detail-preview-print-forms-field-measure)" }}><label htmlFor={layoutId}>Contact layout</label><Select value={variant} onValueChange={value => setVariant(value as ContactSectionVariant)}><SelectTrigger id={layoutId}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="form">Form</SelectItem><SelectItem value="channels">Reference desks</SelectItem><SelectItem value="offices">Office clocks</SelectItem></SelectContent></Select></div>
      <ContactSection
        variant={variant}
        topics={["Paper stock", "Proof review", "Workshop timing"]}
        onSubmit={message => setMessages(current => [...current, message])}
      />
      <div style={{ ...sceneStyle, gap: "var(--rams-detail-space-2, calc(var(--rams-detail-preview-space-step-fallback) * 2))" }}>
        <p role="status" aria-live="polite" style={noteStyle}>
          {messages.length === 0 ? "No local notes yet." : `${messages.length} ${messages.length === 1 ? "note" : "notes"} saved in this preview.`}
        </p>
        {messages.length > 0 && <article style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "var(--rams-detail-space-1, var(--rams-detail-preview-space-step-fallback))" }}>
          <strong>{messages[messages.length - 1]!.topic}</strong>
          <p style={{ margin: 0, overflowWrap: "anywhere" }}>{messages[messages.length - 1]!.message}</p>
        </article>}

      </div>
    </section>
  );
}

const activeSceneStyle: CSSProperties = {
  ...sceneStyle,
  gap: "var(--rams-detail-space-4, var(--rams-detail-preview-scene-gap))",
  fontSize: "var(--rams-detail-text-base, var(--rams-detail-native-body-size-fallback))",
  lineHeight: "var(--rams-detail-preview-print-scene-leading)",
};
const activeNoteStyle: CSSProperties = {
  ...noteStyle,
  fontSize: "var(--rams-detail-text-sm, var(--rams-detail-preview-print-scene-caption-size-fallback))",
};

export function Folio21NewsletterSignupDemo() {
  const layoutId = useId();
  const [variant, setVariant] = useState<NewsletterVariant>("inline");
  const [addresses, setAddresses] = useState<string[]>([]);
  return (
    <section style={activeSceneStyle} aria-label="Folio 21 print notes newsletter">
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "var(--rams-detail-space-2, calc(var(--rams-detail-preview-space-step-fallback) * 2))", maxWidth: "var(--rams-detail-preview-print-forms-field-measure)" }}>
        <label htmlFor={layoutId} style={{ fontSize: "var(--rams-detail-text-sm, var(--rams-detail-preview-print-scene-caption-size-fallback))" }}>Newsletter layout</label>
        <Select value={variant} onValueChange={value => setVariant(value as NewsletterVariant)}>
          <SelectTrigger id={layoutId}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="inline">Inline section</SelectItem>
            <SelectItem value="card">Card</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <NewsletterSignup
        variant={variant}
        title="Print notes from Folio 21"
        description="A sample letter about folds, page order, paper, and proof marks."
        placeholder="reader@folio21.example"
        buttonLabel="Keep address"
        privacyNote="Addresses are kept in this page’s local list only."
        privacyLink={null}
        readers={null}
        onSubscribe={email => setAddresses(current => [...current, email])}
      />
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "var(--rams-detail-space-2, calc(var(--rams-detail-preview-space-step-fallback) * 2))" }}>
        <p role="status" aria-live="polite" style={activeNoteStyle}>
          {addresses.length === 0 ? "No addresses in the local list." : `${addresses.length} ${addresses.length === 1 ? "address" : "addresses"} in the local list.`}
        </p>
        {addresses.length > 0 && <ul style={{ margin: 0, paddingInlineStart: "var(--rams-detail-preview-print-forms-list-indent)", overflowWrap: "anywhere" }}>{addresses.map((address, index) => <li key={`${index}-${address}`}>{address}</li>)}</ul>}

      </div>
    </section>
  );
}

export function Folio21CallToActionDemo() {
  const [notes, setNotes] = useState<string[]>([]);
  const addNote = (note: string) => setNotes(current => [...current, note]);
  const primaryAction = { label: "Add proof", onClick: () => addNote("Review the Folio 21 cover plate against the trim marks.") };
  const secondaryAction = { label: "Add paper", onClick: () => addNote("Record the stock choice beside the next proof.") };

  return (
    <section style={activeSceneStyle} aria-label="Folio 21 local call to action">
      <CtaSectionBlock title="Keep the next proof note with the edition" description="Add a note to the Folio 21 worksheet before the next review."
        primaryAction={primaryAction} secondaryAction={secondaryAction} points={["Cover plate check", "Paper stock note", "Trim review"]}
        note="Folio 21 · proof worksheet" faces={[]} />
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "var(--rams-detail-space-2, calc(var(--rams-detail-preview-space-step-fallback) * 2))" }}>
        <p role="status" aria-live="polite" style={activeNoteStyle}>{notes.length === 0 ? "No notes added yet." : `${notes.length} ${notes.length === 1 ? "note" : "notes"} added locally.`}</p>
        {notes.length > 0 && <ol style={{ margin: 0, paddingInlineStart: "var(--rams-detail-preview-print-forms-list-indent)" }}>{notes.map((note, index) => <li key={`${index}-${note}`}>{note}</li>)}</ol>}

      </div>
    </section>
  );
}
