import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "../primitives/button";

export function CodeBlock({
  code,
  label = "Usage code",
}: {
  code: string;
  label?: string;
}) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  useEffect(() => {
    setState("idle");
  }, [code]);
  useEffect(() => {
    if (state === "idle") return;
    const timer = window.setTimeout(() => setState("idle"), 2500);
    return () => window.clearTimeout(timer);
  }, [state]);
  return (
    <div className="code-block">
      <div className="code-block-toolbar">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={state === "copied" ? "Code copied" : "Copy code"}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setState("copied");
            } catch {
              setState("error");
            }
          }}
        >
          {state === "copied" ? <Check /> : <Copy />}
        </Button>
      </div>
      <pre
        role="region"
        tabIndex={0}
        aria-label={label}
        className="code-block-source"
      >
        <code>{code}</code>
      </pre>
      <span className="sr-only" role="status">
        {state === "copied"
          ? "Code copied"
          : state === "error"
            ? "Could not copy. Select the code to copy it."
            : ""}
      </span>
    </div>
  );
}
