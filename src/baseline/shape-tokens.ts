// Generated from tokens.json shapeCustomization; do not edit.
export const shapeRadii = {
  "control": "1.125rem",
  "panel": "1.625rem",
  "surface": "2.125rem",
  "select-panel": "1.25rem",
  "select-item": "max(0px, calc(0.9375rem - 1px))",
  "menu-item": "max(0px, calc(1.3125rem - 1px))",
  "tab-item": "max(0px, calc(1.125rem - 3px))",
  "indicator": "0.3125rem",
  "inset": "0.625rem",
  "pill": "9999px"
} as const;
export const shapeRadiiAt16 = {
  "control": 18,
  "panel": 26,
  "surface": 34,
  "select-panel": 20,
  "select-item": 14,
  "menu-item": 20,
  "tab-item": 15,
  "indicator": 5,
  "inset": 10,
  "pill": 9999
} as const;
export type ShapeRadiusRole = keyof typeof shapeRadii;
