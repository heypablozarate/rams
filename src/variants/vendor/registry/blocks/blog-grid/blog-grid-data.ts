/** Original text-only print ledger sample. */
export type BlogAuthor = { name: string; avatar?: string; role?: string };

export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  /** ISO date, used for sorting and the visible date. */
  date: string;
  /** Minutes to read. */
  readTime: number;
  author: BlogAuthor;
  image?: { src: string; alt: string };
  /** Paragraphs for the in-place reader. Leave out when every post links out through getHref. */
  body?: string[];
  featured?: boolean;
};


export const blogCategories = ["Imposition", "Paper", "Ink", "Proofing", "Edition"];

export const blogPosts: BlogPost[] = [
  {
    id: "folded-structure", featured: true, category: "Imposition", date: "2026-10-29", readTime: 4,
    author: { name: "Archive desk" },
    title: "Three signatures, one compact folio",
    excerpt: "A page-count worksheet for a 24-page folded edition.",
    body: ["Folio 21 uses three 8-page signatures. The count is simple, but the sheet map still needs to show the order each page takes after folding.", "Check the outside and inside forms separately, then compare the folded dummy with the pagination list. A single inverted spread is easier to catch before the cover plates are prepared."],
  },
  {
    id: "uncoated-stock", category: "Paper", date: "2026-10-23", readTime: 3,
    author: { name: "Paper ledger" },
    title: "Reading an uncoated stock note",
    excerpt: "Keep text and cover weights distinct on the worksheet.",
    body: ["The text block lists 100 gsm uncoated stock. The separate cover line lists 220 gsm, so the two values should not be collapsed into one paper entry.", "Mark the stock beside the part of the booklet it belongs to, then verify the finished dummy against those lines."],
  },
  {
    id: "two-plate-cover", category: "Ink", date: "2026-10-17", readTime: 5,
    author: { name: "Plate ledger" },
    title: "A two-plate cover rule",
    excerpt: "Separate black text from the oxide-red cover accent.",
    body: ["The Folio 21 cover has a black text plate and an oxide-red rule plate. The sample uses two plates; the line describing the accent should remain attached to the cover, not the text block.", "Before proofing, compare the plate labels with the cover artwork and confirm the rule remains inside the 5 mm trim allowance."],
  },
  {
    id: "trim-reference", category: "Proofing", date: "2026-10-10", readTime: 4,
    author: { name: "Trim notes" },
    title: "Keep trim references outside the page",
    excerpt: "Crop marks locate the cut; they do not belong in the finished page area.",
    body: ["The sample cover rule sits 5 mm inside the trim line. Crop marks sit beyond the page edge and should remain clear of the artwork.", "Review the cut line and the inner rule as separate references so the printed margin is not mistaken for a crop mark."],
  },
  {
    id: "fold-check", category: "Imposition", date: "2026-10-03", readTime: 3,
    author: { name: "Fold worksheet" },
    title: "Check the folded dummy in sequence",
    excerpt: "Use the actual fold order to verify page progression.",
    body: ["Fold the dummy in the same sequence as the planned signatures. Read the pages in order from the front cover through the center spread and back cover.", "This catches sequence errors in the sample before the final sheet plan is marked complete."],
  },
  {
    id: "run-quantity", category: "Edition", date: "2026-09-26", readTime: 2,
    author: { name: "Edition ledger" },
    title: "Separate sample quantity from a print order",
    excerpt: "The worksheet records 140 copies for this example edition.",
    body: ["The Folio 21 worksheet is sized for 140 sample copies. It records the example quantity only; it is not a purchase or production order.", "Keep the quantity beside the edition identifier when comparing the paper and plate notes."],
  },
  {
    id: "cover-stock", category: "Paper", date: "2026-09-19", readTime: 3,
    author: { name: "Paper ledger" },
    title: "A separate cover-stock line",
    excerpt: "Record the cover weight independently from the text block.",
    body: ["The sample uses 220 gsm uncoated stock for the cover and 100 gsm uncoated stock for the text. Listing both weights makes the difference visible during proof review.", "Check the stock labels on the dummy against the two worksheet lines before discussing the cover rule."],
  },
];
