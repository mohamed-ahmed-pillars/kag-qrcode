/**
 * Branded QR Code Generator — Instagram Style
 *
 * Produces a clean QR code with:
 *  1. Rounded corners on finder patterns (Instagram-style)
 *  2. Rounded dots for data modules
 *  3. White background with padding
 */

import QRCodeLib from "qrcode";
import sharp from "sharp";

interface BrandedQROptions {
  url: string;
  /** QR code inner size in pixels. Default 1024 */
  size?: number;
  /** Error correction level. Default H */
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  /** Generate grayscale QR code. Default false */
  grayscale?: boolean;
}

// ─── QR matrix ────────────────────────────────────────────────────────────────

interface QRMatrix { size: number; isDark(r: number, c: number): boolean }

function getQRMatrix(url: string, ecLevel: "L" | "M" | "Q" | "H"): QRMatrix {
  const qr = QRCodeLib.create(url, { errorCorrectionLevel: ecLevel });
  const { data, size } = qr.modules;
  return { size, isDark: (r, c) => data[r * size + c] !== 0 };
}

function isInFinder(row: number, col: number, sz: number): boolean {
  return (row < 7 && col < 7) ||
    (row < 7 && col >= sz - 7) ||
    (row >= sz - 7 && col < 7);
}

// ─── QR SVG builder with Instagram-style rounded corners ────────────────────

function buildQRSVG(matrix: QRMatrix, qrSize: number): string {
  const sz = matrix.size;
  const margin = Math.round(qrSize * 0.08); // More margin for cleaner look
  const inner = qrSize - margin * 2;
  const cell = inner / sz;
  const dotRadius = cell * 0.45; // Rounded dots

  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${qrSize}" height="${qrSize}" viewBox="0 0 ${qrSize} ${qrSize}">`,
    `<rect width="${qrSize}" height="${qrSize}" fill="white"/>`,
  ];

  // Instagram-style rounded finder patterns (position detection patterns)
  const finderOrigins = [
    { r: 0, c: 0 }, { r: 0, c: sz - 7 }, { r: sz - 7, c: 0 },
  ];

  for (const { r: fr, c: fc } of finderOrigins) {
    const fx = margin + fc * cell;
    const fy = margin + fr * cell;
    const outer = 7 * cell;
    const cornerRadius = outer * 0.25; // Rounded corners

    // Outer rounded square (black)
    parts.push(`<rect x="${fx.toFixed(2)}" y="${fy.toFixed(2)}" width="${outer.toFixed(2)}" height="${outer.toFixed(2)}" rx="${cornerRadius.toFixed(2)}" fill="black"/>`);

    // White ring (1-cell inset)
    const whiteInset = cell;
    const whiteSize = 5 * cell;
    const whiteRadius = whiteSize * 0.22;
    parts.push(`<rect x="${(fx + whiteInset).toFixed(2)}" y="${(fy + whiteInset).toFixed(2)}" width="${whiteSize.toFixed(2)}" height="${whiteSize.toFixed(2)}" rx="${whiteRadius.toFixed(2)}" fill="white"/>`);

    // Inner rounded square (3×3, black)
    const innerInset = 2 * cell;
    const innerSize = 3 * cell;
    const innerRadius = innerSize * 0.28;
    parts.push(`<rect x="${(fx + innerInset).toFixed(2)}" y="${(fy + innerInset).toFixed(2)}" width="${innerSize.toFixed(2)}" height="${innerSize.toFixed(2)}" rx="${innerRadius.toFixed(2)}" fill="black"/>`);
  }

  // Data modules — rounded dots instead of squares
  for (let row = 0; row < sz; row++) {
    for (let col = 0; col < sz; col++) {
      if (!matrix.isDark(row, col) || isInFinder(row, col, sz)) continue;
      const cx = margin + col * cell + cell / 2;
      const cy = margin + row * cell + cell / 2;
      parts.push(`<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${dotRadius.toFixed(2)}" fill="black"/>`);
    }
  }

  parts.push(`</svg>`);
  return parts.join("");
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function generateBrandedQR(options: BrandedQROptions): Promise<Buffer> {
  const {
    url,
    size = 1024,
    errorCorrectionLevel = "H",
  } = options;

  const matrix = getQRMatrix(url, errorCorrectionLevel);
  const qrSvg = buildQRSVG(matrix, size);
  return sharp(Buffer.from(qrSvg)).png().toBuffer();
}
