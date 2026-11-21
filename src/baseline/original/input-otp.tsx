import { useId, useRef, useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../../primitives/input-otp";
import { Label } from "../../primitives/label";
import { Button } from "../../primitives/button";
function ReferenceSlots() {
  return (
    <InputOTPGroup>
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <InputOTPSlot key={index} index={index} />
      ))}
    </InputOTPGroup>
  );
}
const layout = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  gap: "var(--rams-detail-preview-content-inset)",
  inlineSize: "100%",
  maxInlineSize: "var(--rams-detail-preview-measure-wide)",
} as const;
export function InputOTPDefaultPreview() {
  const id = useId();
  return (
    <section style={layout} aria-label="Grouped proof reference">
      <Label htmlFor={id}>Proof reference</Label>
      <InputOTP
        id={id}
        maxLength={6}
        inputMode="text"
        aria-describedby={id + "-help"}
      >
        <InputOTPGroup>
          {[0, 1, 2].map((index) => (
            <InputOTPSlot key={index} index={index} />
          ))}
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          {[3, 4, 5].map((index) => (
            <InputOTPSlot key={index} index={index} />
          ))}
        </InputOTPGroup>
      </InputOTP>
      <p id={id + "-help"}>Six characters, arranged in two groups of three.</p>
    </section>
  );
}
export function InputOTPControlledPreview() {
  const id = useId(),
    [reference, setReference] = useState(""),
    input = useRef<HTMLInputElement>(null);
  return (
    <section style={layout} aria-label="Controlled print reference">
      <Label htmlFor={id}>Print reference</Label>
      <InputOTP
        ref={input}
        id={id}
        maxLength={6}
        inputMode="text"
        value={reference}
        onValueChange={setReference}
        aria-describedby={id + "-help"}
      >
        <ReferenceSlots />
      </InputOTP>
      <p id={id + "-help"}>Letters, digits and punctuation are accepted.</p>
      <p role="status">
        Reference: <span>{reference || "—"}</span>
      </p>
      <Button
        variant="outline"
        disabled={!reference}
        onClick={() => {
          input.current?.focus({ preventScroll: true });
          setReference("");
        }}
      >
        Clear reference
      </Button>
    </section>
  );
}
export function InputOTPPatternPreview() {
  const id = useId();
  return (
    <section style={layout} aria-label="Alphanumeric edition reference">
      <Label htmlFor={id}>Edition reference</Label>
      <InputOTP
        id={id}
        maxLength={6}
        inputMode="text"
        pattern="^[a-zA-Z0-9]+$"
        aria-describedby={id + "-help"}
      >
        <ReferenceSlots />
      </InputOTP>
      <p id={id + "-help"}>
        Six ASCII letters or digits. Punctuation is rejected.
      </p>
    </section>
  );
}
