-- Add support for multiple images per lost item
-- This migration creates a new item_images table and migrates existing single images

-- Create the new item_images table
CREATE TABLE "item_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"url" text NOT NULL,
	"key" text NOT NULL,
	"filename" varchar(255) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"size" integer NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"uploaded_by_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraints
ALTER TABLE "item_images" ADD CONSTRAINT "item_images_item_id_lost_items_id_fk" 
	FOREIGN KEY ("item_id") REFERENCES "public"."lost_items"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "item_images" ADD CONSTRAINT "item_images_uploaded_by_id_users_id_fk" 
	FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

-- Create indexes for performance
CREATE INDEX "item_images_item_id_idx" ON "item_images" USING btree ("item_id");
CREATE INDEX "item_images_display_order_idx" ON "item_images" USING btree ("item_id","display_order");

-- Migrate existing single images to the new table
-- Only migrate items that have both image_url and image_key
INSERT INTO "item_images" (
	"item_id", 
	"url", 
	"key", 
	"filename", 
	"mime_type", 
	"size", 
	"display_order", 
	"uploaded_by_id", 
	"created_at", 
	"updated_at"
)
SELECT 
	id,
	image_url,
	image_key,
	COALESCE(SUBSTRING(image_key FROM '[^/]+$'), 'unknown.jpg') as filename,
	CASE 
		WHEN image_key LIKE '%.jpg' OR image_key LIKE '%.jpeg' THEN 'image/jpeg'
		WHEN image_key LIKE '%.png' THEN 'image/png'
		WHEN image_key LIKE '%.webp' THEN 'image/webp'
		ELSE 'image/jpeg'
	END as mime_type,
	0 as size, -- We don't have size info for existing images
	0 as display_order,
	created_by_id,
	created_at,
	updated_at
FROM lost_items 
WHERE image_url IS NOT NULL AND image_key IS NOT NULL;

-- Remove the old single image columns from lost_items table
ALTER TABLE "lost_items" DROP COLUMN IF EXISTS "image_url";
ALTER TABLE "lost_items" DROP COLUMN IF EXISTS "image_key";