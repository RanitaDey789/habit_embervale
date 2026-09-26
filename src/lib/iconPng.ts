/**
 * Zero-dependency PNG encoder + Embervale icon painter (TypeScript port).
 * Used by the /icons/* fallback route so PWA icons can never 404, even on
 * deployments where the generated files in public/icons were not committed.
 * Paired with scripts/make-icons.mjs (dev-time generator) — keep in sync.
 */

import { deflateSync } from "node:zlib";

let crcTable: Uint32Array | null = null;
function crc32(buf: Buffer): number {
  if (!crcTable) {
    crcTable = new Uint32Array(256);
    for (let n = 0; n < 256; n += 1) {
      let c = n;
      for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      crcTable[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const t = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}

export function encodePNG(width: number, height: number, rgba: Buffer): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (width * 4 + 1)] = 0;
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const smooth = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};
const hash2 = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const mix = (a: number[], b: number[], t: number) => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

export function paintIcon(size: number): Buffer {
  const px = Buffer.alloc(size * size * 4);
  const aa = 1.6 / size;
  const bgTop = [250, 243, 230];
  const bgBot = [236, 223, 202];
  const ember = [200, 109, 68];
  const gold = [166, 116, 80];
  const core = [255, 239, 205];
  const mBack = [203, 208, 178];
  const mFront = [168, 184, 146];

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const u = (x / (size - 1)) * 2 - 1;
      const v = -((y / (size - 1)) * 2 - 1) + 0.02;
      let col = mix(bgBot, bgTop, clamp((v + 1) / 2, 0, 1));

      const vig = 1 - 0.35 * clamp(Math.hypot(u, v) - 0.55, 0, 1);
      col = [col[0] * vig, col[1] * vig, col[2] * vig];

      const gx = Math.floor((u + 1) * 9);
      const gy = Math.floor((v + 1) * 9);
      const h = hash2(gx, gy);
      if (h > 0.9 && v > 0.15) {
        const sx = ((u + 1) * 9 - gx - 0.5) * 2;
        const sy = ((v + 1) * 9 - gy - 0.5) * 2;
        const d = Math.hypot(sx, sy);
        const tw = 0.35 + 0.65 * hash2(gy, gx);
        const star = smooth(0.35, 0.05, d) * tw;
        col = mix(col, [176, 128, 88], star * 0.5);
      }

      const g = Math.exp(-(Math.hypot(u, v) ** 2) * 5.5);
      col = mix(col, [244, 178, 75], g * 0.3);

      const ringD = Math.abs(Math.hypot(u, v) - 0.66);
      const ring = smooth(aa * 2.2, aa * 0.4, ringD) * 0.95;
      col = mix(col, gold, ring);

      const th = Math.atan2(v, u);
      const rr = Math.hypot(u, v);
      const starR = 0.5 * (0.14 + 0.86 * Math.pow(Math.abs(Math.cos(2 * th)), 2.1));
      const star = smooth(aa * 1.2, -aa * 1.2, rr - starR);
      col = mix(col, mix(ember, core, clamp(1 - rr / 0.5, 0, 1)), star);

      const starR2 = 0.2 * (0.14 + 0.86 * Math.pow(Math.abs(Math.cos(2 * th + Math.PI)), 2.1));
      const star2 = smooth(aa, -aa, rr - starR2);
      col = mix(col, [255, 250, 238], star2 * 0.95);

      const backY = -0.52 + 0.07 * Math.sin(u * 2.3 + 4.1) + 0.04 * Math.sin(u * 5.7);
      const frontY = -0.62 + 0.08 * Math.sin(u * 3.1 + 1.2) + 0.05 * Math.sin(u * 7.3 + 2);
      if (v < backY) col = mix(col, mBack, smooth(aa * 3, -aa * 3, backY - v) * 0.9);
      if (v < frontY) col = mix(col, mFront, smooth(aa * 3, -aa * 3, frontY - v));

      const i = (y * size + x) * 4;
      px[i] = clamp(Math.round(col[0]), 0, 255);
      px[i + 1] = clamp(Math.round(col[1]), 0, 255);
      px[i + 2] = clamp(Math.round(col[2]), 0, 255);
      px[i + 3] = 255;
    }
  }
  return encodePNG(size, size, px);
}
