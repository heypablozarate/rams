import { parseOklch } from "./color-groups.ts";

type PrimitiveSource = { colorPrimitives?: Record<string, unknown> };
type TonalRecipe = { source: string; light: number[]; dark: number[] };
const reference = /^\{(colorPrimitives(?:\.[A-Za-z0-9_-]+)+)\}$/;

/** Resolve authoring references without changing the exported token API or CSS aliases. */
export function resolveTokens<T extends PrimitiveSource>(
  source: T,
): Omit<T, "colorPrimitives"> {
  const authored = structuredClone(source);
  function resolve(value: unknown, trail: string[] = []): unknown {
    if (typeof value === "string") {
      const match = reference.exec(value);
      if (!match) {
        if (value.startsWith("{colorPrimitives"))
          throw new Error(`Malformed token reference: ${value}`);
        return value;
      }
      const path = match[1];
      if (trail.includes(path))
        throw new Error(
          `Cyclic token reference: ${[...trail, path].join(" -> ")}`,
        );
      let target: unknown = authored;
      for (const segment of path.split(".")) {
        if (
          target === null ||
          typeof target !== "object" ||
          !Object.hasOwn(target, segment)
        ) {
          throw new Error(`Unknown token reference: ${path}`);
        }
        target = (target as Record<string, unknown>)[segment];
      }
      if (typeof target !== "string")
        throw new Error(`Token reference must point to a string: ${path}`);
      return resolve(target, [...trail, path]);
    }
    if (Array.isArray(value)) return value.map((item) => resolve(item, trail));
    if (value !== null && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, resolve(item, trail)]),
      );
    }
    return value;
  }

  const tonal = (
    authored as T & { supportingCustomization?: { tonal?: TonalRecipe } }
  ).supportingCustomization?.tonal;
  if (tonal) {
    const parse = (value: unknown) => {
      if (typeof value !== "string")
        throw new Error("Tonal palette requires opaque numeric OKLCH colors");
      const [lightness, chroma, hue, alpha] = parseOklch(value);
      if (alpha !== 1 || lightness < 0 || lightness > 1 || chroma < 0)
        throw new Error("Tonal palette requires opaque numeric OKLCH colors");
      return [lightness, chroma, hue];
    };
    const accent = parse(resolve(tonal.source));
    const supporting: Record<string, Record<string, string>> = {};
    for (const mode of ["light", "dark"] as const) {
      const weights = tonal[mode];
      if (
        !Array.isArray(weights) ||
        weights.length !== 5 ||
        weights.some((w) => !Number.isFinite(w) || w <= 0 || w >= 100) ||
        new Set(weights).size !== 5
      )
        throw new Error("Invalid tonal palette weights");
      const foreground = parse(
        resolve(
          (
            authored as unknown as {
              themes: Record<string, { foreground: string }>;
            }
          ).themes[mode].foreground,
        ),
      );
      const polar = (c: number, h: number) => [
        c * Math.cos((h * Math.PI) / 180),
        c * Math.sin((h * Math.PI) / 180),
      ];
      const [aa, ab] = polar(accent[1], accent[2]),
        [fa, fb] = polar(foreground[1], foreground[2]);
      const n = (v: number) => Number(v.toFixed(12));
      supporting[mode] = Object.fromEntries(
        weights.map((percent, index) => {
          const w = percent / 100,
            a = aa * w + fa * (1 - w),
            b = ab * w + fb * (1 - w);
          return [
            `tone${index + 1}`,
            `oklch(${n(accent[0] * w + foreground[0] * (1 - w))} ${n(Math.hypot(a, b))} ${n(((Math.atan2(b, a) * 180) / Math.PI + 360) % 360)})`,
          ];
        }),
      );
    }
    authored.colorPrimitives = { ...authored.colorPrimitives, supporting };
  }
  const { colorPrimitives: _primitives, ...resolved } = resolve(authored) as T;
  return resolved;
}
