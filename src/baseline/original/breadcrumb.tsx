import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import * as B from "../../primitives/breadcrumb";
import * as M from "../../primitives/dropdown-menu";
import * as D from "../../primitives/drawer";
import { Button } from "../../primitives/button";
import { useCompactSurface } from "../../primitives/use-media-query";
const trail = ["Print archive", "Litoral", "Rosario", "Terrace / 12"];
function useTrailModel() {
  const [level, setLevel] = useState(3),
    [open, setOpen] = useState(false),
    heading = useRef<HTMLHeadingElement>(null),
    previous = useRef(level),
    navigated = useRef(false);
  useLayoutEffect(() => {
    if (previous.current !== level) {
      if (!navigated.current) heading.current?.focus({ preventScroll: true });
      previous.current = level;
    }
  }, [level]);
  function choose(index: number) {
    navigated.current = open;
    setLevel(index);
    setOpen(false);
  }
  function changeOpen(next: boolean) {
    if (next) navigated.current = false;
    setOpen(next);
  }
  function closeFocus(event: Event) {
    if (navigated.current) {
      event.preventDefault();
      const active = document.activeElement;
      if (active === document.body || !active?.isConnected)
        heading.current?.focus({ preventScroll: true });
      navigated.current = false;
    }
  }
  return { level, open, heading, choose, changeOpen, closeFocus };
}
function ArchiveLocation({
  model,
  menu,
}: {
  model: ReturnType<typeof useTrailModel>;
  menu: ReactNode;
}) {
  return (
    <section
      style={{
        display: "grid",
        gap: "var(--rams-detail-space-5)",
        width: "100%",
        maxWidth: "var(--rams-detail-preview-measure-full)",
      }}
      aria-label="Archive location"
    >
      <B.Breadcrumb>
        <B.BreadcrumbList>
          {model.level === 0 ? (
            <B.BreadcrumbItem>
              <B.BreadcrumbPage>{trail[0]}</B.BreadcrumbPage>
            </B.BreadcrumbItem>
          ) : (
            <>
              <B.BreadcrumbItem>
                <B.BreadcrumbLink asChild>
                  <button type="button" onClick={() => model.choose(0)}>
                    {trail[0]}
                  </button>
                </B.BreadcrumbLink>
              </B.BreadcrumbItem>
              <B.BreadcrumbSeparator />
              {model.level > 1 && (
                <>
                  <B.BreadcrumbItem>{menu}</B.BreadcrumbItem>
                  <B.BreadcrumbSeparator />
                </>
              )}
              <B.BreadcrumbItem>
                <B.BreadcrumbPage>{trail[model.level]}</B.BreadcrumbPage>
              </B.BreadcrumbItem>
            </>
          )}
        </B.BreadcrumbList>
      </B.Breadcrumb>
      <h3 ref={model.heading} tabIndex={-1}>
        {trail[model.level]}
      </h3>
      <p>
        {model.level === 3
          ? "Cotton / 240 gsm · Edition 12"
          : model.level === 2
            ? "Terrace / 12 · Patio / 07"
            : model.level === 1
              ? "Rosario · Paraná · Santa Fe"
              : "Litoral · Cuyo · Pampas"}
      </p>
      {model.level < 3 && (
        <Button variant="outline" onClick={() => model.choose(model.level + 1)}>
          Open {trail[model.level + 1]}
        </Button>
      )}
    </section>
  );
}
export function BreadcrumbDemo() {
  const model = useTrailModel();
  return (
    <ArchiveLocation
      model={model}
      menu={
        <M.DropdownMenu open={model.open} onOpenChange={model.changeOpen}>
          <M.DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Show archive ancestors"
            >
              <B.BreadcrumbEllipsis />
            </Button>
          </M.DropdownMenuTrigger>
          <M.DropdownMenuContent onCloseAutoFocus={model.closeFocus}>
            {trail.slice(1, model.level).map((name, index) => (
              <M.DropdownMenuItem
                key={name}
                onSelect={() => model.choose(index + 1)}
              >
                {name}
              </M.DropdownMenuItem>
            ))}
          </M.DropdownMenuContent>
        </M.DropdownMenu>
      }
    />
  );
}
export function BreadcrumbResponsive() {
  const model = useTrailModel(),
    mobile = useCompactSurface(),
    [drawer, setDrawer] = useState(false);
  function changeOpen(next: boolean) {
    if (next) setDrawer(mobile);
    model.changeOpen(next);
  }
  const trigger = (
    <Button variant="ghost" size="icon-sm" aria-label="Show archive ancestors">
      <B.BreadcrumbEllipsis />
    </Button>
  );
  const menu = drawer ? (
    <D.Drawer open={model.open} onOpenChange={changeOpen}>
      <D.DrawerTrigger asChild>{trigger}</D.DrawerTrigger>
      <D.DrawerContent onCloseAutoFocus={model.closeFocus}>
        <D.DrawerHeader>
          <D.DrawerTitle>Archive ancestors</D.DrawerTitle>
          <D.DrawerDescription>Choose a parent collection.</D.DrawerDescription>
        </D.DrawerHeader>
        <D.DrawerBody style={{ display: "grid", gap: "var(--rams-detail-space-2)" }}>
          {trail.slice(1, model.level).map((name, index) => (
            <Button
              key={name}
              variant="ghost"
              style={{ justifyContent: "start" }}
              onClick={() => model.choose(index + 1)}
            >
              {name}
            </Button>
          ))}
        </D.DrawerBody>
      </D.DrawerContent>
    </D.Drawer>
  ) : (
    <M.DropdownMenu open={model.open} onOpenChange={changeOpen}>
      <M.DropdownMenuTrigger asChild>{trigger}</M.DropdownMenuTrigger>
      <M.DropdownMenuContent onCloseAutoFocus={model.closeFocus}>
        {trail.slice(1, model.level).map((name, index) => (
          <M.DropdownMenuItem
            key={name}
            onSelect={() => model.choose(index + 1)}
          >
            {name}
          </M.DropdownMenuItem>
        ))}
      </M.DropdownMenuContent>
    </M.DropdownMenu>
  );
  return <ArchiveLocation model={model} menu={menu} />;
}
