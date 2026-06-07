import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { socialLinks } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { canEdit } from "@/lib/rbac";
import { asc } from "drizzle-orm";
import type { Role } from "@/lib/schema";

export async function GET() {
  const rows = await db
    .select()
    .from(socialLinks)
    .orderBy(asc(socialLinks.displayOrder));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canEdit(session.user.role as Role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const [link] = await db.insert(socialLinks).values(body).returning();
  return NextResponse.json(link, { status: 201 });
}
