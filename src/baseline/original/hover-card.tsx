import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "../../primitives/hover-card";

export function HoverCardDemo() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <a
          href="https://pablozarate.com"
          style={{ textDecoration: "underline", textUnderlineOffset: "var(--rams-detail-action-link-underline-offset)" }}
        >
          About the author
        </a>
      </HoverCardTrigger>
      <HoverCardContent>
        <div style={{ display: "grid", gap: "var(--rams-detail-preview-related-copy-gap)" }}>
          <p style={{ fontWeight: "var(--rams-detail-item-title-font-weight)" }}>Pablo Zarate</p>
          <a
            href="https://pablozarate.com"
            style={{ textDecoration: "underline", textUnderlineOffset: "var(--rams-detail-action-link-underline-offset)" }}
          >
            Portfolio and selected projects
          </a>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
