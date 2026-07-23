export interface Dot {
  x: number;
  y: number;
  s: number;
}

export interface DotWord {
  dots: Dot[];
  width: number;
  height: number;
}

const FONT: Record<string, string[]> = {
  J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  N: ["10001", "11001", "10101", "10101", "10011", "10001", "10001"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  G: ["01111", "10000", "10000", "10011", "10001", "10001", "01111"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  W: ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
};

const wordCache = new Map<string, DotWord>();

export function getDotWord(word: string): DotWord {
  const cached = wordCache.get(word);
  if (cached) return cached;

  const dot = 1;
  const gap = 0.4;
  const letterGap = 1.2;
  let x = 0;
  const dots: Dot[] = [];

  for (const ch of word) {
    const pattern = FONT[ch];
    if (!pattern) {
      x += (dot + gap) * 3;
      continue;
    }
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 5; c++) {
        if (pattern[r][c] === "1") {
          dots.push({ x: x + c * (dot + gap), y: r * (dot + gap), s: dot });
        }
      }
    }
    x += 5 * (dot + gap) + letterGap;
  }

  const width = x - letterGap;
  const height = 7 * (dot + gap) - gap;
  const result: DotWord = { dots, width, height };
  wordCache.set(word, result);
  return result;
}

let halftoneCache: Dot[] | null = null;

export function getHalftoneDots(): Dot[] {
  if (halftoneCache) return halftoneCache;
  const cx = 75;
  const cy = 65;
  const dots: Dot[] = [];
  for (let gy = 4; gy <= 126; gy += 6) {
    for (let gx = 6; gx <= 144; gx += 6) {
      const dx = gx - cx;
      const dy = (gy - cy) * 1.1;
      const r = Math.sqrt(dx * dx + dy * dy);
      const theta = Math.atan2(dy, dx);
      const rMax = 58 * (0.42 + 0.58 * Math.abs(Math.cos(2.5 * theta)));
      const density = Math.max(0, 1 - r / rMax);
      if (density > 0.08) {
        dots.push({ x: gx, y: gy, s: +(density * 4.2).toFixed(2) });
      }
    }
  }
  halftoneCache = dots;
  return dots;
}
