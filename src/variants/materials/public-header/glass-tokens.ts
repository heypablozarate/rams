import type { GlassEngine, GlassToken } from "./types";

export const DEFAULT_GLASS_TOKENS: GlassToken = {
  engine: "auto",
  refraction: 20,
  edgeFade: 0.22,
  shimmer: 0.95,
  chromaShift: 0.36,
  animationSpeed: 0.85,
  fallbackBlur: 24,
  fallbackSaturation: 205,
  fallbackContrast: 1.05,
  fallbackBrightness: 1.03,
  fallbackHighlightOpacity: 0.35,
};

export const GLASS_ENGINE_OPTIONS: Array<{ value: GlassEngine; label: string }> = [
  { value: "auto", label: "Auto" },
  { value: "webgl", label: "Force WebGL" },
  { value: "fallback", label: "Fallback only" },
];

function normalizeGlassEngine(value: unknown): GlassEngine {
  return value === "webgl" || value === "fallback" || value === "auto"
    ? value
    : DEFAULT_GLASS_TOKENS.engine;
}

function normalizeNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function normalizeGlassToken(token?: Partial<GlassToken> | null): GlassToken {
  return {
    engine: normalizeGlassEngine(token?.engine),
    refraction: normalizeNumber(token?.refraction, DEFAULT_GLASS_TOKENS.refraction),
    edgeFade: normalizeNumber(token?.edgeFade, DEFAULT_GLASS_TOKENS.edgeFade),
    shimmer: normalizeNumber(token?.shimmer, DEFAULT_GLASS_TOKENS.shimmer),
    chromaShift: normalizeNumber(token?.chromaShift, DEFAULT_GLASS_TOKENS.chromaShift),
    animationSpeed: normalizeNumber(token?.animationSpeed, DEFAULT_GLASS_TOKENS.animationSpeed),
    fallbackBlur: normalizeNumber(token?.fallbackBlur, DEFAULT_GLASS_TOKENS.fallbackBlur),
    fallbackSaturation: normalizeNumber(
      token?.fallbackSaturation,
      DEFAULT_GLASS_TOKENS.fallbackSaturation,
    ),
    fallbackContrast: normalizeNumber(
      token?.fallbackContrast,
      DEFAULT_GLASS_TOKENS.fallbackContrast,
    ),
    fallbackBrightness: normalizeNumber(
      token?.fallbackBrightness,
      DEFAULT_GLASS_TOKENS.fallbackBrightness,
    ),
    fallbackHighlightOpacity: normalizeNumber(
      token?.fallbackHighlightOpacity,
      DEFAULT_GLASS_TOKENS.fallbackHighlightOpacity,
    ),
  };
}

function parseNumber(value: string | undefined, fallback: number) {
  const parsed = Number.parseFloat(value ?? "");
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function readGlassTokenFromStyles(styles: CSSStyleDeclaration): GlassToken {
  return normalizeGlassToken({
    engine: styles.getPropertyValue("--glass-engine").trim() as GlassEngine,
    refraction: parseNumber(styles.getPropertyValue("--glass-refraction"), DEFAULT_GLASS_TOKENS.refraction),
    edgeFade: parseNumber(styles.getPropertyValue("--glass-edge-fade"), DEFAULT_GLASS_TOKENS.edgeFade),
    shimmer: parseNumber(styles.getPropertyValue("--glass-shimmer"), DEFAULT_GLASS_TOKENS.shimmer),
    chromaShift: parseNumber(styles.getPropertyValue("--glass-chroma-shift"), DEFAULT_GLASS_TOKENS.chromaShift),
    animationSpeed: parseNumber(styles.getPropertyValue("--glass-animation-speed"), DEFAULT_GLASS_TOKENS.animationSpeed),
    fallbackBlur: parseNumber(styles.getPropertyValue("--glass-fallback-blur"), DEFAULT_GLASS_TOKENS.fallbackBlur),
    fallbackSaturation: parseNumber(
      styles.getPropertyValue("--glass-fallback-saturation"),
      DEFAULT_GLASS_TOKENS.fallbackSaturation,
    ),
    fallbackContrast: parseNumber(
      styles.getPropertyValue("--glass-fallback-contrast"),
      DEFAULT_GLASS_TOKENS.fallbackContrast,
    ),
    fallbackBrightness: parseNumber(
      styles.getPropertyValue("--glass-fallback-brightness"),
      DEFAULT_GLASS_TOKENS.fallbackBrightness,
    ),
    fallbackHighlightOpacity: parseNumber(
      styles.getPropertyValue("--glass-fallback-highlight-opacity"),
      DEFAULT_GLASS_TOKENS.fallbackHighlightOpacity,
    ),
  });
}
