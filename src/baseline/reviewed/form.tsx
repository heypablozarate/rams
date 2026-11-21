// Generated from src/baseline/original/form.tsx. The original source remains unchanged.
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as F from "../../primitives/form";
import { Checkbox } from "../../primitives/checkbox";
import { Button } from "../../primitives/button";
import { Label } from "../../primitives/label";
import * as L from "../../primitives/field";
const formStack = {
    display: "grid",
    gap: "var(--rams-detail-preview-field-group-gap)",
} as const;
const formLayout = {
    ...formStack,
    inlineSize: "100%",
    maxInlineSize: "var(--rams-detail-preview-measure-wide)",
} as const;
const formActions = {
    display: "flex",
    flexWrap: "wrap",
    gap: "var(--rams-detail-preview-element-gap)",
} as const;
const choiceRow = {
    display: "flex",
    alignItems: "flex-start",
    gap: "var(--rams-detail-preview-element-gap)",
} as const;
const releaseChecks = [
    { id: "trim", label: "Trim corners" },
    { id: "colophon", label: "Colophon details" },
];
function ReleaseCheckOptions({ value, onChange, onBlur, controlRef, }: {
    value: string[];
    onChange: (value: string[]) => void;
    onBlur: () => void;
    controlRef: (node: HTMLButtonElement | null) => void;
}) {
    const meta = F.useFormField(), described = [
        meta.formDescriptionId,
        meta.invalid ? meta.formMessageId : null,
    ]
        .filter(Boolean)
        .join(" ");
    return (<L.FieldSet aria-describedby={described}>
      <L.FieldLegend variant="label">Release checks</L.FieldLegend>
      <div style={{ display: "grid", gap: "var(--rams-detail-preview-element-gap)" }}>
        {releaseChecks.map((option, index) => (<div key={option.id} style={choiceRow}>
            <Checkbox id={index === 0
                ? meta.formItemId
                : meta.formItemId + "-" + option.id} name={meta.name} ref={index === 0 ? controlRef : undefined} checked={value.includes(option.id)} onBlur={onBlur} onCheckedChange={(checked) => onChange(checked
                ? [...value, option.id]
                : value.filter((id) => id !== option.id))} aria-invalid={meta.invalid || undefined} aria-describedby={described}/>
            <Label htmlFor={index === 0
                ? meta.formItemId
                : meta.formItemId + "-" + option.id}>
              {option.label}
            </Label>
          </div>))}
      </div>
      <F.FormDescription>
        Choose at least one detail to check before binding.
      </F.FormDescription>
      <F.FormMessage />
    </L.FieldSet>);
}
export function FormRhfCheckbox() {
    const form = useForm<{
        grainGuide: boolean;
        checks: string[];
    }>({
        defaultValues: { grainGuide: false, checks: [] },
    }), [saved, setSaved] = useState<{
        grainGuide: boolean;
        checks: string[];
    } | null>(null);
    return (<div style={formLayout}>
      <F.Form {...form}>
        <form noValidate onSubmit={form.handleSubmit((values) => setSaved({ ...values, checks: [...values.checks] }))} onReset={(event) => {
            event.preventDefault();
            form.reset({ grainGuide: false, checks: [] });
            setSaved(null);
        }} style={formStack}>
          <F.FormField control={form.control} name="grainGuide" render={({ field }) => (<F.FormItem>
                <div style={choiceRow}>
                  <F.FormControl>
                    <Checkbox name={field.name} checked={field.value} onCheckedChange={field.onChange} onBlur={field.onBlur} ref={field.ref}/>
                  </F.FormControl>
                  <F.FormLabel>Print the grain guide</F.FormLabel>
                </div>
                <F.FormDescription>
                  Mark the direction on the packing sheet.
                </F.FormDescription>
              </F.FormItem>)}/>
          <F.FormField control={form.control} name="checks" rules={{
            validate: (value) => value.length > 0 || "Choose at least one release check.",
        }} render={({ field }) => (<F.FormItem>
                <ReleaseCheckOptions value={field.value} onChange={field.onChange} onBlur={field.onBlur} controlRef={field.ref}/>
              </F.FormItem>)}/>
          <div style={formActions}>
            <Button type="submit">Release</Button>
            <Button type="reset" variant="outline">
              Reset
            </Button>
          </div>
        </form>
      </F.Form>
      {saved && (<section aria-label="Binding release">
          <p>Terrace / 12</p>
          <p>Grain guide: {saved.grainGuide ? "on" : "off"}</p>
          <p>
            Checks:{" "}
            {releaseChecks
                .filter((option) => saved.checks.includes(option.id))
                .map((option) => option.label)
                .join(", ")}
          </p>
        </section>)}
    </div>);
}
