import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { employees } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { canEdit } from "@/lib/rbac";
import { desc } from "drizzle-orm";
import type { Role } from "@/lib/schema";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.select().from(employees).orderBy(desc(employees.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canEdit(session.user.role as Role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const [employee] = await db.insert(employees).values(body).returning();
  return NextResponse.json(employee, { status: 201 });
}
