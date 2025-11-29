import { pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  published: boolean('published').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});