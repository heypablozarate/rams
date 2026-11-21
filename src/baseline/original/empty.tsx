import { useId, useLayoutEffect, useRef, useState } from "react";
import * as E from "../../primitives/empty";
import * as G from "../../primitives/input-group";
import { Button } from "../../primitives/button";
import { Input } from "../../primitives/input";
import { Textarea } from "../../primitives/textarea";
import { Label } from "../../primitives/label";
import { FieldError } from "../../primitives/field";

const layout = {
  width: "100%",
  maxWidth: "var(--rams-detail-preview-measure-wide)",
  minWidth: 0,
  display: "grid",
  gap: "var(--rams-detail-empty-content-gap)",
} as const;
const summaryStyle = {
  alignItems: "flex-start",
  padding: 0,
  textAlign: "start",
} as const;
const summaryHeaderStyle = { alignItems: "flex-start" } as const;

function TrayGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M3 6h18v14H3zM3 14h5l2 3h4l2-3h5M7 3h10"
        stroke="currentColor"
        style={{ strokeWidth: "var(--rams-detail-empty-icon-stroke)" }}
      />
    </svg>
  );
}
export function EmptyDemo() {
  const id = useId(),
    [editions, setEditions] = useState<string[]>([]),
    [mode, setMode] = useState<"create" | "import" | null>(null),
    [draft, setDraft] = useState(""),
    [error, setError] = useState(""),
    [help, setHelp] = useState(false),
    create = useRef<HTMLButtonElement>(null),
    input = useRef<HTMLInputElement | null>(null),
    textarea = useRef<HTMLTextAreaElement | null>(null),
    pending = useRef<"create" | "input" | null>(null);
  useLayoutEffect(() => {
    if (pending.current === "create")
      create.current?.focus();
    if (pending.current === "input")
      (mode === "import" ? textarea.current : input.current)?.focus();
    pending.current = null;
  }, [mode, editions]);
  function begin(next: "create" | "import") {
    setError("");
    if (mode === next) {
      (next === "import" ? textarea.current : input.current)?.focus();
      return;
    }
    pending.current = "input";
    setMode(next);
  }
  function remove(name: string) {
    pending.current = "create";
    setEditions((previous) => previous.filter((value) => value !== name));
  }
  return (
    <section
      aria-label="Proof tray"
      style={layout}
    >
      {editions.length ? (
        <>
          <h3>Proof tray</h3>
          <ul style={{ display: "grid", gap: "var(--rams-detail-preview-element-gap)" }}>
            {editions.map((name) => (
              <li
                key={name}
                style={{
                  display: "flex",
                  gap: "var(--rams-detail-preview-element-gap)",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ minWidth: 0, maxWidth: "100%", overflowWrap: "anywhere" }}>{name}</span>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label={"Remove " + name}
                  onClick={() => remove(name)}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <E.Empty style={summaryStyle}>
          <E.EmptyHeader style={summaryHeaderStyle}>
            <E.EmptyMedia variant="icon">
              <TrayGlyph />
            </E.EmptyMedia>
            <E.EmptyTitle asChild>
              <h3>No proofs in the tray</h3>
            </E.EmptyTitle>
            <E.EmptyDescription>
              Create an edition or import a print register.
            </E.EmptyDescription>
          </E.EmptyHeader>
        </E.Empty>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--rams-detail-preview-element-gap)" }}>
        <Button ref={create} variant={mode ? "outline" : "default"} onClick={() => begin("create")}>
          Create edition
        </Button>
        <Button variant="outline" onClick={() => begin("import")}>
          Import editions
        </Button>
      </div>
      {mode && (
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            const names = (mode === "import" ? draft.split(/[\n,]+/) : [draft])
              .map((name) => name.trim())
              .filter(Boolean);
            if (!names.length || names.some((name) => name.length > 60)) {
              setError("Use edition names from 1 to 60 characters.");
              (mode === "import" ? textarea.current : input.current)?.focus();
              return;
            }
            pending.current = "create";
            setEditions((previous) => [...new Set([...previous, ...names])]);
            setMode(null);
            setDraft("");
            setError("");
          }}
          style={{ display: "grid", gap: "var(--rams-detail-preview-element-gap)" }}
        >
          <Label htmlFor={id}>
            {mode === "import" ? "Edition names" : "Edition name"}
          </Label>
          {mode === "import" ? (
            <Textarea
              ref={textarea}
              id={id}
              maxLength={1200}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              aria-invalid={!!error || undefined}
              aria-describedby={
                id + "-help" + (error ? " " + id + "-error" : "")
              }
            />
          ) : (
            <Input
              ref={input}
              id={id}
              maxLength={60}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              aria-invalid={!!error || undefined}
              aria-describedby={error ? id + "-error" : undefined}
            />
          )}
          {mode === "import" && (
            <p id={id + "-help"}>Separate names with commas or line breaks.</p>
          )}
          {error && <FieldError id={id + "-error"}>{error}</FieldError>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--rams-detail-preview-element-gap)" }}>
            <Button type="submit">
              {mode === "import" ? "Import register" : "Keep edition"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                pending.current = "create";
                setMode(null);
                setError("");
                setDraft("");
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
      <Button
        variant="link"
        style={{ justifySelf: "start" }}
        aria-expanded={help}
        aria-controls={id + "-rules"}
        onClick={() => setHelp((value) => !value)}
      >
        Register format
      </Button>
      {help && (
        <p id={id + "-rules"}>
          Names have 1–60 characters. Import removes duplicate names; removing
          the final edition restores the empty tray.
        </p>
      )}
    </section>
  );
}
const printRecords = [
  { title: "Barranca / 03", city: "Rosario" },
  { title: "Patio / 07", city: "Paraná" },
  { title: "River grid / 14", city: "La Plata" },
  { title: "Terrace / 12", city: "Mendoza" },
  { title: "Trama / 16", city: "Santa Fe" },
];
export function EmptyInputGroup() {
  const id = useId(),
    [query, setQuery] = useState("Cauce / 99"),
    [help, setHelp] = useState(false),
    input = useRef<HTMLInputElement>(null),
    matches = printRecords.filter((record) =>
      (record.title + " " + record.city)
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    );
  return (
    <section
      aria-label="Print archive search"
      style={layout}
    >
      <Label htmlFor={id}>Find an edition</Label>
      <G.InputGroup>
        <G.InputGroupInput
          ref={input}
          id={id}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-controls={id + "-results"}
        />
        <G.InputGroupAddon align="inline-end">
          <G.InputGroupButton
            disabled={!query}
            onClick={() => {
              setQuery("");
              input.current?.focus({ preventScroll: true });
            }}
          >
            Clear
          </G.InputGroupButton>
        </G.InputGroupAddon>
      </G.InputGroup>
      <div id={id + "-results"} aria-live="polite">
        {matches.length ? (
          <ul>
            {matches.map((record) => (
              <li key={record.title}>
                {record.title} · {record.city}
              </li>
            ))}
          </ul>
        ) : (
          <E.Empty style={summaryStyle}>
            <E.EmptyHeader style={summaryHeaderStyle}>
              <E.EmptyMedia variant="icon">
                <TrayGlyph />
              </E.EmptyMedia>
              <E.EmptyTitle asChild>
                <h3>No matching editions</h3>
              </E.EmptyTitle>
              <E.EmptyDescription>
                Try an edition title or print-room city.
              </E.EmptyDescription>
            </E.EmptyHeader>
          </E.Empty>
        )}
      </div>
      <Button
        variant="link"
        style={{ justifySelf: "start" }}
        aria-expanded={help}
        aria-controls={id + "-help"}
        onClick={() => setHelp((value) => !value)}
      >
        Search fields
      </Button>
      {help && (
        <p id={id + "-help"}>
          Search matches edition titles and cities, without case sensitivity.
        </p>
      )}
    </section>
  );
}
