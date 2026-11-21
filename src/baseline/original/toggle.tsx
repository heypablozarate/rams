import { useState } from "react";
import { Toggle, type ToggleVariant } from "../../primitives/toggle";

function TitleSetting({
  variant = "default",
  disabled = false,
}: {
  variant?: ToggleVariant;
  disabled?: boolean;
}) {
  const [italic, setItalic] = useState(false);
  return (
    <div
      style={{
        display: "grid",
        gap: "var(--rams-detail-space-5)",
        inlineSize: "100%",
        maxInlineSize: "var(--rams-detail-preview-measure)",
      }}
    >
      <Toggle
        variant={variant}
        disabled={disabled}
        pressed={italic}
        onPressedChange={setItalic}
        aria-label="Italic title"
      >
        <span aria-hidden="true" className="rams-interface-italic">
          I
        </span>
        <span>Italic title</span>
      </Toggle>
      <p
        className={italic ? "rams-interface-italic" : undefined}
        style={{
          margin: 0,
          fontSize: "var(--type-title-size)",
          lineHeight: "var(--type-title-leading)",
          overflowWrap: "anywhere",
        }}
      >
        Barranca / A folded afternoon
      </p>
    </div>
  );
}
export function ToggleDemo() {
  return <TitleSetting />;
}
export function ToggleOutline() {
  return <TitleSetting variant="outline" />;
}
export function ToggleDisabled() {
  return <TitleSetting disabled />;
}
