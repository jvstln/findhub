-- Seed initial categories
-- This file can be run directly with psql or any PostgreSQL client

INSERT INTO "item_categories" ("name", "description") VALUES
	('Electronics', 'Electronic devices and accessories'),
	('Clothing', 'Clothing items and apparel'),
	('Accessories', 'Personal accessories and jewelry'),
	('Books', 'Books, notebooks, and reading materials'),
	('Keys', 'Keys and keychains'),
	('Cards', 'ID cards, credit cards, and passes'),
	('Bags', 'Bags, backpacks, and luggage'),
	('Other', 'Other miscellaneous items')
ON CONFLICT (name) DO NOTHING;