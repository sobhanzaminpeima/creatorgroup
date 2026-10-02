// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
export const inquiries=sqliteTable('inquiries',{
 id:text('id').primaryKey(),name:text('name').notNull(),company:text('company').notNull(),email:text('email').notNull(),phone:text('phone').notNull(),country:text('country').notNull(),industry:text('industry').notNull(),interest:text('interest').notNull(),message:text('message').notNull(),language:text('language').notNull(),createdAt:integer('created_at').notNull()
});
export const internationalRequests=sqliteTable('international_requests',{
 id:text('id').primaryKey(),code:text('code').notNull(),keyHash:text('key_hash').notNull(),name:text('name').notNull(),email:text('email').notNull(),phone:text('phone').notNull(),country:text('country').notNull(),service:text('service').notNull(),destination:text('destination').notNull(),method:text('method').notNull(),contactTime:text('contact_time').notNull(),message:text('message').notNull(),details:text('details').notNull(),files:text('files').notNull(),consent:integer('consent').notNull(),medicalConsent:integer('medical_consent').notNull(),language:text('language').notNull(),status:text('status').notNull().default('received'),createdAt:integer('created_at').notNull()
},t=>[uniqueIndex('international_requests_code_unique').on(t.code)]);
