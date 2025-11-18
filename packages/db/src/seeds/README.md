# Database Seeds

This folder contains database seeding scripts that can be run independently to populate the database with initial data.

## Available Seeds

### Categories (`categories.ts` / `categories.sql`)
Seeds the `item_categories` table with initial lost and found item categories.

## Running Seeds

### Option 1: Use npm scripts (recommended)
```bash
# Run categories seed
bun run seed:categories

# Run all seeds
bun run seed:all

# Run any specific seed
bun run seed <seed-name>
```

### Option 2: Run individual TypeScript seeds directly
```bash
# Run categories seed only
bun run src/seeds/categories.ts

# Run all seeds
bun run src/seeds/index.ts

# Run with the seed runner
bun run src/seeds/run-seed.ts categories
```

### Option 3: Run SQL files directly
```bash
# Using psql
psql $DATABASE_URL -f src/seeds/categories.sql

# Using any PostgreSQL client
# The SQL files are designed to be run independently
```

### Option 4: Check seed status
```bash
# Check which seeds have been run
bun run seed:check
```

## Adding New Seeds

1. Create a new TypeScript file in this folder (e.g., `users.ts`)
2. Export a seed function that can be imported
3. Add the seed to `index.ts` to include it in the "run all" script
4. Optionally create a corresponding SQL file for direct execution
5. Add a new npm script to `package.json` if desired

## Notes

- Seeds are designed to be idempotent (safe to run multiple times)
- They check for existing data before inserting
- SQL files use `ON CONFLICT DO NOTHING` where appropriate
- All seeds use the `DATABASE_URL` environment variable