import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  decimal,
  timestamp,
  pgEnum,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const roleEnum = pgEnum("role", [
  "super_admin",
  "admin",
  "editor",
  "viewer",
]);

export const entityTypeEnum = pgEnum("entity_type", [
  "employee",
  "product",
  "ad",
  "social_link",
]);

// ─── Users ───────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: roleEnum("role").notNull().default("viewer"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Social Links (main page) ─────────────────────────────────────────────────

export const socialLinks = pgTable("social_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  label: varchar("label", { length: 255 }).notNull(),
  url: text("url").notNull(),
  iconName: varchar("icon_name", { length: 100 }),
  displayOrder: integer("display_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Employees ────────────────────────────────────────────────────────────────

export const employees = pgTable("employees", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }),
  photoUrl: text("photo_url"),
  bio: text("bio"),
  // [{label, url, type: 'phone'|'whatsapp'|'email'|'website'|'instagram'|'other'}]
  actionLinks: jsonb("action_links").notNull().default([]),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Products ─────────────────────────────────────────────────────────────────

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("USD"),
  // [{url, alt}]
  images: jsonb("images").notNull().default([]),
  category: varchar("category", { length: 255 }),
  ctaText: varchar("cta_text", { length: 100 }),
  ctaUrl: text("cta_url"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Ads / Promotions ─────────────────────────────────────────────────────────

export const ads = pgTable("ads", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  ctaText: varchar("cta_text", { length: 100 }),
  ctaUrl: text("cta_url"),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Click Events (analytics) ─────────────────────────────────────────────────

export const clickEvents = pgTable(
  "click_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    entityType: entityTypeEnum("entity_type").notNull(),
    entityId: uuid("entity_id").notNull(),
    ipHash: varchar("ip_hash", { length: 64 }),
    userAgent: text("user_agent"),
    referrer: text("referrer"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("click_events_entity_idx").on(table.entityType, table.entityId),
    index("click_events_created_at_idx").on(table.createdAt),
  ]
);

// ─── Types ────────────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type SocialLink = typeof socialLinks.$inferSelect;
export type NewSocialLink = typeof socialLinks.$inferInsert;
export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Ad = typeof ads.$inferSelect;
export type NewAd = typeof ads.$inferInsert;
export type ClickEvent = typeof clickEvents.$inferSelect;
export type Role = (typeof roleEnum.enumValues)[number];
export type EntityType = (typeof entityTypeEnum.enumValues)[number];

export type ActionLink = {
  label: string;
  url: string;
  type: "phone" | "whatsapp" | "email" | "website" | "instagram" | "other";
};

export type ProductImage = {
  url: string;
  alt?: string;
};
