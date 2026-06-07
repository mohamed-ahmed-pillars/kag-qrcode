import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { canManageUsers } from "@/lib/rbac";
import { eq } from "drizzle-orm";
import type { Role } from "@/lib/schema";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageUsers(session.user.role as Role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { role, active } = await req.json();

  // Prevent self-demotion
  if (session.user.id === id && role !== "super_admin") {
    return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
  }

  const [updated] = await db
    .update(users)
    .set({ role, active, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      active: users.active,
    });

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageUsers(session.user.role as Role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  if (session.user.id === id) {
    return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
  }

  await db.delete(users).where(eq(users.id, id));
  return NextResponse.json({ ok: true });
}
