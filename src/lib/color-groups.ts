export type ColorGroup = { key: string; value: string; roles: string[] };

// Supported authored syntax: decimal L/C/H, optional L%, optional decimal/% alpha.
// Other CSS color syntaxes must be converted explicitly rather than guessed.
const decimal = '[+-]?(?:\\d*\\.\\d+|\\d+)(?:[eE][+-]?\\d+)?';
const oklch = new RegExp(`^oklch\\(\\s*(${decimal})(%?)\\s+(${decimal})\\s+(${decimal})(?:\\s*/\\s*(${decimal})(%?))?\\s*\\)$`);

/** Read the numeric components of the authored OKLCH syntax without rounding. */
export function parseOklch(value: string): [number, number, number, number] {
  const match = oklch.exec(value);
  if (!match) throw new Error(`Invalid OKLCH color: ${value}`);
  const lightness = Number(match[1]) / (match[2] ? 100 : 1);
  const chroma = Number(match[3]);
  const hue = Number(match[4]);
  const alpha = match[5] === undefined ? 1 : Number(match[5]) / (match[6] ? 100 : 1);
  const numbers: [number, number, number, number] = [lightness, chroma, hue, alpha];
  if (!numbers.every(Number.isFinite)) throw new Error(`Invalid OKLCH number: ${value}`);
  return numbers;
}

export function groupColorRoles(colors: Record<string, string>): ColorGroup[] {
  function resolve(role: string, trail: string[] = []): string {
    if (trail.includes(role)) throw new Error(`Cyclic color role: ${role}`);
    if (!Object.hasOwn(colors, role)) throw new Error(`Unknown color role: ${role}`);
    const value = colors[role];
    const alias = /^var\(--([a-z0-9-]+)\)$/.exec(value);
    return alias ? resolve(alias[1], [...trail, role]) : value;
  }
  const groups = new Map<string, ColorGroup>();
  for (const role of Object.keys(colors).filter(role => role !== 'radius')) {
    const value = resolve(role);
    const key = parseOklch(value).join('|');
    const group = groups.get(key);
    if (group) group.roles.push(role);
    else groups.set(key, { key, value, roles: [role] });
  }
  return [...groups.values()];
}
