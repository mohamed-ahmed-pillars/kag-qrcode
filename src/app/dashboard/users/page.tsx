import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canManageUsers } from "@/lib/rbac";
import type { Role } from "@/lib/schema";
import UsersClient from "./UsersClient";

export default async function UsersPage() {
  const session = await auth();
  if (!session || !canManageUsers(session.user.role as Role)) {
    redirect("/dashboard");
  }

  return <UsersClient currentUserId={session.user.id} />;
}
