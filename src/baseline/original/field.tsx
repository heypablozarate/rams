import { useId, useState } from "react";
import * as F from "../../primitives/field";
import { Input } from "../../primitives/input";
import { Textarea } from "../../primitives/textarea";
import { Checkbox } from "../../primitives/checkbox";
import { NativeSelect } from "../../primitives/native-select";
import { Button } from "../../primitives/button";

const fieldLayout = {
  inlineSize: "100%",
  maxInlineSize: "var(--rams-detail-preview-measure-wide)",
  display: "grid",
  gap: "var(--rams-detail-preview-field-group-gap)",
} as const;

export function FieldDemo() {
  const id = useId(),
    [title, setTitle] = useState("Terrace / 12"),
    [note, setNote] = useState("Fold across the grain."),
    [saved, setSaved] = useState<{ title: string; note: string } | null>(null);
  return (
    <div style={fieldLayout}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSaved({ title: title.trim(), note: note.trim() });
        }}
        onReset={() => {
          setTitle("Terrace / 12");
          setNote("Fold across the grain.");
          setSaved(null);
        }}
      >
        <F.FieldSet>
          <F.FieldLegend>Bindery slip</F.FieldLegend>
          <F.FieldGroup>
            <F.Field>
              <F.FieldLabel htmlFor={id + "-title"}>Edition title</F.FieldLabel>
              <Input
                id={id + "-title"}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                pattern=".*\S.*"
                aria-describedby={id + "-title-help"}
              />
              <F.FieldDescription id={id + "-title-help"}>
                The title printed on the slip.
              </F.FieldDescription>
            </F.Field>
            <F.Field>
              <F.FieldLabel htmlFor={id + "-note"}>Assembly note</F.FieldLabel>
              <Textarea
                id={id + "-note"}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                aria-describedby={id + "-note-help"}
              />
              <F.FieldDescription id={id + "-note-help"}>
                Specify the fold direction and drying order.
              </F.FieldDescription>
            </F.Field>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--rams-detail-preview-element-gap)" }}>
              <Button type="submit">Keep bindery slip</Button>
              <Button variant="outline" type="reset">
                Restore draft
              </Button>
            </div>
          </F.FieldGroup>
        </F.FieldSet>
      </form>
      {saved && (
        <section aria-label="Saved bindery slip">
          <h3>{saved.title}</h3>
          <p>{saved.note}</p>
        </section>
      )}
    </div>
  );
}
export function FieldCheckbox() {
  const id = useId(),
    [details, setDetails] = useState({ colophon: true, grain: false });
  const options = [
    {
      key: "colophon",
      label: "Include the colophon",
      help: "Add the edition number and paper stock to the final sheet.",
    },
    {
      key: "grain",
      label: "Print the grain guide",
      help: "Mark the direction along the sheet’s long edge.",
    },
  ] as const;
  return (
    <F.FieldGroup style={{ inlineSize: "100%", maxInlineSize: "var(--rams-detail-preview-measure-wide)" }}>
      <F.FieldSet>
        <F.FieldLegend variant="label">Final sheet details</F.FieldLegend>
        <F.FieldGroup>
          {options.map((option) => (
            <F.Field key={option.key} orientation="horizontal">
              <Checkbox
                id={id + "-" + option.key}
                checked={details[option.key]}
                onCheckedChange={(value) =>
                  setDetails((previous) => ({
                    ...previous,
                    [option.key]: value === true,
                  }))
                }
                aria-describedby={id + "-" + option.key + "-help"}
              />
              <F.FieldContent>
                <F.FieldLabel htmlFor={id + "-" + option.key}>
                  {option.label}
                </F.FieldLabel>
                <F.FieldDescription id={id + "-" + option.key + "-help"}>
                  {option.help}
                </F.FieldDescription>
              </F.FieldContent>
            </F.Field>
          ))}
        </F.FieldGroup>
      </F.FieldSet>
      <section aria-label="Final sheet">
        <p>Patio / 07</p>
        {details.colophon && <p>Edition 07 · Cotton / 240 gsm · Rosario</p>}
        {details.grain && <p>Grain guide along the long edge.</p>}
      </section>
    </F.FieldGroup>
  );
}
export function FieldResponsive() {
  const id = useId(),
    [room, setRoom] = useState("Rosario"),
    [note, setNote] = useState("Pack the sheets flat."),
    [saved, setSaved] = useState<{ room: string; note: string } | null>(null);
  return (
    <div style={{ ...fieldLayout, maxInlineSize: "var(--rams-detail-preview-measure-full)" }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSaved({ room, note });
        }}
      >
        <F.FieldSet>
          <F.FieldLegend>Print-room delivery</F.FieldLegend>
          <F.FieldGroup>
            <F.Field orientation="responsive">
              <F.FieldLabel htmlFor={id + "-room"}>Print room</F.FieldLabel>
              <F.FieldContent>
                <NativeSelect
                  id={id + "-room"}
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                >
                  {["Rosario", "Paraná", "Mendoza"].map((city) => (
                    <option key={city}>{city}</option>
                  ))}
                </NativeSelect>
              </F.FieldContent>
            </F.Field>
            <F.Field orientation="responsive">
              <F.FieldLabel htmlFor={id + "-note"}>Packing note</F.FieldLabel>
              <F.FieldContent>
                <Input
                  id={id + "-note"}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  required
                  aria-describedby={id + "-help"}
                />
                <F.FieldDescription id={id + "-help"}>
                  Instructions travel with the edition.
                </F.FieldDescription>
              </F.FieldContent>
            </F.Field>
            <Button type="submit">Keep delivery</Button>
          </F.FieldGroup>
        </F.FieldSet>
      </form>
      {saved && (
        <section aria-label="Saved delivery details">
          <h3>{saved.room}</h3>
          <p>{saved.note}</p>
        </section>
      )}
    </div>
  );
}
