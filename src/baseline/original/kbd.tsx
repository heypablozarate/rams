import { Kbd, KbdGroup } from "../../primitives/kbd";
export function KbdDemo() {
  return <Kbd>Tab</Kbd>;
}
export function KbdGroupDemo() {
  return (
    <KbdGroup aria-label="Move focus backward">
      <Kbd>Shift</Kbd>
      <span>+</span>
      <Kbd>Tab</Kbd>
    </KbdGroup>
  );
}
