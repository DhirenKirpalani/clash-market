import { pgTable, text, serial, integer, boolean, timestamp, json, doublePrecision, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address").unique(),
  avatar: text("avatar"),
  bio: text("bio"),
  arenaTokens: integer("arena_tokens").default(0),
  xp: integer("xp").default(0),
  role: text("role").default('user').notNull(), // 'user', 'admin', 'moderator' 
  createdAt: timestamp("created_at").defaultNow(),
});

// Matches table
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  matchCode: text("match_code").notNull().unique(),
  status: text("status").notNull().default('pending'), // pending, active, completed, cancelled
  player1Id: integer("player1_id").notNull().references(() => users.id),
  player2Id: integer("player2_id").references(() => users.id),
  player1Pnl: doublePrecision("player1_pnl").default(0),
  player2Pnl: doublePrecision("player2_pnl").default(0),
  market: text("market").notNull(),
  duration: integer("duration").notNull().default(1800), // in seconds, default 30 minutes
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  winnerId: integer("winner_id").references(() => users.id),
  isGroupMatch: boolean("is_group_match").default(false),
  spectators: json("spectators").default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

// Positions table
export const positions = pgTable("positions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  matchId: integer("match_id").references(() => matches.id),
  market: text("market").notNull(),
  direction: text("direction").notNull(), // long, short
  size: doublePrecision("size").notNull(),
  leverage: integer("leverage").notNull(),
  entryPrice: doublePrecision("entry_price").notNull(),
  exitPrice: doublePrecision("exit_price"),
  pnl: doublePrecision("pnl"),
  status: text("status").notNull().default('open'), // open, closed
  openTime: timestamp("open_time").defaultNow(),
  closeTime: timestamp("close_time"),
});

// Activities table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").references(() => matches.id),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(), // open_position, close_position, match_started, etc.
  details: json("details").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reels table
export const reels = pgTable("reels", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  matchId: integer("match_id").references(() => matches.id),
  videoUrl: text("video_url").notNull(),
  caption: text("caption"),
  likes: integer("likes").default(0),
  views: integer("views").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Follows table
export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull().references(() => users.id),
  followingId: integer("following_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    followerFollowingIdx: uniqueIndex("follower_following_idx").on(
      table.followerId,
      table.followingId
    ),
  };
});

// Leaderboard entries table
export const leaderboard = pgTable("leaderboard", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  rank: integer("rank"),
  wins: integer("wins").default(0),
  losses: integer("losses").default(0),
  totalMatches: integer("total_matches").default(0),
  totalPnl: doublePrecision("total_pnl").default(0),
  points: integer("points").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Feature flags table
export const featureFlags = pgTable("feature_flags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  enabled: boolean("enabled").default(false).notNull(),
  category: text("category").notNull(), // 'trading', 'game_mode', 'social', 'system'
  configValue: json("config_value").default({}), // For additional configuration data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// System metrics table
export const systemMetrics = pgTable("system_metrics", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  value: doublePrecision("value"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  arenaTokens: true,
  xp: true,
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  createdAt: true,
  player1Pnl: true,
  player2Pnl: true,
  startTime: true,
  endTime: true,
  winnerId: true,
  spectators: true,
});

export const insertPositionSchema = createInsertSchema(positions).omit({
  id: true,
  pnl: true,
  exitPrice: true,
  closeTime: true,
  openTime: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export const insertReelSchema = createInsertSchema(reels).omit({
  id: true,
  createdAt: true,
  likes: true,
  views: true,
});

export const insertFollowSchema = createInsertSchema(follows).omit({
  id: true,
  createdAt: true,
});

export const insertFeatureFlagSchema = createInsertSchema(featureFlags).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSystemMetricSchema = createInsertSchema(systemMetrics).omit({
  id: true,
  timestamp: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Match = typeof matches.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;

export type Position = typeof positions.$inferSelect;
export type InsertPosition = z.infer<typeof insertPositionSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Reel = typeof reels.$inferSelect;
export type InsertReel = z.infer<typeof insertReelSchema>;

export type Follow = typeof follows.$inferSelect;
export type InsertFollow = z.infer<typeof insertFollowSchema>;

export type LeaderboardEntry = typeof leaderboard.$inferSelect;

export type FeatureFlag = typeof featureFlags.$inferSelect;
export type InsertFeatureFlag = z.infer<typeof insertFeatureFlagSchema>;

export type SystemMetric = typeof systemMetrics.$inferSelect;
export type InsertSystemMetric = z.infer<typeof insertSystemMetricSchema>;
