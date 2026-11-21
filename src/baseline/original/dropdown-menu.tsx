import { useState } from "react";
import { Button } from "../../primitives/button";
import * as Menu from "../../primitives/dropdown-menu";
export function DropdownMenuDemo() {
  const [edition, setEdition] = useState(12);
  function exportRecord() {
    const url = URL.createObjectURL(
      new Blob(
        [
          JSON.stringify(
            { title: "Terrace study", edition, city: "Rosario" },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      ),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "terrace-edition.json";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div style={{ display: "grid", gap: "var(--rams-detail-docs-space-standard)" }}>
      <p>
        Terrace study / Edition <span >{edition}</span>
      </p>
      <Menu.DropdownMenu>
        <Menu.DropdownMenuTrigger asChild>
          <Button variant="outline">Edition actions</Button>
        </Menu.DropdownMenuTrigger>
        <Menu.DropdownMenuContent>
          <Menu.DropdownMenuItem
            onSelect={() => setEdition((value) => value + 1)}
          >
            Duplicate as next edition
          </Menu.DropdownMenuItem>
          <Menu.DropdownMenuItem onSelect={exportRecord}>
            Export edition JSON
          </Menu.DropdownMenuItem>
          <Menu.DropdownMenuSeparator />
          <Menu.DropdownMenuItem
            onSelect={() => setEdition(12)}
            disabled={edition === 12}
          >
            Return to edition 12
          </Menu.DropdownMenuItem>
        </Menu.DropdownMenuContent>
      </Menu.DropdownMenu>
    </div>
  );
}
export function DropdownMenuCheckboxes() {
  const [trim, setTrim] = useState(true),
    [grain, setGrain] = useState(false);
  return (
    <div
      style={{ display: "grid", gap: "var(--rams-detail-docs-space-standard)", width: "100%", maxWidth: "var(--rams-detail-preview-measure-narrow)" }}
    >
      <svg
        role="img"
        aria-label="Print sheet with selected production marks"
        viewBox="0 0 240 100"
        style={{ width: "100%", height: "auto" }}
      >
        <rect
          x="15"
          y="15"
          width="210"
          height="70"
          fill="var(--muted,var(--rams-subtle,var(--rams-detail-native-muted-fill-fallback)))"
        />
        {trim && (
          <path
            data-edition-mark="trim"
            d="M5 15h8M15 5v8m210-8v8m2 2h8M5 85h8m2 2v8m210-8v8m2-10h8"
            stroke="currentColor"
          />
        )}
        {grain && (
          <path
            data-edition-mark="grain"
            d="M120 75V25m-8 12 8-12 8 12"
            fill="none"
            stroke="currentColor"
          />
        )}
      </svg>
      <Menu.DropdownMenu>
        <Menu.DropdownMenuTrigger asChild>
          <Button variant="outline">Production marks</Button>
        </Menu.DropdownMenuTrigger>
        <Menu.DropdownMenuContent>
          <Menu.DropdownMenuCheckboxItem
            checked={trim}
            onCheckedChange={(value) => setTrim(value === true)}
          >
            Trim corners
          </Menu.DropdownMenuCheckboxItem>
          <Menu.DropdownMenuCheckboxItem
            checked={grain}
            onCheckedChange={(value) => setGrain(value === true)}
          >
            Grain arrow
          </Menu.DropdownMenuCheckboxItem>
        </Menu.DropdownMenuContent>
      </Menu.DropdownMenu>
    </div>
  );
}
export function DropdownMenuRadioGroup() {
  const [pass, setPass] = useState("grid");
  return (
    <div style={{ display: "grid", gap: "var(--rams-detail-docs-space-standard)" }}>
      <p>
        Next press pass:{" "}
        {pass === "grid"
          ? "Grid"
          : pass === "terrace"
            ? "Terrace silhouette"
            : "Colophon"}
      </p>
      <Menu.DropdownMenu>
        <Menu.DropdownMenuTrigger asChild>
          <Button variant="outline">Choose press pass</Button>
        </Menu.DropdownMenuTrigger>
        <Menu.DropdownMenuContent>
          <Menu.DropdownMenuRadioGroup
            value={pass}
            onValueChange={setPass}
            aria-label="Next press pass"
          >
            <Menu.DropdownMenuRadioItem value="grid">
              Grid
            </Menu.DropdownMenuRadioItem>
            <Menu.DropdownMenuRadioItem value="terrace">
              Terrace silhouette
            </Menu.DropdownMenuRadioItem>
            <Menu.DropdownMenuRadioItem value="colophon">
              Colophon
            </Menu.DropdownMenuRadioItem>
          </Menu.DropdownMenuRadioGroup>
        </Menu.DropdownMenuContent>
      </Menu.DropdownMenu>
    </div>
  );
}
