import { db } from "@/lib/db";
import { ads } from "@/lib/schema";
import { desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { canDelete, canEdit } from "@/lib/rbac";
import type { Role } from "@/lib/schema";
import AdsClient from "./AdsClient";

export default async function AdsPage() {
  const session = await auth();
  const role = session!.user.role as Role;

  const data = await db.select().from(ads).orderBy(desc(ads.createdAt));

  return (
    <AdsClient
      initialData={data}
      canEdit={canEdit(role)}
      canDelete={canDelete(role)}
      appUrl={process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}
    />
  );
}
