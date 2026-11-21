"use client";
import "../styles.css";
import { useId, useState, type CSSProperties } from "react";
import { Combobox, ComboboxInput, ComboboxContent, ComboboxList, ComboboxItem, ComboboxEmpty } from "../components/combobox";
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
      <ComboboxInput id={`${id}-stock`} placeholder="Search" autoComplete="off" showClear={value !== null}/>
      <ComboboxContent><ComboboxEmpty>No matching stock.</ComboboxEmpty><ComboboxList>{(item: string) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}</ComboboxList></ComboboxContent>
    </Combobox>
    <p role="status" style={{ margin: 0, overflowWrap: "anywhere" }}>Selected stock: {value || "none"}.</p>
  </section>;
}
export default ComboboxIntegration;
