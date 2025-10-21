import { integer, pgTable, varchar, text, jsonb } from 'drizzle-orm/pg-core';

export const agentsTable = pgTable('agents', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  description: text().notNull(),
  prompt: text().notNull(),
  tools: jsonb(),
  slug: text(),
  forked_from: integer(),
});
