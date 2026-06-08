import { db } from "./db";
import { users, socialLinks } from "./schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding database...");

  // Create super admin
  const existing = await db.query.users.findFirst({
    where: eq(users.email, "admin@kagegypt.com"),
  });

  if (!existing) {
    const passwordHash = await bcrypt.hash("Admin@123!", 12);
    await db.insert(users).values({
      name: "Super Admin",
      email: "admin@kagegypt.com",
      passwordHash,
      role: "super_admin",
      active: true,
    });
    console.log("✅ Super admin created: admin@kagegypt.com / Admin@123!");
  } else {
    console.log("ℹ️  Super admin already exists");
  }

  // Reset social links to the canonical KAG set (always rebuilds on seed)
  await db.delete(socialLinks);
  await db.insert(socialLinks).values([
    {
      label: "Website",
      url: "https://www.kagegypt.com",
      iconName: "globe",
      displayOrder: 1,
      active: true,
    },
    {
      label: "Facebook",
      url: "https://www.facebook.com/share/1DNJqy7Bou/?mibextid=wwXIfr",
      iconName: "facebook",
      displayOrder: 2,
      active: true,
    },
    {
      label: "Instagram",
      url: "https://www.instagram.com/kag.egypt",
      iconName: "instagram",
      displayOrder: 3,
      active: true,
    },
    {
      label: "LinkedIn",
      url: "https://www.linkedin.com/company/kagegypt/",
      iconName: "linkedin",
      displayOrder: 4,
      active: true,
    },
    {
      label: "WhatsApp",
      url: "https://wa.me/201033322050",
      iconName: "whatsapp",
      displayOrder: 5,
      active: true,
    },
    {
      label: "E-mail",
      url: "mailto:wecare@kagegypt.com",
      iconName: "mail",
      displayOrder: 6,
      active: true,
    },
  ]);
  console.log("✅ Social links reset to KAG canonical set");

  console.log("✅ Seed complete");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
