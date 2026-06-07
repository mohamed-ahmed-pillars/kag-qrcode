import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ads } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { canEdit } from "@/lib/rbac";
import { desc } from "drizzle-orm";
import type { Role } from "@/lib/schema";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.select().from(ads).orderBy(desc(ads.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canEdit(session.user.role as Role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const [ad] = await db.insert(ads).values(body).returning();
  return NextResponse.json(ad, { status: 201 });
}
