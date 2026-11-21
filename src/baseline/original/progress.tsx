import { useId, useState } from "react";
import { Progress } from "../../primitives/progress";
import { Checkbox } from "../../primitives/checkbox";
import { Label } from "../../primitives/label";
export function ProgressDemo() {
  const id = useId(),
    [checks, setChecks] = useState([true, false, false]),
    done = checks.filter(Boolean).length;
  return (
    <div
      style={{
        display: "grid",
        width: "100%",
        maxWidth: "var(--rams-detail-preview-measure)",
        gap: "var(--rams-detail-space-4)",
      }}
    >
      <Progress aria-label="Proof checks complete" value={(done / 3) * 100} />
      <p>{done} of 3 proof checks complete</p>
      {[
        "Paper grain confirmed",
        "Registration aligned",
        "Trim marks checked",
      ].map((text, index) => (
        <div
          key={text}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--rams-detail-space-3)",
          }}
        >
          <Checkbox
            id={id + "-" + index}
            checked={checks[index]}
            onCheckedChange={(value) =>
              setChecks((current) =>
                current.map((checked, i) =>
                  i === index ? value === true : checked,
                ),
              )
            }
          />
          <Label htmlFor={id + "-" + index}>{text}</Label>
        </div>
      ))}
    </div>
  );
}
