import { useState } from "react";
import * as Menu from "../../primitives/menubar";
export function MenubarDemo() {
  const [revision, setRevision] = useState(1),
    [guide, setGuide] = useState(true),
    [stock, setStock] = useState("cotton");
  return (
    <div
      style={{
        display: "grid",
        gap: "var(--rams-detail-space-4)",
        width: "100%",
        maxWidth: "var(--rams-detail-preview-measure-wide)",
      }}
    >
      <Menu.Menubar aria-label="Print room menus">
        <Menu.MenubarMenu>
          <Menu.MenubarTrigger>Sheet</Menu.MenubarTrigger>
          <Menu.MenubarContent>
            <Menu.MenubarItem
              onSelect={() => setRevision((value) => value + 1)}
            >
              New revision
            </Menu.MenubarItem>
            <Menu.MenubarItem
              disabled={revision === 1}
              onSelect={() => setRevision(1)}
            >
              Return to first revision
            </Menu.MenubarItem>
          </Menu.MenubarContent>
        </Menu.MenubarMenu>
        <Menu.MenubarMenu>
          <Menu.MenubarTrigger>Production</Menu.MenubarTrigger>
          <Menu.MenubarContent>
            <Menu.MenubarCheckboxItem
              checked={guide}
              onCheckedChange={(value) => setGuide(value === true)}
            >
              Show fold guide
            </Menu.MenubarCheckboxItem>
            <Menu.MenubarSub>
              <Menu.MenubarSubTrigger>Paper stock</Menu.MenubarSubTrigger>
              <Menu.MenubarSubContent>
                <Menu.MenubarRadioGroup
                  value={stock}
                  onValueChange={setStock}
                  aria-label="Production stock"
                >
                  <Menu.MenubarRadioItem value="cotton">
                    Cotton
                  </Menu.MenubarRadioItem>
                  <Menu.MenubarRadioItem value="linen">
                    Linen
                  </Menu.MenubarRadioItem>
                </Menu.MenubarRadioGroup>
              </Menu.MenubarSubContent>
            </Menu.MenubarSub>
          </Menu.MenubarContent>
        </Menu.MenubarMenu>
      </Menu.Menubar>
      <section aria-label="Current print sheet">
        <p>Patio / 07 — revision {revision}</p>
        <p>Stock: {stock === "cotton" ? "Cotton" : "Linen"}</p>
        {guide && <p>Fold on the long edge.</p>}
      </section>
    </div>
  );
}
