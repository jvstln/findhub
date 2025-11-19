# FindHub Database Tables

## Table: users

| Attribute Name | Data Type | Length | Key | Foreign Key Reference | Constraints |
|----------------|-----------|--------|-----|----------------------|-------------|
| id | text | - | PK | - | NOT NULL |
| name | text | - | - | - | NOT NULL |
| email | text | - | UK | - | NOT NULL, UNIQUE |
| email_verified | boolean | - | - | - | NOT NULL |
| image | text | - | - | - | NULL |
| created_at | timestamp | - | - | - | NOT NULL, DEFAULT NOW() |
| updated_at | timestamp | - | - | - | NOT NULL, DEFAULT NOW() |

## Table: sessions

| Attribute Name | Data Type | Length | Key | Foreign Key Reference | Constraints |
|----------------|-----------|--------|-----|----------------------|-------------|
| id | text | - | PK | - | NOT NULL |
| user_id | text | - | FK | users.id | NOT NULL, ON DELETE CASCADE |
| token | text | - | UK | - | NOT NULL, UNIQUE |
| expires_at | timestamp | - | - | - | NOT NULL |
| ip_address | text | - | - | - | NULL |
| user_agent | text | - | - | - | NULL |
| created_at | timestamp | - | - | - | NOT NULL, DEFAULT NOW() |
| updated_at | timestamp | - | - | - | NOT NULL, DEFAULT NOW() |

## Table: accounts

| Attribute Name | Data Type | Length | Key | Foreign Key Reference | Constraints |
|----------------|-----------|--------|-----|----------------------|-------------|
| id | text | - | PK | - | NOT NULL |
| user_id | text | - | FK | users.id | NOT NULL, ON DELETE CASCADE |
| account_id | text | - | - | - | NOT NULL |
| provider_id | text | - | - | - | NOT NULL |
| access_token | text | - | - | - | NULL |
| refresh_token | text | - | - | - | NULL |
| id_token | text | - | - | - | NULL |
| access_token_expires_at | timestamp | - | - | - | NULL |
| refresh_token_expires_at | timestamp | - | - | - | NULL |
| scope | text | - | - | - | NULL |
| password | text | - | - | - | NULL |
| created_at | timestamp | - | - | - | NOT NULL, DEFAULT NOW() |
| updated_at | timestamp | - | - | - | NOT NULL, DEFAULT NOW() |

## Table: verifications

| Attribute Name | Data Type | Length | Key | Foreign Key Reference | Constraints |
|----------------|-----------|--------|-----|----------------------|-------------|
| id | text | - | PK | - | NOT NULL |
| identifier | text | - | - | - | NOT NULL |
| value | text | - | - | - | NOT NULL |
| expires_at | timestamp | - | - | - | NOT NULL |
| created_at | timestamp | - | - | - | NULL |
| updated_at | timestamp | - | - | - | NULL |

## Table: lost_items

| Attribute Name | Data Type | Length | Key | Foreign Key Reference | Constraints |
|----------------|-----------|--------|-----|----------------------|-------------|
| id | serial | 4 bytes | PK | - | NOT NULL, AUTO INCREMENT |
| name | varchar | 255 | - | - | NOT NULL |
| description | text | - | - | - | NOT NULL |
| category_id | integer | 4 bytes | FK | item_categories.id | NULL |
| keywords | text[] | - | - | - | NULL |
| location | varchar | 255 | - | - | NOT NULL |
| date_found | timestamp | - | - | - | NOT NULL |
| status | item_status | - | - | - | NOT NULL, DEFAULT 'unclaimed' |
| hide_location | boolean | - | - | - | NOT NULL, DEFAULT false |
| hide_date_found | boolean | - | - | - | NOT NULL, DEFAULT false |
| created_by_id | text | - | FK | users.id | NOT NULL, ON DELETE CASCADE |
| created_at | timestamp | - | - | - | NOT NULL, DEFAULT NOW() |
| updated_at | timestamp | - | - | - | NOT NULL, DEFAULT NOW() |

**Indexes:**
- `lost_items_status_idx` ON (status)
- `lost_items_category_idx` ON (category_id)
- `lost_items_date_found_idx` ON (date_found)
- `lost_items_created_at_idx` ON (created_at)

## Table: item_images

| Attribute Name | Data Type | Length | Key | Foreign Key Reference | Constraints |
|----------------|-----------|--------|-----|----------------------|-------------|
| id | serial | 4 bytes | PK | - | NOT NULL, AUTO INCREMENT |
| item_id | integer | 4 bytes | FK | lost_items.id | NOT NULL, ON DELETE CASCADE |
| url | text | - | - | - | NOT NULL |
| key | text | - | - | - | NOT NULL |
| filename | varchar | 255 | - | - | NOT NULL |
| mime_type | varchar | 100 | - | - | NOT NULL |
| size | integer | 4 bytes | - | - | NOT NULL |
| display_order | integer | 4 bytes | - | - | NOT NULL, DEFAULT 0 |
| uploaded_by_id | text | - | FK | users.id | NOT NULL, ON DELETE CASCADE |
| created_at | timestamp | - | - | - | NOT NULL, DEFAULT NOW() |
| updated_at | timestamp | - | - | - | NOT NULL, DEFAULT NOW() |

**Indexes:**
- `item_images_item_id_idx` ON (item_id)
- `item_images_display_order_idx` ON (item_id, display_order)

## Table: security_questions

| Attribute Name | Data Type | Length | Key | Foreign Key Reference | Constraints |
|----------------|-----------|--------|-----|----------------------|-------------|
| id | serial | 4 bytes | PK | - | NOT NULL, AUTO INCREMENT |
| item_id | integer | 4 bytes | FK | lost_items.id | NOT NULL, ON DELETE CASCADE |
| question_text | text | - | - | - | NOT NULL |
| question_type | question_type | - | - | - | NOT NULL |
| options | text[] | - | - | - | NULL |
| encrypted_answer | text | - | - | - | NOT NULL |
| iv | text | - | - | - | NOT NULL |
| auth_tag | text | - | - | - | NOT NULL |
| display_order | integer | 4 bytes | - | - | NOT NULL, DEFAULT 0 |
| created_by_id | text | - | FK | users.id | NOT NULL, ON DELETE CASCADE |
| created_at | timestamp | - | - | - | NOT NULL, DEFAULT NOW() |
| updated_at | timestamp | - | - | - | NOT NULL, DEFAULT NOW() |

**Indexes:**
- `security_questions_item_id_idx` ON (item_id)
- `security_questions_display_order_idx` ON (item_id, display_order)

## Table: item_categories

| Attribute Name | Data Type | Length | Key | Foreign Key Reference | Constraints |
|----------------|-----------|--------|-----|----------------------|-------------|
| id | serial | 4 bytes | PK | - | NOT NULL, AUTO INCREMENT |
| name | varchar | 100 | - | - | NOT NULL |
| description | text | - | - | - | NULL |
| created_at | timestamp | - | - | - | NOT NULL, DEFAULT NOW() |
| updated_at | timestamp | - | - | - | NOT NULL, DEFAULT NOW() |

## Table: item_status_histories

| Attribute Name | Data Type | Length | Key | Foreign Key Reference | Constraints |
|----------------|-----------|--------|-----|----------------------|-------------|
| id | serial | 4 bytes | PK | - | NOT NULL, AUTO INCREMENT |
| item_id | integer | 4 bytes | FK | lost_items.id | NOT NULL, ON DELETE CASCADE |
| previous_status | item_status | - | - | - | NOT NULL |
| new_status | item_status | - | - | - | NOT NULL |
| changed_by_id | text | - | FK | users.id | NOT NULL, ON DELETE CASCADE |
| notes | text | - | - | - | NULL |
| created_at | timestamp | - | - | - | NOT NULL, DEFAULT NOW() |
| updated_at | timestamp | - | - | - | NOT NULL, DEFAULT NOW() |

## Enumeration Types

### item_status
- `unclaimed` - Item is available and unclaimed
- `claimed` - Item has been claimed by owner
- `returned` - Item has been returned to owner
- `archived` - Item has been deleted (soft delete)

### question_type
- `multiple_choice` - Question with predefined answer options
- `free_text` - Question with free-form text answer

## Key Legend

- **PK** = Primary Key
- **FK** = Foreign Key
- **UK** = Unique Key

## Data Type Notes

- **serial**: PostgreSQL auto-incrementing integer (4 bytes)
- **text**: Variable-length string (unlimited)
- **varchar(n)**: Variable-length string with maximum length n
- **boolean**: True/false value (1 byte)
- **timestamp**: Date and time with timezone (8 bytes)
- **integer**: Signed four-byte integer (4 bytes)
- **text[]**: Array of text values
- **item_status**: Custom ENUM type
- **question_type**: Custom ENUM type
