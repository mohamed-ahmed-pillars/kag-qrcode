import { db } from "@/lib/db";
import { socialLinks } from "@/lib/schema";
import { asc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { canDelete, canEdit } from "@/lib/rbac";
import type { Role } from "@/lib/schema";
import SocialLinksClient from "./SocialLinksClient";

export default async function SocialLinksPage() {
  const session = await auth();
  const role = session!.user.role as Role;

  const data = await db
    .select()
    .from(socialLinks)
    .orderBy(asc(socialLinks.displayOrder));

  return (
    <SocialLinksClient
      initialData={data}
      canEdit={canEdit(role)}
      canDelete={canDelete(role)}
    />
  );
}
