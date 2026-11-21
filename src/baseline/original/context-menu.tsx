import { useId, useState } from "react";
import * as Menu from "../../primitives/context-menu";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../primitives/card";
export function ContextMenuDemo() {
  const hintId = useId();
  const [copies, setCopies] = useState(1),
    [mounted, setMounted] = useState(false);
  return (
    <div
      style={{ display: "grid", gap: "var(--rams-detail-space-4)", width: "100%", maxWidth: "var(--rams-detail-context-proof-inline-size)" }}
    >
      <Menu.ContextMenu>
        <Menu.ContextMenuTrigger asChild>
          <Card tabIndex={0} role="region" aria-label="Terrace proof actions" aria-describedby={hintId}>
            <CardHeader>
              <CardTitle>Terrace / 12</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                {copies} {copies === 1 ? "impression" : "impressions"}
              </p>
              <p>{mounted ? "Mounted on a backing sheet" : "Loose proof"}</p>
              <p id={hintId}>Right-click or press Shift+F10 for proof actions.</p>
            </CardContent>
          </Card>
        </Menu.ContextMenuTrigger>
        <Menu.ContextMenuContent>
          <Menu.ContextMenuItem
            onSelect={() => setCopies((value) => value + 1)}
          >
            Add an impression
          </Menu.ContextMenuItem>
          <Menu.ContextMenuItem
            disabled={copies === 1}
            onSelect={() => setCopies((value) => Math.max(1, value - 1))}
          >
            Remove an impression
          </Menu.ContextMenuItem>
          <Menu.ContextMenuSeparator />
          <Menu.ContextMenuCheckboxItem
            checked={mounted}
            onCheckedChange={(value) => setMounted(value === true)}
          >
            Mount the proof
          </Menu.ContextMenuCheckboxItem>
        </Menu.ContextMenuContent>
      </Menu.ContextMenu>
    </div>
  );
}
