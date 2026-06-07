import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { socialLinks } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { canEdit, canDelete } from "@/lib/rbac";
import { eq } from "drizzle-orm";
import type { Role } from "@/lib/schema";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canEdit(session.user.role as Role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const [updated] = await db
    .update(socialLinks)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(socialLinks.id, id))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canDelete(session.user.role as Role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await db.delete(socialLinks).where(eq(socialLinks.id, id));
  return NextResponse.json({ ok: true });
}
