-- Add security questions and privacy controls for lost items
-- This migration adds the security_questions table and privacy control columns

-- Create question_type enum
CREATE TYPE "public"."question_type" AS ENUM('multiple_choice', 'free_text');

-- Create security_questions table
CREATE TABLE "security_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"question_text" text NOT NULL,
	"question_type" "question_type" NOT NULL,
	"options" text[],
	"encrypted_answer" text NOT NULL,
	"iv" text NOT NULL,
	"auth_tag" text NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_by_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add privacy control columns to lost_items
ALTER TABLE "lost_items" ADD COLUMN "hide_location" boolean DEFAULT false NOT NULL;
ALTER TABLE "lost_items" ADD COLUMN "hide_date_found" boolean DEFAULT false NOT NULL;

-- Add foreign key constraints
ALTER TABLE "security_questions" ADD CONSTRAINT "security_questions_item_id_lost_items_id_fk" 
	FOREIGN KEY ("item_id") REFERENCES "public"."lost_items"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "security_questions" ADD CONSTRAINT "security_questions_created_by_id_users_id_fk" 
	FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

-- Create indexes for performance
CREATE INDEX "security_questions_item_id_idx" ON "security_questions" USING btree ("item_id");
CREATE INDEX "security_questions_display_order_idx" ON "security_questions" USING btree ("item_id","display_order");
