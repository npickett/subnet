import { integer, pgTable, varchar, text, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const agentsTable = pgTable('agents', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  description: text().notNull(),
  prompt: text().notNull(),
  tools: jsonb(),
  slug: text(),
  forked_from: integer(),
});

export const reviewsTable = pgTable('reviews', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  agent_id: integer().notNull(),
  author_name: varchar({ length: 255 }).notNull(),
  rating: integer().notNull(),
  comment: text(),
  created_at: timestamp().notNull().defaultNow(),
});
