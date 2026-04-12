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

  // Create sample social links
  const existingLinks = await db.select().from(socialLinks).limit(1);
  if (existingLinks.length === 0) {
    await db.insert(socialLinks).values([
      {
        label: "Instagram",
        url: "https://instagram.com/kagegypt",
        iconName: "instagram",
        displayOrder: 1,
        active: true,
      },
      {
        label: "Facebook",
        url: "https://facebook.com/kagegypt",
        iconName: "facebook",
        displayOrder: 2,
        active: true,
      },
      {
        label: "WhatsApp",
        url: "https://wa.me/1234567890",
        iconName: "message-circle",
        displayOrder: 3,
        active: true,
      },
      {
        label: "Website",
        url: "https://kagegypt.com",
        iconName: "globe",
        displayOrder: 4,
        active: true,
      },
    ]);
    console.log("✅ Sample social links created");
  }

  console.log("✅ Seed complete");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
