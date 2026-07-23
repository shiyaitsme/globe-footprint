import { CanvasTexture, LinearFilter, RepeatWrapping } from "three";

export interface GasGiantOptions {
  palette: string[];
  seed?: number;
  turbulence?: number;
  vortex?: boolean;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

const cache = new Map<string, CanvasTexture>();

export function generateGasGiantTexture(options: GasGiantOptions): CanvasTexture {
  const { palette, seed = 1, turbulence = 0.6, vortex = false } = options;
  const cacheKey = JSON.stringify(options);
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const width = 512;
  const height = 256;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const rand = mulberry32(seed);

  const stops = palette.map((color, i) => ({
    offset: palette.length === 1 ? 0.5 : i / (palette.length - 1),
    rgb: hexToRgb(color),
  }));

  const colorAt = (t: number): [number, number, number] => {
    let i = 0;
    for (; i < stops.length - 2; i++) {
      if (t <= stops[i + 1].offset) break;
    }
    const a = stops[i];
    const b = stops[Math.min(i + 1, stops.length - 1)];
    const span = b.offset - a.offset || 1;
    const localT = smoothstep(Math.min(1, Math.max(0, (t - a.offset) / span)));
    return [
      a.rgb[0] + (b.rgb[0] - a.rgb[0]) * localT,
      a.rgb[1] + (b.rgb[1] - a.rgb[1]) * localT,
      a.rgb[2] + (b.rgb[2] - a.rgb[2]) * localT,
    ];
  };

  const freqs = [1, 2, 3, 5, 8];
  const phases = freqs.map(() => rand() * Math.PI * 2);

  const image = ctx.createImageData(width, height);
  for (let y = 0; y < height; y++) {
    const v = y / height;
    for (let x = 0; x < width; x++) {
      const u = x / width;

      let warp = 0;
      for (let o = 0; o < freqs.length; o++) {
        warp += Math.sin(u * Math.PI * 2 * freqs[o] + phases[o] + v * 6) / freqs[o];
      }
      warp *= turbulence * 0.045;

      let flow = 0;
      for (let o = 0; o < 3; o++) {
        flow += Math.sin(u * Math.PI * 2 * freqs[o] * 2 + v * (10 + o * 4) + phases[o] * 1.3) * (0.02 / (o + 1));
      }

      let t = v + warp + flow;

      if (vortex) {
        const cx = 0.5;
        const cy = 0.16;
        const dx = u - cx;
        const dy = (v - cy) * 2.2;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        const swirlStrength = Math.max(0, 1 - dist * 2.6);
        t += Math.sin(angle * 3 + dist * 9) * swirlStrength * 0.18;
      }

      t = Math.min(1, Math.max(0, t));
      const [r, g, b] = colorAt(t);
      const grain = (rand() - 0.5) * 5;

      const idx = (y * width + x) * 4;
      image.data[idx] = Math.min(255, Math.max(0, r + grain));
      image.data[idx + 1] = Math.min(255, Math.max(0, g + grain));
      image.data[idx + 2] = Math.min(255, Math.max(0, b + grain));
      image.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.minFilter = LinearFilter;
  texture.needsUpdate = true;
  cache.set(cacheKey, texture);
  return texture;
}
