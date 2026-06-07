import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { canDelete, canEdit } from "@/lib/rbac";
import type { Role } from "@/lib/schema";
import ProductsClient from "./ProductsClient";

export default async function ProductsPage() {
  const session = await auth();
  const role = session!.user.role as Role;

  const data = await db
    .select()
    .from(products)
    .orderBy(desc(products.createdAt));

  return (
    <ProductsClient
      initialData={data}
      canEdit={canEdit(role)}
      canDelete={canDelete(role)}
      appUrl={process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}
    />
  );
}
