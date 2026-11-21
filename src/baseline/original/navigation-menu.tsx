import * as Menu from "../../primitives/navigation-menu";
export function NavigationMenuDemo() {
  return (
    <Menu.NavigationMenu aria-label="Studio and reading">
      <Menu.NavigationMenuList>
        <Menu.NavigationMenuItem>
          <Menu.NavigationMenuTrigger>
            Explore the studio
          </Menu.NavigationMenuTrigger>
          <Menu.NavigationMenuContent>
            <div style={{ display: "grid", gap: "var(--rams-detail-space-2)" }}>
              <Menu.NavigationMenuLink href="https://pablozarate.com">
                Portfolio
              </Menu.NavigationMenuLink>
              <Menu.NavigationMenuLink href="https://lab.pablozarate.com">
                Lab
              </Menu.NavigationMenuLink>
            </div>
          </Menu.NavigationMenuContent>
        </Menu.NavigationMenuItem>
        <Menu.NavigationMenuItem>
          <Menu.NavigationMenuTrigger>Reading</Menu.NavigationMenuTrigger>
          <Menu.NavigationMenuContent>
            <div style={{ display: "grid", gap: "var(--rams-detail-space-2)" }}>
              <Menu.NavigationMenuLink href="https://www.remon.design/7-tips-to-improve-your-design/">
                Design principles
              </Menu.NavigationMenuLink>
              <Menu.NavigationMenuLink href="https://www.remon.design/9-tips-for-improving-your-typography-skills/">
                Typography practice
              </Menu.NavigationMenuLink>
            </div>
          </Menu.NavigationMenuContent>
        </Menu.NavigationMenuItem>
      </Menu.NavigationMenuList>
    </Menu.NavigationMenu>
  );
}
