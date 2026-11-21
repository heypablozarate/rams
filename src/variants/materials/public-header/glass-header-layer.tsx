"use client";

import { useReducedMotion } from "@/variants/use-motion-preference";
import "./glass.css";
import "./glass-dark.css";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { GlassToken } from "./types";
import { readGlassTokenFromStyles, normalizeGlassToken } from "./glass-tokens";
import { cx as cn } from "@/primitives/utils";

const vertexShaderSource = `
attribute vec2 aPosition;
varying vec2 vUv;

void main() {
  vUv = (aPosition + 1.0) * 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const fragmentShaderSource = `
precision highp float;

varying vec2 vUv;

uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uTime;
uniform float uRefraction;
uniform float uEdgeFade;
uniform float uShimmer;
uniform float uChromaShift;
uniform float uAnimationSpeed;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p = p * 2.03 + vec2(12.4, 7.3);
    amplitude *= 0.52;
  }
  return value;
}

void main() {
  vec2 uv = vUv;
  vec2 centered = uv * 2.0 - 1.0;
  vec2 pointer = uPointer * 2.0 - 1.0;
  float time = uTime * max(uAnimationSpeed, 0.0);

  vec2 drift = vec2(
    fbm(uv * 4.0 + vec2(time * 0.08, -time * 0.05)) - 0.5,
    fbm(uv * 4.0 + vec2(-time * 0.06, time * 0.07)) - 0.5
  );
  vec2 toPointer = pointer - centered;
  float pointerFalloff = exp(-dot(toPointer, toPointer) * 3.6);
  vec2 warp = drift * (uRefraction * 0.0035) + toPointer * pointerFalloff * (uRefraction * 0.0012);

  float distToEdge = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
  float edge = 1.0 - smoothstep(0.0, max(uEdgeFade, 0.001), distToEdge);

  float bandA = fbm((uv + warp) * 7.2 + vec2(0.0, time * 0.08));
  float bandB = fbm((uv - warp.yx * 0.8) * 9.4 + vec2(time * 0.04, 0.0));
  float caustic = smoothstep(0.56, 0.92, bandA * 0.7 + bandB * 0.6);
  caustic = pow(caustic, 2.2) * uShimmer;

  float sheen = smoothstep(-0.35, 0.9, dot(normalize(vec2(-0.35, 0.9)), centered + warp * 18.0));
  float sparkle = smoothstep(0.72, 0.98, fbm((uv + warp * 1.7) * 14.0 - time * 0.03));
  float alpha = clamp(caustic * 0.24 + edge * 0.14 + sparkle * 0.06, 0.0, 0.34);

  vec3 color = vec3(0.0);
  color += vec3(1.0, 0.985, 0.98) * caustic * 0.65;
  color += vec3(1.0) * sheen * edge * 0.22;
  color.r += (caustic + sparkle) * uChromaShift * 0.08;
  color.b += (1.0 - caustic) * uChromaShift * 0.04;

  gl_FragColor = vec4(color, alpha);
}
`;

function shouldUseWebGL(engine: GlassToken["engine"]) {
  if (engine === "fallback") {
    return false;
  }

  if (typeof navigator === "undefined") {
    return engine === "webgl";
  }

  const platform = navigator.platform ?? "";
  const userAgent = navigator.userAgent ?? "";
  const isIOSDevice =
    /iPad|iPhone|iPod/.test(platform) ||
    /iPad|iPhone|iPod/.test(userAgent) ||
    (platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (isIOSDevice) {
    return false;
  }

  return true;
}

function hasWebGLSupport() {
  if (typeof document === "undefined") {
    return false;
  }

  const canvas = document.createElement("canvas");
  return Boolean(
    canvas.getContext("webgl", { alpha: true, antialias: true }) ??
      canvas.getContext("experimental-webgl"),
  );
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) {
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(gl: WebGLRenderingContext) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  if (!vertexShader || !fragmentShader) {
    return null;
  }

  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

function buildInlineBackdropFilter(active: boolean, config?: GlassToken) {
  if (!active) {
    return "none";
  }

  if (!config) {
    return [
      "saturate(calc(var(--glass-fallback-saturation) * 1%))",
      "blur(calc(var(--glass-fallback-blur) * 1px))",
      "contrast(var(--glass-fallback-contrast))",
      "brightness(var(--glass-fallback-brightness))",
    ].join(" ");
  }

  return [
    `saturate(${config.fallbackSaturation}%)`,
    `blur(${config.fallbackBlur}px)`,
    `contrast(${config.fallbackContrast})`,
    `brightness(${config.fallbackBrightness})`,
  ].join(" ");
}

export function GlassHeaderLayer({
  active,
  hairline,
  config,
  className,
}: {
  active: boolean;
  hairline: boolean;
  config?: GlassToken;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef({ x: 0.5, y: 0.5 });
  const [webglSupported, setWebglSupported] = useState(false);
  const [cssConfig, setCssConfig] = useState<GlassToken | null>(null);

  useEffect(() => {
    setWebglSupported(hasWebGLSupport());
  }, []);

  useEffect(() => {
    if (config || !hostRef.current) {
      return;
    }

    setCssConfig(readGlassTokenFromStyles(getComputedStyle(hostRef.current)));
  }, [config, active]);

  const resolvedConfig = useMemo(
    () => normalizeGlassToken(config ?? cssConfig),
    [config, cssConfig],
  );
  const enableWebGL = active && webglSupported && shouldUseWebGL(resolvedConfig.engine);
  const inlineBackdropFilter = useMemo(
    () => buildInlineBackdropFilter(active, config ? resolvedConfig : undefined),
    [active, config, resolvedConfig],
  );
  const layerStyle = useMemo<CSSProperties>(
    () => ({
      backdropFilter: inlineBackdropFilter,
      WebkitBackdropFilter: inlineBackdropFilter,
    }),
    [inlineBackdropFilter],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enableWebGL) {
      return;
    }

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
    });
    if (!gl) {
      return;
    }

    const program = createProgram(gl);
    if (!program) {
      return;
    }

    const positionLocation = gl.getAttribLocation(program, "aPosition");
    const resolutionLocation = gl.getUniformLocation(program, "uResolution");
    const pointerLocation = gl.getUniformLocation(program, "uPointer");
    const timeLocation = gl.getUniformLocation(program, "uTime");
    const refractionLocation = gl.getUniformLocation(program, "uRefraction");
    const edgeFadeLocation = gl.getUniformLocation(program, "uEdgeFade");
    const shimmerLocation = gl.getUniformLocation(program, "uShimmer");
    const chromaShiftLocation = gl.getUniformLocation(program, "uChromaShift");
    const animationSpeedLocation = gl.getUniformLocation(program, "uAnimationSpeed");

    const buffer = gl.createBuffer();
    if (!buffer) {
      gl.deleteProgram(program);
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
        1, -1,
        -1, 1,
        -1, 1,
        1, -1,
        1, 1,
      ]),
      gl.STATIC_DRAW,
    );

    let redrawStatic: (() => void) | undefined;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      redrawStatic?.();
    };

    const updatePointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        return;
      }

      pointerRef.current = {
        x: (event.clientX - rect.left) / rect.width,
        y: 1 - (event.clientY - rect.top) / rect.height,
      };
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", updatePointer, { passive: true });

    gl.useProgram(program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const start = performance.now();
    let frameId = 0;

    const render = (now: number) => {
      if (!reduced) frameId = window.requestAnimationFrame(render);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform2f(pointerLocation, pointerRef.current.x, pointerRef.current.y);
      gl.uniform1f(timeLocation, reduced ? 0 : (now - start) * 0.001);
      gl.uniform1f(refractionLocation, resolvedConfig.refraction);
      gl.uniform1f(edgeFadeLocation, resolvedConfig.edgeFade);
      gl.uniform1f(shimmerLocation, resolvedConfig.shimmer);
      gl.uniform1f(chromaShiftLocation, resolvedConfig.chromaShift);
      gl.uniform1f(animationSpeedLocation, resolvedConfig.animationSpeed);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    if (reduced) redrawStatic = () => render(performance.now());
    frameId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", updatePointer);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, [enableWebGL, resolvedConfig, reduced]);

  return (
    <div
      ref={hostRef}
      data-active={active ? "true" : "false"}
      data-hairline={hairline ? "true" : "false"}
      data-webgl={enableWebGL ? "true" : "false"}
      aria-hidden="true"
      className={cn("rams-public-glass-layer", className)}
      style={layerStyle}
    >
      <canvas ref={canvasRef} className="rams-public-glass-shader" />
    </div>
  );
}

