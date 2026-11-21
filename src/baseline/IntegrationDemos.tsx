"use client";

import { useId, useState, type CSSProperties } from "react";
import { useForm } from "react-hook-form";
import { Combobox, ComboboxInput, ComboboxContent, ComboboxList, ComboboxItem, ComboboxEmpty } from "../primitives/combobox";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "../primitives/form";
import { Input } from "../primitives/input";
import { Button } from "../primitives/button";
import { Card, CardContent } from "../primitives/card";

const layout: CSSProperties = { display: "grid", gridTemplateColumns: "minmax(0,1fr)", width: "100%", maxWidth: "var(--rams-detail-preview-measure)", minWidth: 0, gap: "var(--rams-detail-preview-scene-gap)", fontSize: "var(--type-body-size)", lineHeight: "var(--rams-detail-preview-print-scene-leading)" };
const heading: CSSProperties = { margin: 0, fontSize: "var(--type-title-size)", fontWeight: "var(--rams-detail-preview-integration-form-heading-weight)", lineHeight: "var(--type-title-leading)", overflowWrap: "anywhere" };
const paperStocks = ["Rosario — uncoated 90 gsm", "Mendoza — textured 120 gsm", "La Plata — smooth 100 gsm", "Córdoba — recycled 110 gsm"];

export function ComboboxIntegration() {
  const id = useId();
  const [value, setValue] = useState<string | null>(null), [query, setQuery] = useState("");
  const filtered = paperStocks.filter(item => item.toLocaleLowerCase("en").includes(query.trim().toLocaleLowerCase("en")));
  return <section style={layout} aria-labelledby={`${id}-heading`}>
    <h2 id={`${id}-heading`} style={heading}>Choose a worksheet paper stock</h2>
    <label htmlFor={`${id}-stock`}>Paper stock</label>
    <Combobox inputValue={query} items={paperStocks} filteredItems={filtered} value={value} onValueChange={setValue} onInputValueChange={setQuery}>
      <ComboboxInput id={`${id}-stock`} placeholder="Search" autoComplete="off" showClear={value !== null} />
      <ComboboxContent><ComboboxEmpty>No matching stock.</ComboboxEmpty><ComboboxList>{(item: string) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}</ComboboxList></ComboboxContent>
    </Combobox>
    <p role="status" style={{ margin: 0, overflowWrap: "anywhere" }}>Selected stock: {value || "none"}.</p>
  </section>;
}

export function FormIntegration() {
  const id = useId();
  const form = useForm<{ label: string }>({ defaultValues: { label: "" } });
  const [proofLabel, setProofLabel] = useState("");
  return <Form {...form}><form noValidate aria-labelledby={`${id}-heading`} style={layout} onSubmit={form.handleSubmit(values => setProofLabel(values.label.trim()))}>
    <h2 id={`${id}-heading`} style={heading}>Create a local proof label</h2>
    <FormField control={form.control} name="label" rules={{ validate: value => !value.trim() ? "Enter a proof label." : value.trim().length < 3 ? "Use at least 3 characters." : value.trim().length > 32 ? "Use no more than 32 characters." : true }} render={({field}) => <FormItem>
      <FormLabel>Proof label</FormLabel><FormControl><Input {...field} required maxLength={32} autoComplete="off" /></FormControl>
      <FormDescription>Use 3–32 characters for the Córdoba worksheet.</FormDescription><FormMessage />
    </FormItem>} />
    <Button type="submit">Keep label</Button>
    <div role="status">{proofLabel ? <Card role="region" aria-label="Local proof label"><CardContent><p style={{ margin: 0, overflowWrap: "anywhere" }}>{proofLabel}</p></CardContent></Card> : <p style={{ margin: 0 }}>No proof label has been kept.</p>}</div>
  </form></Form>;
}
