import { useId, useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
} from "../../primitives/select";
import { Label } from "../../primitives/label";

const fieldLayout = {
  display: "grid",
  gap: "var(--rams-detail-preview-element-gap)",
  inlineSize: "100%",
  maxInlineSize: "var(--rams-detail-preview-field-measure)",
} as const;

export function SelectDemo() {
  const id = useId(),
    [stock, setStock] = useState("cotton");
  return (
    <div style={fieldLayout}>
      <Label htmlFor={id}>Paper for the edition</Label>
      <Select value={stock} onValueChange={setStock}>
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {[
            ["cotton", "Cotton / 240 gsm"],
            ["recycled", "Recycled / 170 gsm"],
            ["uncoated", "Uncoated / 180 gsm"],
            ["linen", "Linen / 200 gsm"],
          ].map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
export function SelectScrollable() {
  const id = useId();
  const rooms = [
    ["Litoral", ["Rosario", "Paraná", "Santa Fe", "Concordia", "Gualeguaychú"]],
    ["Cuyo", ["Mendoza", "San Juan", "San Luis", "San Rafael"]],
    ["Pampas", ["La Plata", "Tandil", "Olavarría", "Azul", "Bahía Blanca"]],
  ] as const;
  return (
    <div style={fieldLayout}>
      <Label htmlFor={id}>Destination print room</Label>
      <Select defaultValue="Rosario">
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {rooms.map(([region, cities]) => (
            <SelectGroup key={region}>
              <SelectLabel>{region}</SelectLabel>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
