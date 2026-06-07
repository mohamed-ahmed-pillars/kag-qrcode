import { db } from "@/lib/db";
import { employees } from "@/lib/schema";
import { desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { canDelete, canEdit } from "@/lib/rbac";
import type { Role } from "@/lib/schema";
import EmployeesClient from "./EmployeesClient";

export default async function EmployeesPage() {
  const session = await auth();
  const role = session!.user.role as Role;

  const data = await db
    .select()
    .from(employees)
    .orderBy(desc(employees.createdAt));

  return (
    <EmployeesClient
      initialData={data}
      canEdit={canEdit(role)}
      canDelete={canDelete(role)}
      appUrl={process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}
    />
  );
}
