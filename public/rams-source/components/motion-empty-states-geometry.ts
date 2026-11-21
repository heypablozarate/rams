/** Pure vector rendering extracted from the existing empty-state geometry. */
export type Kind = "tile" | "body" | "stroke" | "mark";
/** `geo` springs as one vector; `fx` holds opacity and how much of a stroke is drawn. */
export type Prim = { kind: Kind; geo: number[]; fx: [number, number]; tone: string; redraw: boolean };
export type Frame = { prims: Prim[]; label: string };

export const KINDS: Kind[] = ["tile", "tile", "body", "tile", "tile", "tile", "tile", "stroke", "stroke", "mark"];

type Pt = readonly [number, number];
const N = 176, M = 12, RAD = Math.PI / 180;
export const VIEW = { width: 320, height: 216 };

const fmt = (v: number) => String(Math.round(v * 100) / 100);

function tilePath(g: ArrayLike<number>, ox: number, oy: number) {
  const w = Math.max(0, g[2]!), h = Math.max(0, g[3]!);
  if (w < .05 || h < .05) return "";
  const r = Math.min(Math.max(0, g[4]!), w / 2, h / 2), tan = Math.tan(g[6]! * RAD), cos = Math.cos(g[5]! * RAD), sin = Math.sin(g[5]! * RAD);
  const px = g[0]! + ox * g[7]!, py = g[1]! + oy * g[7]!, hw = w / 2, hh = h / 2;
  const corners: [number, number, number][] = [[hw - r, -hh + r, -90], [hw - r, hh - r, 0], [-hw + r, hh - r, 90], [-hw + r, -hh + r, 180]];
  let d = "";
  for (const [cx, cy, start] of corners) {
    for (let s = 0; s <= 6; s++) {
      const a = (start + s * 15) * RAD, x = cx + r * Math.cos(a), y = cy + r * Math.sin(a) + (cx + r * Math.cos(a)) * tan;
      d += `${d ? "L" : "M"}${fmt(x * cos - y * sin + px)} ${fmt(x * sin + y * cos + py)}`;
    }
  }
  return `${d}Z`;
}

function span(g: ArrayLike<number>, from: number, count: number) {
  let len = 0;
  for (let i = from + 1; i < from + count; i++) len += Math.hypot(g[2 * i]! - g[2 * i - 2]!, g[2 * i + 1]! - g[2 * i - 1]!);
  return len;
}

/** Draws the first `budget` units of a polyline. Each point drifts by its own depth, so a line can stretch between two layers. */
function trace(g: ArrayLike<number>, from: number, count: number, budget: number, ox: number, oy: number, z0: number, z1: number, total: number) {
  if (budget <= .05) return "";
  const at = (i: number): Pt => {
    const z = z0 + (z1 - z0) * (total > 1 ? (from + i) / (total - 1) : 0);
    return [g[2 * (from + i)]! + ox * z, g[2 * (from + i) + 1]! + oy * z];
  };
  let [px, py] = at(0), left = budget, d = `M${fmt(px)} ${fmt(py)}`;
  for (let i = 1; i < count; i++) {
    const [x, y] = at(i), len = Math.hypot(x - px, y - py);
    if (len >= left) { const u = len ? left / len : 0; return `${d}L${fmt(px + (x - px) * u)} ${fmt(py + (y - py) * u)}`; }
    left -= len; d += `L${fmt(x)} ${fmt(y)}`; px = x; py = y;
  }
  return d;
}

/** Turns a primitive's current vector into path data, plus a dash pattern for strokes. */
export function shapePath(kind: Kind, g: ArrayLike<number>, drawn: number, ox: number, oy: number): { d: string; dash: string } {
  if (kind === "tile") return { d: tilePath(g, ox, oy), dash: "none" };
  if (kind === "body") {
    const z = g[2 * N]!, dx = ox * z, dy = oy * z;
    let d = "";
    for (let i = 0; i < N; i++) d += `${i ? "L" : "M"}${fmt(g[2 * i]! + dx)} ${fmt(g[2 * i + 1]! + dy)}`;
    return { d: `${d}Z`, dash: "none" };
  }
  const draw = Math.min(1, Math.max(0, drawn)), count = (g.length - 3) / 2, gap = g[g.length - 3]!, z0 = g[g.length - 2]!, z1 = g[g.length - 1]!;
  const dash = gap > .2 ? `3 ${fmt(gap)}` : "none";
  if (kind === "stroke") return { d: trace(g, 0, count, draw * span(g, 0, count), ox, oy, z0, z1, count), dash };
  const first = span(g, 0, M), budget = draw * (first + span(g, M, M));
  return { d: trace(g, 0, M, Math.min(budget, first), ox, oy, z0, z1, 1) + trace(g, M, M, budget - first, ox, oy, z0, z1, 1), dash };
}
