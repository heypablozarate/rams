import { Badge } from "../../primitives/badge";
export function BadgeDemo() {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "var(--rams-detail-space-3)",
      }}
    >
      <Badge>Trama collection</Badge>
      <Badge variant="secondary">In review</Badge>
      <Badge variant="outline">Filed</Badge>
      <Badge variant="destructive">Needs a new plate</Badge>
    </div>
  );
}
export function BadgeSecondary() {
  return <Badge variant="secondary">Paper selected</Badge>;
}
export function BadgeOutline() {
  return <Badge variant="outline">Edition / 14</Badge>;
}
export function BadgeDestructive() {
  return <Badge variant="destructive">Registration missing</Badge>;
}
