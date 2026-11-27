import { Check, Copy } from "lucide-react";
import { Button } from "../primitives/button";
import { copyRecovery, useClipboardCopy } from "./useClipboardCopy";

export function CodeBlock({
  code,
  label = "Usage code",
}: {
  code: string;
  label?: string;
}) {
  const { copy, status } = useClipboardCopy(code);
  return (
    <div className="code-block">
      <div className="code-block-toolbar">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Copy ${label}`}
          onClick={copy}
        >
          {status === "copied" ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        </Button>
      </div>
      <p role="status" className={status === "error" ? "px-4 pt-3 text-sm text-foreground" : "sr-only"}>
        {status === "copied" ? "Code copied" : status === "error" ? copyRecovery : ""}
      </p>
      <pre
        role="region"
        tabIndex={0}
        aria-label={label}
        className="code-block-source"
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}
