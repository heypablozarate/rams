import { Spinner } from "../../primitives/spinner";
import { Button } from "../../primitives/button";
export function SpinnerDemo() {
  return <Spinner aria-label="Preparing the plate preview" />;
}
export function SpinnerSize() {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "var(--rams-detail-space-5)",
      }}
    >
      <Spinner aria-label="Preparing thumbnail" style={{ fontSize: "var(--rams-detail-preview-spinner-size-small)" }} />
      <Spinner
        aria-label="Preparing print preview"
        style={{ fontSize: "var(--rams-detail-preview-spinner-size-medium)" }}
      />
      <Spinner
        aria-label="Preparing full-size plate"
        style={{ fontSize: "var(--rams-detail-preview-spinner-size-large)" }}
      />
    </div>
  );
}
export function SpinnerButton() {
  return (
    <Button disabled aria-busy="true">
      <Spinner aria-hidden="true" />
      Preparing paper notes
    </Button>
  );
}
