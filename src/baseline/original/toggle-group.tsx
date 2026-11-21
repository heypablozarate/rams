import { useState, type CSSProperties } from "react";
import { AlignCenter, AlignLeft, AlignRight, CaseUpper, Italic, MoveHorizontal } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "../../primitives/toggle-group";

const layout: CSSProperties = {
  display: "grid",
  gap: "var(--rams-detail-space-5)",
  inlineSize: "100%",
  maxInlineSize: "var(--rams-detail-preview-measure-wide)",
};
const title: CSSProperties = {
  margin: 0,
  fontSize: "var(--type-title-size)",
  lineHeight: "var(--type-title-leading)",
  overflowWrap: "anywhere",
};

function TitleTreatments({ disabled = false }: { disabled?: boolean }) {
  const [values, setValues] = useState<string[]>(["uppercase"]);
  return (
    <div style={layout}>
      <ToggleGroup
        type="multiple"
        aria-label="Title treatments"
        value={values}
        onValueChange={setValues}
        disabled={disabled}
        variant="outline"
      >
        <ToggleGroupItem value="italic" aria-label="Italic title"><Italic aria-hidden="true" /></ToggleGroupItem>
        <ToggleGroupItem value="uppercase" aria-label="Uppercase title"><CaseUpper aria-hidden="true" /></ToggleGroupItem>
        <ToggleGroupItem value="tracking" aria-label="Wide title tracking"><MoveHorizontal aria-hidden="true" /></ToggleGroupItem>
      </ToggleGroup>
      <p
        className={values.includes("italic") ? "rams-interface-italic" : undefined}
        style={{
          ...title,
          textTransform: values.includes("uppercase") ? "uppercase" : "none",
          letterSpacing: values.includes("tracking") ? "var(--rams-detail-preview-title-wide-tracking)" : "normal",
        }}
      >
        Pasaje / Window rhythm
      </p>
    </div>
  );
}
export function ToggleGroupDemo() {
  return <TitleTreatments />;
}
export function ToggleGroupDisabled() {
  return <TitleTreatments disabled />;
}
export function ToggleGroupSingle() {
  const [alignment, setAlignment] = useState("start");
  return (
    <div style={layout}>
      <ToggleGroup
        type="single"
        aria-label="Title alignment"
        value={alignment}
        onValueChange={(value) => {
          if (value) setAlignment(value);
        }}
        variant="outline"
      >
        <ToggleGroupItem value="start" aria-label="Align title to start"><AlignLeft aria-hidden="true" /></ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align title to center"><AlignCenter aria-hidden="true" /></ToggleGroupItem>
        <ToggleGroupItem value="end" aria-label="Align title to end"><AlignRight aria-hidden="true" /></ToggleGroupItem>
      </ToggleGroup>
      <p
        style={{
          ...title,
          textAlign: alignment as "start" | "center" | "end",
        }}
      >
        Pasaje / Window rhythm
      </p>
    </div>
  );
}
