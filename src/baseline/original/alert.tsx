import { Alert, AlertTitle, AlertDescription } from "../../primitives/alert";
import { CircleCheck, Info, CircleAlert } from "rams-icons";
export function AlertDemo() {
  return (
    <div
      style={{
        display: "grid",
        width: "100%",
        maxWidth: "var(--rams-detail-preview-measure-extra-wide)",
        gap: "var(--rams-detail-space-4)",
      }}
    >
      <Alert role="status">
        <CircleCheck aria-hidden="true" />
        <AlertTitle>Registration checked</AlertTitle>
        <AlertDescription>
          The two plates align on the terrace proof.
        </AlertDescription>
      </Alert>
      <Alert role="status">
        <Info aria-hidden="true" />
        <AlertTitle>Binding notes added</AlertTitle>
      </Alert>
    </div>
  );
}
export function AlertDestructive() {
  return (
    <Alert variant="destructive">
      <CircleAlert aria-hidden="true" />
      <AlertTitle>Paper specification missing</AlertTitle>
      <AlertDescription>
        Add the stock and weight before sending this edition to the bindery.
      </AlertDescription>
    </Alert>
  );
}
