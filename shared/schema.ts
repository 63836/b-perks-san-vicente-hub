import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  phoneNumber: text("phone_number").notNull(),
  points: integer("points").notNull().default(0),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  pointsCost: integer("points_cost").notNull(),
  imageUrl: text("image_url"),
  isAvailable: boolean("is_available").notNull().default(true),
  category: text("category").notNull(),
  totalQuantity: integer("total_quantity").notNull().default(1),
  availableQuantity: integer("available_quantity").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const rewardClaims = pgTable("reward_claims", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  rewardId: integer("reward_id").notNull(),
  claimCode: text("claim_code").notNull().unique(),
  status: text("status").notNull().default("unclaimed"), // unclaimed, claimed, expired
  claimedAt: timestamp("claimed_at").defaultNow(),
  verifiedAt: timestamp("verified_at"),
  verifiedBy: integer("verified_by"),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  locationLat: real("location_lat"),
  locationLng: real("location_lng"),
  pointsReward: integer("points_reward").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const eventParticipants = pgTable("event_participants", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  userId: integer("user_id").notNull(),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  proofType: text("proof_type"), // image, video
  proofUrl: text("proof_url"),
  proofFileName: text("proof_file_name"),
  proofFileSize: integer("proof_file_size"),
  submittedAt: timestamp("submitted_at"),
  status: text("status").notNull().default("registered"), // registered, participated, approved, declined
  pointsAwarded: integer("points_awarded"),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: integer("reviewed_by"),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  locationAddress: text("location_address").notNull(),
  locationLat: real("location_lat"),
  locationLng: real("location_lng"),
  imageUrl: text("image_url"),
  status: text("status").notNull().default("pending"), // pending, reviewed, resolved
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: integer("reviewed_by"),
  resolvedAt: timestamp("resolved_at"),
});

export const newsAlerts = pgTable("news_alerts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // news, alert, announcement
  imageUrl: text("image_url"),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
  authorId: integer("author_id").notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // earned, redeemed
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  eventId: integer("event_id"),
  rewardId: integer("reward_id"),
  claimId: integer("claim_id"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  age: true,
  phoneNumber: true,
});

export const insertRewardSchema = createInsertSchema(rewards).pick({
  title: true,
  description: true,
  pointsCost: true,
  imageUrl: true,
  category: true,
  totalQuantity: true,
  availableQuantity: true,
});

export const insertEventSchema = createInsertSchema(events).pick({
  title: true,
  description: true,
  location: true,
  locationLat: true,
  locationLng: true,
  pointsReward: true,
  startDate: true,
  endDate: true,
  imageUrl: true,
});

export const insertReportSchema = createInsertSchema(reports).pick({
  title: true,
  description: true,
  locationAddress: true,
  locationLat: true,
  locationLng: true,
  imageUrl: true,
});

export const insertNewsAlertSchema = createInsertSchema(newsAlerts).pick({
  title: true,
  content: true,
  type: true,
  imageUrl: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertReward = z.infer<typeof insertRewardSchema>;
export type Reward = typeof rewards.$inferSelect;
export type RewardClaim = typeof rewardClaims.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
export type EventParticipant = typeof eventParticipants.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertNewsAlert = z.infer<typeof insertNewsAlertSchema>;
export type NewsAlert = typeof newsAlerts.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
