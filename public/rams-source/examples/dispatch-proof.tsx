"use client";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Checkbox } from "../components/checkbox";
import { Switch } from "../components/switch";
import { NativeSelect, NativeSelectOption } from "../components/native-select";
import * as F from "../components/form";
import * as L from "../components/field";
import * as G from "../components/input-group";
import "./dispatch-proof.css";
type Draft = {
  editionTitle: string;
  width: string;
  route: string;
  paperChecked: boolean;
  trimGuide: boolean;
  packingNote: string;
};
const initial: Draft = {
  editionTitle: "",
  width: "35",
  route: "",
  paperChecked: false,
  trimGuide: true,
  packingNote: "",
};
export function DispatchProof() {
  const form = useForm<Draft>({ defaultValues: initial });
  const titleRef = useRef<HTMLInputElement>(null);
  const [saved, setSaved] = useState<Draft | null>(null);
  return (
    <main className="dispatch-proof">
      <header>
        <p>Sur Print Archive · Packing desk</p>
        <h1 className="rams-editorial-title">A proof ready to travel.</h1>
      </header>
      <F.Form {...form}>
        <form
          noValidate
          onSubmit={form.handleSubmit((values) =>
            setSaved({
              ...values,
              editionTitle: values.editionTitle.trim(),
              packingNote: values.packingNote.trim(),
            }),
          )}
        >
          <L.FieldSet>
            <L.FieldLegend>Production details</L.FieldLegend>
            <L.FieldGroup>
              <F.FormField
                control={form.control}
                name="editionTitle"
                rules={{
                  validate: (value) =>
                    value.trim().length >= 3 ||
                    "Use at least three characters for the edition title.",
                }}
                render={({ field }) => (
                  <L.Field orientation="responsive">
                    <F.FormLabel>Edition title</F.FormLabel>
                    <L.FieldContent>
                      <F.FormControl ref={titleRef}>
                        <Input {...field} />
                      </F.FormControl>
                      <F.FormDescription>
                        The title printed on the packing slip.
                      </F.FormDescription>
                      <F.FormMessage />
                    </L.FieldContent>
                  </L.Field>
                )}
              />
              <F.FormField
                control={form.control}
                name="width"
                rules={{
                  validate: (value) =>
                    (value.trim() !== "" &&
                      Number.isFinite(Number(value)) &&
                      Number(value) >= 20 &&
                      Number(value) <= 60) ||
                    "Enter a sheet width from 20 to 60 cm.",
                }}
                render={({ field }) => (
                  <L.Field orientation="responsive">
                    <F.FormLabel>Sheet width</F.FormLabel>
                    <L.FieldContent>
                      <G.InputGroup>
                        <F.FormControl>
                          <G.InputGroupInput
                            {...field}
                            type="number"
                            min={20}
                            max={60}
                            step="any"
                          />
                        </F.FormControl>
                        <G.InputGroupAddon align="inline-end">
                          <G.InputGroupText>cm</G.InputGroupText>
                        </G.InputGroupAddon>
                      </G.InputGroup>
                      <F.FormDescription>
                        Untrimmed sheet width in centimeters.
                      </F.FormDescription>
                      <F.FormMessage />
                    </L.FieldContent>
                  </L.Field>
                )}
              />
              <F.FormField
                control={form.control}
                name="route"
                rules={{ required: "Choose a print route." }}
                render={({ field }) => (
                  <L.Field orientation="responsive">
                    <F.FormLabel>Print route</F.FormLabel>
                    <L.FieldContent>
                      <F.FormControl>
                        <NativeSelect {...field}>
                          <NativeSelectOption value="" disabled>
                            Choose a print route
                          </NativeSelectOption>
                          <NativeSelectOption value="rosario-parana">
                            Rosario → Paraná
                          </NativeSelectOption>
                          <NativeSelectOption value="cordoba-rosario">
                            Córdoba → Rosario
                          </NativeSelectOption>
                          <NativeSelectOption value="la-plata-buenos-aires">
                            La Plata → Buenos Aires
                          </NativeSelectOption>
                        </NativeSelect>
                      </F.FormControl>
                      <F.FormMessage />
                    </L.FieldContent>
                  </L.Field>
                )}
              />
              <F.FormField
                control={form.control}
                name="paperChecked"
                rules={{
                  validate: (value) =>
                    value === true || "Confirm the paper stock.",
                }}
                render={({ field }) => (
                  <L.Field orientation="horizontal">
                    <F.FormControl>
                      <Checkbox
                        ref={field.ref}
                        name={field.name}
                        checked={field.value}
                        onCheckedChange={(value) =>
                          field.onChange(value === true)
                        }
                        onBlur={field.onBlur}
                      />
                    </F.FormControl>
                    <L.FieldContent>
                      <F.FormLabel>Paper stock checked</F.FormLabel>
                      <F.FormMessage />
                    </L.FieldContent>
                  </L.Field>
                )}
              />
              <F.FormField
                control={form.control}
                name="trimGuide"
                render={({ field }) => (
                  <L.Field orientation="horizontal">
                    <F.FormControl>
                      <Switch
                        ref={field.ref}
                        name={field.name}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    </F.FormControl>
                    <L.FieldContent>
                      <F.FormLabel>Include trim guide</F.FormLabel>
                      <F.FormDescription>
                        Add the crop-window measurements to the slip.
                      </F.FormDescription>
                    </L.FieldContent>
                  </L.Field>
                )}
              />
              <F.FormField
                control={form.control}
                name="packingNote"
                render={({ field }) => (
                  <L.Field>
                    <F.FormLabel>Packing note</F.FormLabel>
                    <G.InputGroup>
                      <F.FormControl>
                        <G.InputGroupTextarea {...field} rows={3} />
                      </F.FormControl>
                      <G.InputGroupAddon align="block-end">
                        <G.InputGroupButton
                          onClick={() => {
                            field.onChange("");
                            form.setFocus("packingNote");
                          }}
                        >
                          Clear note
                        </G.InputGroupButton>
                      </G.InputGroupAddon>
                    </G.InputGroup>
                  </L.Field>
                )}
              />
            </L.FieldGroup>
          </L.FieldSet>
          <div className="dispatch-proof-actions">
            <Button type="submit">Prepare packing slip</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset(initial);
                titleRef.current?.focus();
              }}
            >
              Reset draft
            </Button>
          </div>
        </form>
      </F.Form>
      {saved && (
        <section
          className="dispatch-proof-record"
          aria-label="Prepared packing slip"
        >
          <h2>{saved.editionTitle}</h2>
          <dl>
            <div>
              <dt>Sheet width</dt>
              <dd>{saved.width} cm</dd>
            </div>
            <div>
              <dt>Print route</dt>
              <dd>
                {saved.route === "rosario-parana"
                  ? "Rosario → Paraná"
                  : saved.route === "cordoba-rosario"
                    ? "Córdoba → Rosario"
                    : "La Plata → Buenos Aires"}
              </dd>
            </div>
            <div>
              <dt>Trim guide</dt>
              <dd>{saved.trimGuide ? "Included" : "Not included"}</dd>
            </div>
          </dl>
          {saved.packingNote && <p>{saved.packingNote}</p>}
          <p role="status">Packing slip prepared</p>
        </section>
      )}
    </main>
  );
}
