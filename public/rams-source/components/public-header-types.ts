export type GlassEngine = "auto" | "webgl" | "fallback";
export type GlassToken = {
 engine: GlassEngine; refraction: number; edgeFade: number; shimmer: number;
 chromaShift: number; animationSpeed: number; fallbackBlur: number;
 fallbackSaturation: number; fallbackContrast: number; fallbackBrightness: number;
 fallbackHighlightOpacity: number;
};
