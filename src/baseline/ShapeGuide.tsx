import { shapeRadii, shapeRadiiAt16, type ShapeRadiusRole } from "./shape-tokens";
import { shapeRoleDescriptions } from "../lib/shape";
import { Button } from "../primitives/button";
import { Input } from "../primitives/input";

const names: Record<ShapeRadiusRole, string> = {
  control: "Control",
  panel: "Panel",
  surface: "Surface",
  "select-panel": "Select panel",
  "select-item": "Select item",
  "menu-item": "Menu item",
  "tab-item": "Tab item",
  indicator: "Indicator",
  inset: "Inset",
  pill: "Capsule",
};
const majorRoles = ["control", "panel", "surface"] as const;

export function ShapeGuide() {
  return (
    <section className="space-y-8" aria-label="Shape and radii">
      <div>
        <h2 className="text-xl font-semibold">Radii by role</h2>
        <p className="mt-3 text-muted-foreground">
          Use Control for actions and fields, Panel for cards and floating
          content, and Surface for dialogs. Shape remains consistent across themes and
          density settings.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">Reference measurements use a 16 px root. Relative values follow the browser’s text-size preference.</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        {majorRoles.map((role) => (
          <div key={role} className="space-y-3">
            <div
              className="shape-example"
              style={{ borderRadius: `var(--radius-${role})` }}
              aria-hidden="true"
            />
            <h3 className="font-medium">{names[role]}</h3>
            <p className="text-sm text-muted-foreground">
              {shapeRadiiAt16[role]} px
            </p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-4 rounded-xl [border-width:var(--rams-detail-primitive-border-width)] p-5">
        <Button>Primary action</Button>
        <Input
          aria-label="Field example with shared radius"
          placeholder="Same radius, different role"
          className="max-w-xs"
        />
      </div>
      <div className="overflow-x-auto rounded-xl [border-width:var(--rams-detail-primitive-border-width)]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              <th className="p-4">Role</th>
              <th className="p-4">Radius</th>
              <th className="p-4">Use</th>
            </tr>
          </thead>
          <tbody>
            {(Object.keys(shapeRadii) as ShapeRadiusRole[]).map((role) => (
              <tr key={role} className="[border-top-width:var(--rams-detail-primitive-border-width)]">
                <td className="p-4 font-medium">{names[role]}</td>
                <td className="p-4 whitespace-nowrap">{role === 'pill' ? 'Full' : `${shapeRadiiAt16[role]} px`}</td>
                <td className="p-4 text-muted-foreground">
                  {shapeRoleDescriptions[role]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 text-sm text-muted-foreground">
        <h3 className="font-medium text-foreground">
          Guidelines
        </h3>
        <p>
          Derive inner radii from the container to keep corners
          aligned. Preserve circles, capsules, and
          shared corners on joined controls.
        </p>
        <p>
          Customize shape roles and check controls, menus, and dialogs
          at rest, while opening, and while closing.
        </p>
        <a className="underline" href="/shape-guide.md">
          Customize radii
        </a>{" "}
        ·{" "}
        <a className="underline" href="/design-system.json">
          Role reference · JSON
        </a>
      </div>
    </section>
  );
}
