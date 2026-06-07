import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clickEvents } from "@/lib/schema";
import type { EntityType } from "@/lib/schema";
import crypto from "crypto";

const VALID_TYPES: EntityType[] = ["employee", "product", "ad", "social_link"];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  const { type, id } = await params;

  if (!VALID_TYPES.includes(type as EntityType)) {
    return NextResponse.json({ error: "Invalid entity type" }, { status: 400 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const ipHash = crypto.createHash("sha256").update(ip).digest("hex");
  const userAgent = req.headers.get("user-agent") || undefined;
  const referrer = req.headers.get("referer") || undefined;

  await db.insert(clickEvents).values({
    entityType: type as EntityType,
    entityId: id,
    ipHash,
    userAgent,
    referrer,
  });

  return NextResponse.json({ ok: true });
}
