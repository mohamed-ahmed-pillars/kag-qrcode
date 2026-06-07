import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { auth } from "@/lib/auth";
import { generateBrandedQR } from "@/lib/qrcode-branded";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  const format = searchParams.get("format") || "png"; // png | svg | branded
  const size = parseInt(searchParams.get("size") || "1024", 10);
  const grayscale = searchParams.get("grayscale") === "1";

  if (!url)
    return NextResponse.json({ error: "url is required" }, { status: 400 });

  // ── Branded: brand-colored dots + centered logo ───────────────────────────
  if (format === "branded") {
    try {
      const buffer = await generateBrandedQR({ url, size, grayscale });
      return new NextResponse(buffer as unknown as BodyInit, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "no-store", // don't cache branded (logo may change)
          "Content-Disposition": `attachment; filename="qrcode-branded.png"`,
        },
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to generate branded QR";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  // ── SVG ──────────────────────────────────────────────────────────────────
  if (format === "svg") {
    const svg = await QRCode.toString(url, {
      type: "svg",
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  // ── PNG (plain) ───────────────────────────────────────────────────────────
  const buffer = await QRCode.toBuffer(url, {
    type: "png",
    margin: 2,
    width: 400,
    color: { dark: "#000000", light: "#ffffff" },
  });

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
      "Content-Disposition": `attachment; filename="qrcode.png"`,
    },
  });
}
