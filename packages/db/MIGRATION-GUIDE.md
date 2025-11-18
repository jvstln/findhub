# Database Migration Guide

## Security Questions and Privacy Controls Migration

This guide covers the migration for adding security questions and privacy controls to the FindHub system.

### Migration: 0004_add_security_questions_and_privacy

**What it does:**
- Creates `question_type` enum with values: `multiple_choice`, `free_text`
- Creates `security_questions` table with encryption fields
- Adds `hide_location` and `hide_date_found` columns to `lost_items` table
- Creates appropriate indexes for performance
- Sets up foreign key constraints with cascade delete

### Running the Migration

1. **Generate encryption key** (first time only):
   ```bash
   bun run scripts/generate-encryption-key.ts
   ```
   
   Add the generated key to your `.env` file:
   ```
   ENCRYPTION_KEY=your_generated_64_character_hex_key
   ```

2. **Run the migration**:
   ```bash
   bun run db:migrate
   ```

3. **Verify the migration**:
   ```bash
   bun run db:studio
   ```
   
   Check that:
   - `security_questions` table exists
   - `lost_items` table has `hide_location` and `hide_date_found` columns
   - `question_type` enum is created
   - Indexes are created on `security_questions`

### Schema Changes

#### New Table: security_questions

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| item_id | integer | Foreign key to lost_items (cascade delete) |
| question_text | text | The security question |
| question_type | question_type | Enum: multiple_choice or free_text |
| options | text[] | Array of options (for multiple choice) |
| encrypted_answer | text | Encrypted answer data |
| iv | text | Initialization vector for AES-GCM |
| auth_tag | text | Authentication tag for AES-GCM |
| display_order | integer | Order for displaying questions |
| created_by_id | text | Foreign key to users (cascade delete) |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

**Indexes:**
- `security_questions_item_id_idx` on `item_id`
- `security_questions_display_order_idx` on `(item_id, display_order)`

#### Modified Table: lost_items

**New Columns:**
- `hide_location` (boolean, default: false) - Hide location from public users
- `hide_date_found` (boolean, default: false) - Hide date found from public users

### Rollback

If you need to rollback this migration:

```sql
-- Remove privacy control columns
ALTER TABLE lost_items DROP COLUMN IF EXISTS hide_location;
ALTER TABLE lost_items DROP COLUMN IF EXISTS hide_date_found;

-- Drop security_questions table
DROP TABLE IF EXISTS security_questions;

-- Drop question_type enum
DROP TYPE IF EXISTS question_type;
```

### Security Considerations

1. **Encryption Key**: The `ENCRYPTION_KEY` must be:
   - 32 bytes (64 hex characters)
   - Generated using a cryptographically secure random generator
   - Stored securely (e.g., AWS Secrets Manager, environment variables)
   - Never committed to version control

2. **Key Rotation**: If you need to rotate the encryption key:
   - Generate a new key
   - Decrypt all existing answers with the old key
   - Re-encrypt with the new key
   - Update the environment variable

3. **Backup**: Always backup your database before running migrations, especially in production.

### Testing the Migration

After running the migration, you can test it with:

```bash
bun run packages/db/src/check-schema.ts
```

This will verify that:
- `security_questions` table exists
- `hide_location` column exists in `lost_items`
- `hide_date_found` column exists in `lost_items`
- `question_type` enum exists
