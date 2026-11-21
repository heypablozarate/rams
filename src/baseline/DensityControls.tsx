import { useEffect, useId, useState } from "react";
import { readDensity, setDensity, type Density } from "./density";
import {
  NativeSelect,
  NativeSelectOption,
} from "../primitives/native-select";
import { tokens } from "./tokens";
import { buildTypographyManifest } from "../lib/typography";
import { shapeRadiiAt16 } from "./shape-tokens";

export function DensityControl() {
  const [value, update] = useState(readDensity);
  const id = useId();
  useEffect(() => {
    const sync = () => update(readDensity());
    window.addEventListener("rams-density-change", sync);
    return () => window.removeEventListener("rams-density-change", sync);
  }, []);
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium">
        Density
      </label>
      <NativeSelect
        id={id}
        aria-label="Density"
        value={value}
        onChange={(event) => setDensity(event.target.value as Density)}
      >
        <NativeSelectOption value="default">Default</NativeSelectOption>
        <NativeSelectOption value="compact">Compact</NativeSelectOption>
        <NativeSelectOption value="wide">Wide</NativeSelectOption>
      </NativeSelect>
    </div>
  );
}

export function DensityGuide() {
  const tableId = useId();
  const densityLabels = ["Compact", "Default", "Wide"];
  const scales = [
    tokens.density.scales.compact,
    tokens.density.scales.default,
    tokens.density.scales.wide,
  ];
  const type = buildTypographyManifest(
    tokens.typography,
    tokens.density.scales,
  )!;
  const typeRange = (id: string, mode: string) => {
    const role = type.roles.find((r) => r.id === id)!;
    const range = role.densityRanges?.[mode];
    return range
      ? `${range.minRem * 16}–${range.maxRem * 16} px`
      : role.densitySizes[mode];
  };
  const modes = ["compact", "default", "wide"];
  const px = (value: string, multiple = 1) =>
    `${parseFloat(value) * 16 * multiple} px`;
  const controlHeightSteps = Number(tokens.componentExtensions.base["--rams-detail-native-control-height-md-steps"]);
  const borderAtReference = parseFloat(tokens.componentExtensions.base["--rams-detail-primitive-border-width"]);
  const rows = [
    ["Control text", ...modes.map((mode) => typeRange("control", mode))],
    ["Body", ...modes.map((mode) => typeRange("body", mode))],
    ["Helper text", ...modes.map((mode) => typeRange("caption", mode))],
    ["Main heading", ...modes.map((mode) => typeRange("heading", mode))],
    ["Standard button/input", ...scales.map((scale) => px(scale.spacing, controlHeightSteps))],
    ["Spacing unit", ...scales.map((scale) => px(scale.spacing))],
    ["Standard icon", ...scales.map((scale) => px(scale.spacing, 4))],
    [
      "Border / button radius",
      ...scales.map(() => `${borderAtReference} / ${shapeRadiiAt16.control} px`),
    ],
  ];
  return (
    <section className="density-reference space-y-4">
      <h2 className="text-xl font-semibold">Choose density</h2>
      <DensityControl />
      <p>
        Compact shows more information. Default balances space and readability. Wide gives text and controls more room.
      </p>
      <table
        className="density-reference-table"
        role="table"
        aria-label="Density comparison"
      >
        <caption>
          Fluid text from 320–1280 px; reference root size is 16 px. Spacing and geometry retain their density.
        </caption>
        <thead role="rowgroup">
          <tr role="row">
            <th scope="col" role="columnheader">
              Element
            </th>
            {densityLabels.map((label, index) => (
              <th
                id={`${tableId}-col-${index}`}
                scope="col"
                role="columnheader"
                key={label}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody role="rowgroup">
          {rows.map((row, rowIndex) => (
            <tr role="row" key={row[0]}>
              <th
                id={`${tableId}-row-${rowIndex}`}
                scope="row"
                role="rowheader"
              >
                {row[0]}
              </th>
              {row.slice(1).map((value, index) => (
                <td
                  role="cell"
                  headers={`${tableId}-row-${rowIndex} ${tableId}-col-${index}`}
                  key={index}
                >
                  <span className="density-value-label" aria-hidden="true">
                    {densityLabels[index]}
                  </span>
                  <span>{value}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-sm text-muted-foreground">
        Density applies to all examples and preserves borders and radii. Relative sizes respect the browser’s text preference. Check touch targets on mobile, especially for small controls and calendars.
      </p>
    </section>
  );
}
