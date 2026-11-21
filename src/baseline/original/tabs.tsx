import { useId, useState } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../primitives/tabs";
import { Input } from "../../primitives/input";
import { Label } from "../../primitives/label";
import { Button } from "../../primitives/button";

const printDetailStack = {
  display: "grid",
  gap: "var(--rams-detail-space-4)",
};

export function TabsDemo() {
  const id = useId(),
    [paper, setPaper] = useState("Cotton / 180 gsm"),
    [press, setPress] = useState("Grid, then terrace"),
    [saved, setSaved] = useState("");
  return (
    <div
      style={{
        ...printDetailStack,
        width: "100%",
        maxWidth: "var(--rams-detail-preview-measure-wide)",
      }}
    >
      <Tabs defaultValue="paper">
        <TabsList aria-label="Print record sections">
          <TabsTrigger value="paper">Paper</TabsTrigger>
          <TabsTrigger value="press">Press</TabsTrigger>
        </TabsList>
        <TabsContent value="paper">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setSaved("Paper: " + paper);
            }}
            style={printDetailStack}
          >
            <Label htmlFor={id + "-paper"}>Paper specification</Label>
            <Input
              id={id + "-paper"}
              required
              value={paper}
              onChange={(event) => setPaper(event.target.value)}
            />
            <Button type="submit">Keep paper note</Button>
          </form>
        </TabsContent>
        <TabsContent value="press">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setSaved("Press: " + press);
            }}
            style={printDetailStack}
          >
            <Label htmlFor={id + "-press"}>Press order</Label>
            <Input
              id={id + "-press"}
              required
              value={press}
              onChange={(event) => setPress(event.target.value)}
            />
            <Button type="submit">Keep press order</Button>
          </form>
        </TabsContent>
      </Tabs>
      {saved && <output aria-label="Saved print detail">{saved}</output>}
    </div>
  );
}
