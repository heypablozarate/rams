"use client";
import { useId, useRef, useState } from "react";
import { Button } from "../components/button";
import { Label } from "../components/label";
import { Slider } from "../components/slider";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../components/input-otp";
import "./trim-setup.css";
export function TrimSetup() {
  const id = useId(),
    input = useRef<HTMLInputElement>(null);
  const [width, setWidth] = useState([35]),
    [margins, setMargins] = useState([8, 82]),
    [code, setCode] = useState(""),
    [applied, setApplied] = useState(""),
    [invalid, setInvalid] = useState(false);
  const codeError = "Enter six letters or digits.";
  function changeCode(value: string) {
    setCode(value);
    setInvalid(false);
    input.current?.setCustomValidity(
      value.length > 0 && value.length !== 6 ? codeError : "",
    );
  }
  return (
    <main className="trim-setup">
      <header>
        <p>Sur Print Archive · Production desk</p>
        <h1 className="rams-editorial-title">Room for the printed edge.</h1>
      </header>
      <section aria-labelledby={id + "-dimensions"}>
        <h2 id={id + "-dimensions"}>Sheet dimensions</h2>
        <p id={id + "-width"}>Print width</p>
        <Slider
          aria-labelledby={id + "-width"}
          aria-valuetext={width[0] + " centimeters"}
          min={20}
          max={60}
          value={width}
          onValueChange={setWidth}
        />
        <output aria-label="Print width value">{width[0]} cm</output>
        <p id={id + "-margins"}>Crop window (%)</p>
        <Slider
          aria-labelledby={id + "-margins"}
          thumbLabels={["Left crop edge", "Right crop edge"]}
          min={0}
          max={100}
          minStepsBetweenThumbs={1}
          value={margins}
          onValueChange={setMargins}
        />
        <output aria-label="Trim margin values">
          {margins[0]}–{margins[1]}%
        </output>
        <figure className="trim-setup-diagram">
          <svg viewBox="0 0 600 180" aria-hidden="true">
            <rect
              y="10"
              width={(width[0] / 60) * 600}
              height="160"
              fill="var(--rams-subtle)"
            />
            <rect
              x={((width[0] / 60) * 600 * margins[0]) / 100}
              y="30"
              width={((width[0] / 60) * 600 * (margins[1] - margins[0])) / 100}
              height="120"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          <figcaption>
            Print width {width[0]} cm · Crop {margins[0]}–{margins[1]}%
          </figcaption>
        </figure>
      </section>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (code.length !== 6) {
            setInvalid(true);
            input.current?.setCustomValidity(codeError);
            input.current?.reportValidity();
            input.current?.focus();
            return;
          }
          setInvalid(false);
          setApplied(code);
        }}
      >
        <Label htmlFor={id + "-code"}>Edition code</Label>
        <p id={id + "-code-help"}>
          Six letters or digits identify the production proof.
        </p>
        <InputOTP
          id={id + "-code"}
          ref={input}
          aria-describedby={[
            id + "-code-help",
            invalid ? id + "-code-error" : null,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-invalid={invalid || undefined}
          onInvalid={() => setInvalid(true)}
          maxLength={6}
          minLength={6}
          required
          pattern="^[a-zA-Z0-9]+$"
          value={code}
          onValueChange={changeCode}
        >
          <InputOTPGroup>
            {Array.from({ length: 6 }, (_, i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
        </InputOTP>
        {invalid && (
          <p id={id + "-code-error"} role="alert">
            {codeError}
          </p>
        )}
        <div className="trim-setup-actions">
          <Button type="submit">Apply edition code</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              changeCode("");
              input.current?.focus();
            }}
          >
            Clear draft
          </Button>
        </div>
        <output aria-live="polite">
          {applied ? "Applied edition code: " + applied : ""}
        </output>
      </form>
    </main>
  );
}
