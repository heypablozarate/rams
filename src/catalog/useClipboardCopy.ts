import { useEffect, useLayoutEffect, useRef, useState } from "react";

type CopyStatus = "copied" | "error";

export const copyRecovery = "Could not copy. Select the code below and copy it manually.";

export function useClipboardCopy(value: string, source = value) {
  const request = useRef(0);
  const [result, setResult] = useState<{ value: string; source: string; status: CopyStatus } | null>(null);
  const status = result?.value === value && result.source === source ? result.status : "idle";

  useLayoutEffect(() => () => {
    request.current += 1;
  }, [source, value]);

  useEffect(() => {
    if (status !== "copied") return;
    const timer = window.setTimeout(() => setResult(null), 2500);
    return () => window.clearTimeout(timer);
  }, [result, status]);

  async function copy() {
    const attempt = ++request.current;
    setResult(null);
    let outcome: CopyStatus = "copied";
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      outcome = "error";
    }
    if (attempt === request.current) setResult({ value, source, status: outcome });
  }

  return { copy, status };
}
