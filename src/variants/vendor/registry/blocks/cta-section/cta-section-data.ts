export interface CtaAction {
  label: string;
  href?: string;
  onClick?: () => void;
  /** With no href/callback, toggles a local reviewed state. */
  confirmedLabel?: string;
}

const primary: CtaAction = { label: "Mark proof reviewed", confirmedLabel: "Proof reviewed" };
const secondary: CtaAction = { label: "Mark paper checked", confirmedLabel: "Paper checked" };
export const ctaCopy = {
  centered: { title: "One more look before the fold", description: "Check the cover plate against the trim marks, then keep the proof beside the paper dummy.", primary, secondary, note: "Folio 21 · a 24-page print study" },
  split: { title: "Keep the next proof with the edition", description: "Three eight-page signatures, two paper stocks, and one cover rule to align.", primary, secondary, points: ["100 gsm text stock", "220 gsm cover stock", "Cover rule 5 mm inside trim"] },
  banner: { title: "A proof worth keeping", description: "Review the cover plate before the next fold.", primary },
};
export const ctaFaces: string[] = [];
export const ctaSetup = { title: "Folio 21 · proof worksheet", facts: ["24 text pages · 3 × 8 signatures", "140 sample copies", "Black text · oxide-red cover rule"] };
