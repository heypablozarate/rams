import { printPreviewGeometry } from "./print-preview-geometry";

/** One story teased in an issue. `image` is a small square-cropped thumbnail. */
export interface NewsletterStory {
  title: string;
  image: string;
  minutes: number;
}

/** One issue of the newsletter, as it appears on the stack. */
export interface NewsletterIssue {
  number: number;
  /** Send date as it should read, such as "Friday, September 25". */
  date: string;
  subject: string;
  /** Up to three stories. */
  stories: NewsletterStory[];
}

/** The publication shown beside the form: the next issue lands on the stack of recent ones when someone subscribes. */
export interface NewsletterPublication {
  name: string;
  /** The next issue. It is addressed to the new reader and joins the front of the stack on success. */
  upcoming: NewsletterIssue;
  /** Recent issues, newest first. The first three make the stack. */
  recent: NewsletterIssue[];
}

const thumbnail = (pattern: "fold" | "type" | "marks") => {
  const { ink, paper, ruleStrokeWidth, typeStrokeWidth } = printPreviewGeometry.encodedArtwork.newsletterCover;
  const art = pattern === "fold"
    ? '<rect x="12" y="12" width="96" height="68" fill="none"/><path d="M60 12v68M18 68h25M18 61h38M68 29h32M68 38h26M68 47h30"/>'
    : pattern === "type"
      ? `<rect x="12" y="12" width="96" height="68" fill="none"/><path d="M22 30h42M22 39h66M22 48h58M22 57h47M22 66h35" stroke-width="${typeStrokeWidth}"/>`
      : '<rect x="12" y="12" width="96" height="68" fill="none"/><path d="M60 25v42M39 46h42M52 38l8 8 8-8M52 54l8-8 8 8"/><circle cx="60" cy="46" r="5" fill="none"/>';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 92"><rect width="120" height="92" fill="${paper}"/><g fill="${ink}" stroke="${ink}" stroke-width="${ruleStrokeWidth}">${art}</g></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

export const newsletterPublication: NewsletterPublication = {
  name: "Folio 21 · Print notes",
  upcoming: {
    number: 24,
    date: "Friday, November 13",
    subject: "A booklet from fold to trim",
    stories: [
      { title: "Mapping an eight-page signature", image: thumbnail("fold"), minutes: 4 },
      { title: "Setting a calm colophon", image: thumbnail("type"), minutes: 3 },
      { title: "Reading registration marks", image: thumbnail("marks"), minutes: 5 },
    ],
  },
  recent: [
    {
      number: 23,
      date: "Friday, November 6",
      subject: "Three ways to check a fold",
      stories: [
        { title: "Page order on a flat sheet", image: thumbnail("fold"), minutes: 4 },
        { title: "Margins around a title", image: thumbnail("type"), minutes: 3 },
        { title: "A simple plate cross", image: thumbnail("marks"), minutes: 4 },
      ],
    },
    {
      number: 22,
      date: "Friday, October 30",
      subject: "Small details in proof review",
      stories: [
        { title: "One column, two measures", image: thumbnail("type"), minutes: 5 },
        { title: "Trim allowance notes", image: thumbnail("marks"), minutes: 3 },
        { title: "The signature in sequence", image: thumbnail("fold"), minutes: 4 },
      ],
    },
    {
      number: 21,
      date: "Friday, October 23",
      subject: "Paper, ink, and the page edge",
      stories: [
        { title: "A folded paper study", image: thumbnail("fold"), minutes: 4 },
        { title: "Setting a short note", image: thumbnail("type"), minutes: 3 },
        { title: "Aligning two plates", image: thumbnail("marks"), minutes: 5 },
      ],
    },
  ],
};

export const newsletterCopy = {
  inline: { title: "Print notes from Folio 21", description: "Folds, page order, paper, and proof marks from a small Buenos Aires edition." },
  card: { title: "A letter from the print desk", description: "Keep an address beside the next issue of these sample print notes." },
  privacy: "This preview keeps the address locally; it does not send mail.",
  privacyLink: null,
};
export const newsletterReaders = null;
