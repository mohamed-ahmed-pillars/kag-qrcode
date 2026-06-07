import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clickEvents, employees, products, ads } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { sql, count, gte, lte, and, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const conditions = [];
  if (from) conditions.push(gte(clickEvents.createdAt, new Date(from)));
  if (to) conditions.push(lte(clickEvents.createdAt, new Date(to)));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Total clicks by entity type
  const byType = await db
    .select({
      entityType: clickEvents.entityType,
      total: count(),
    })
    .from(clickEvents)
    .where(whereClause)
    .groupBy(clickEvents.entityType);

  // Clicks per day (last 30 days)
  const perDay = await db
    .select({
      date: sql<string>`DATE(${clickEvents.createdAt})`,
      total: count(),
    })
    .from(clickEvents)
    .where(whereClause)
    .groupBy(sql`DATE(${clickEvents.createdAt})`)
    .orderBy(sql`DATE(${clickEvents.createdAt})`);

  // Top employees by clicks
  const topEmployees = await db
    .select({
      entityId: clickEvents.entityId,
      total: count(),
      name: employees.name,
    })
    .from(clickEvents)
    .leftJoin(employees, eq(clickEvents.entityId, employees.id))
    .where(
      and(
        eq(clickEvents.entityType, "employee"),
        ...(conditions.length > 0 ? conditions : [])
      )
    )
    .groupBy(clickEvents.entityId, employees.name)
    .orderBy(sql`count(*) DESC`)
    .limit(5);

  // Top products by clicks
  const topProducts = await db
    .select({
      entityId: clickEvents.entityId,
      total: count(),
      name: products.name,
    })
    .from(clickEvents)
    .leftJoin(products, eq(clickEvents.entityId, products.id))
    .where(
      and(
        eq(clickEvents.entityType, "product"),
        ...(conditions.length > 0 ? conditions : [])
      )
    )
    .groupBy(clickEvents.entityId, products.name)
    .orderBy(sql`count(*) DESC`)
    .limit(5);

  // Top ads by clicks
  const topAds = await db
    .select({
      entityId: clickEvents.entityId,
      total: count(),
      title: ads.title,
    })
    .from(clickEvents)
    .leftJoin(ads, eq(clickEvents.entityId, ads.id))
    .where(
      and(
        eq(clickEvents.entityType, "ad"),
        ...(conditions.length > 0 ? conditions : [])
      )
    )
    .groupBy(clickEvents.entityId, ads.title)
    .orderBy(sql`count(*) DESC`)
    .limit(5);

  return NextResponse.json({ byType, perDay, topEmployees, topProducts, topAds });
}
