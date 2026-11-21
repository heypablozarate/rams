import { Separator } from "../../primitives/separator";
export function SeparatorDemo() {
  return (
    <section
      style={{
        display: "grid",
        width: "100%",
        maxWidth: "var(--rams-detail-preview-measure)",
        gap: "var(--rams-detail-space-4)",
      }}
    >
      <div>
        <h3 style={{ fontWeight: "var(--type-title-weight)" }}>Patio / 07</h3>
        <p
          style={{ color: "var(--muted-foreground, var(--rams-muted))" }}
        >
          Letterpress on uncoated paper.
        </p>
      </div>
      <Separator decorative={false} aria-label="Edition details" />
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "stretch",
          gap: "var(--rams-detail-space-4)",
        }}
      >
        <span>60 copies</span>
        <Separator orientation="vertical" />
        <span>24 × 32 cm</span>
        <Separator orientation="vertical" />
        <span>Two inks</span>
      </div>
    </section>
  );
}
