import { useId, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../primitives/card";
import { Input } from "../../primitives/input";
import { Textarea } from "../../primitives/textarea";
import { Label } from "../../primitives/label";
import { Button } from "../../primitives/button";
import { Badge } from "../../primitives/badge";
export function CardDemo() {
  const [kept, setKept] = useState(false);
  return (
    <div
      style={{
        display: "grid",
        width: "100%",
        maxWidth: "var(--rams-detail-preview-measure-narrow)",
        gap: "var(--rams-detail-space-4)",
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Passage study / 09</CardTitle>
          <CardDescription>
            Three impressions on warm uncoated stock.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Rosario print room</p>
          <Badge variant="outline">Edition of 60</Badge>
        </CardContent>
        <CardFooter>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", justifyItems: "start", alignItems: "start", minWidth: 0, maxWidth: "100%" }}>
            {["Keep edition", "Remove from shortlist"].map(label => (
              <Button key={label} asChild variant="outline" aria-hidden="true" style={{ gridArea: "1 / 1", visibility: "hidden", pointerEvents: "none" }}>
                <span>{label}</span>
              </Button>
            ))}
            <Button variant="outline" style={{ gridArea: "1 / 1" }} onClick={() => setKept((value) => !value)}>
              {kept ? "Remove from shortlist" : "Keep edition"}
            </Button>
          </div>
        </CardFooter>
      </Card>
      <p role="status" style={{ display: "grid", margin: 0 }}>
        <span aria-hidden="true" style={{ gridArea: "1 / 1", visibility: "hidden" }}>Shortlist: Passage study / 09.</span>
        <span style={{ gridArea: "1 / 1" }}>{kept ? "Shortlist: Passage study / 09." : ""}</span>
      </p>
    </div>
  );
}
export function CardWithForm() {
  const id = useId(),
    [saved, setSaved] = useState<{ title: string; note: string } | null>(null);
  return (
    <div
      style={{
        display: "grid",
        width: "100%",
        maxWidth: "var(--rams-detail-preview-measure)",
        gap: "var(--rams-detail-space-4)",
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle>New print record</CardTitle>
          <CardDescription>
            Keep the title and paper note together.
          </CardDescription>
        </CardHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            setSaved({
              title: String(data.get("title")),
              note: String(data.get("note")),
            });
          }}
        >
          <CardContent
            style={{ display: "grid", gap: "var(--rams-detail-space-3)" }}
          >
            <Label htmlFor={id + "-title"}>Title</Label>
            <Input
              id={id + "-title"}
              name="title"
              defaultValue="Courtyard / 12"
              required
            />
            <Label htmlFor={id + "-note"}>Paper note</Label>
            <Textarea
              id={id + "-note"}
              name="note"
              defaultValue="160 gsm, short grain."
              required
            />
          </CardContent>
          <CardFooter
            style={{ marginBlockStart: "var(--rams-detail-space-4)" }}
          >
            <Button type="submit">Keep record</Button>
          </CardFooter>
        </form>
      </Card>
      {saved && (
        <section aria-label="Saved print record">
          <h3 style={{ fontWeight: "var(--type-title-weight)" }}>{saved.title}</h3>
          <p>{saved.note}</p>
        </section>
      )}
    </div>
  );
}
