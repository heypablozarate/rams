import { useEffect, useId, useState } from "react";
import * as G from "../../primitives/input-group";
import * as M from "../../primitives/dropdown-menu";
import { Label } from "../../primitives/label";
import { Spinner } from "../../primitives/spinner";
import { FieldError } from "../../primitives/field";
const prints = [
  "Barranca / 03",
  "Patio / 07",
  "River grid / 14",
  "Terrace / 12",
];
const previewLayout = {
  inlineSize: "100%",
  maxInlineSize: "var(--rams-detail-preview-measure-wide)",
  display: "grid",
  gap: "var(--rams-detail-preview-element-gap)",
} as const;
function SearchGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      style={{ strokeWidth: "var(--rams-detail-field-search-glyph-stroke)" }}
    >
      <circle cx="10" cy="10" r="6" />
      <path d="m14.5 14.5 5 5" />
    </svg>
  );
}
export function InputGroupDemo() {
  const id = useId(),
    [query, setQuery] = useState("");
  const matches = prints.filter((title) =>
    title.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div style={previewLayout}>
      <Label htmlFor={id}>Find a print</Label>
      <G.InputGroup>
        <G.InputGroupInput
          id={id}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-controls={id + "-results"}
        />
        <G.InputGroupAddon>
          <SearchGlyph />
        </G.InputGroupAddon>
        <G.InputGroupAddon align="inline-end">
          <G.InputGroupText>
            {matches.length} / {prints.length}
          </G.InputGroupText>
        </G.InputGroupAddon>
      </G.InputGroup>
      <section
        id={id + "-results"}
        aria-label="Matching prints"
        aria-live="polite"
      >
        {matches.length ? (
          <ul>
            {matches.map((title) => (
              <li key={title}>{title}</li>
            ))}
          </ul>
        ) : (
          <p>No matching prints.</p>
        )}
      </section>
    </div>
  );
}
export function InputGroupDropdown() {
  const id = useId(),
    [quantity, setQuantity] = useState("12"),
    [unit, setUnit] = useState("sheets");
  const value = Number(quantity),
    invalid =
      quantity !== "" &&
      (!Number.isInteger(value) || value < 1 || value > 9999),
    total = unit === "sections" ? value * 4 : value;
  return (
    <div style={previewLayout}>
      <Label htmlFor={id}>Print quantity</Label>
      <G.InputGroup>
        <G.InputGroupInput
          id={id}
          type="number"
          min={1}
          max={9999}
          step={1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          aria-invalid={invalid || undefined}
          aria-describedby={id + "-help" + (invalid ? " " + id + "-error" : "")}
        />
        <G.InputGroupAddon align="inline-end">
          <M.DropdownMenu>
            <M.DropdownMenuTrigger asChild>
              <G.InputGroupButton>
                {unit === "sheets" ? "Sheets" : "Sections"}
              </G.InputGroupButton>
            </M.DropdownMenuTrigger>
            <M.DropdownMenuContent>
              <M.DropdownMenuRadioGroup
                value={unit}
                onValueChange={setUnit}
                aria-label="Count unit"
              >
                <M.DropdownMenuRadioItem value="sheets">
                  Individual sheets
                </M.DropdownMenuRadioItem>
                <M.DropdownMenuRadioItem value="sections">
                  Four-sheet sections
                </M.DropdownMenuRadioItem>
              </M.DropdownMenuRadioGroup>
            </M.DropdownMenuContent>
          </M.DropdownMenu>
        </G.InputGroupAddon>
      </G.InputGroup>
      <p id={id + "-help"}>Each section contains four sheets.</p>
      {invalid ? (
        <FieldError id={id + "-error"}>
          Use a whole number from 1 to 9,999.
        </FieldError>
      ) : (
        quantity !== "" && (
          <output htmlFor={id} aria-label="Paper total">
            {total} sheets for this edition.
          </output>
        )
      )}
    </div>
  );
}
export function InputGroupSpinner() {
  const id = useId(),
    [query, setQuery] = useState(""),
    [pending, setPending] = useState(false),
    [matches, setMatches] = useState(prints);
  useEffect(() => {
    if (!query.trim()) {
      setMatches(prints);
      setPending(false);
      return;
    }
    setPending(true);
    const task = window.setTimeout(() => {
      setMatches(
        prints.filter((title) =>
          title.toLowerCase().includes(query.toLowerCase()),
        ),
      );
      setPending(false);
    }, 350);
    return () => window.clearTimeout(task);
  }, [query]);
  return (
    <div style={previewLayout}>
      <Label htmlFor={id}>Search the print archive</Label>
      <G.InputGroup>
        <G.InputGroupInput
          id={id}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-controls={id + "-results"}
        />
        <G.InputGroupAddon>
          <SearchGlyph />
        </G.InputGroupAddon>
        {pending && (
          <G.InputGroupAddon align="inline-end">
            <Spinner aria-label="Searching the archive" />
          </G.InputGroupAddon>
        )}
      </G.InputGroup>
      <section
        id={id + "-results"}
        aria-label="Archive results"
        aria-live="polite"
        aria-busy={pending}
      >
        {matches.length ? (
          <ul>
            {matches.map((title) => (
              <li key={title}>{title}</li>
            ))}
          </ul>
        ) : (
          <p>No matching prints.</p>
        )}
      </section>
    </div>
  );
}
