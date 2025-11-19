# FindHub Class Diagram

## Database Schema (Entity Classes)

```mermaid
classDiagram
    class User {
        +String id PK
        +String name
        +String email
        +Boolean emailVerified
        +String image
        +Timestamp createdAt
        +Timestamp updatedAt
    }
    
    class Session {
        +String id PK
        +String userId FK
        +String token
        +Timestamp expiresAt
        +String ipAddress
        +String userAgent
        +Timestamp createdAt
        +Timestamp updatedAt
    }
    
    class LostItem {
        +Integer id PK
        +String name
        +String description
        +Integer categoryId FK
        +String[] keywords
        +String location
        +Timestamp dateFound
        +ItemStatus status
        +Boolean hideLocation
        +Boolean hideDateFound
        +String createdById FK
        +Timestamp createdAt
        +Timestamp updatedAt
    }
    
    class ItemImage {
        +Integer id PK
        +Integer itemId FK
        +String url
        +String key
        +String filename
        +String mimeType
        +Integer size
        +Integer displayOrder
        +String uploadedById FK
        +Timestamp createdAt
        +Timestamp updatedAt
    }
    
    class SecurityQuestion {
        +Integer id PK
        +Integer itemId FK
        +String questionText
        +QuestionType questionType
        +String[] options
        +String encryptedAnswer
        +String iv
        +String authTag
        +Integer displayOrder
        +String createdById FK
        +Timestamp createdAt
        +Timestamp updatedAt
    }
    
    class ItemCategory {
        +Integer id PK
        +String name
        +String description
        +Timestamp createdAt
        +Timestamp updatedAt
    }
    
    class ItemStatusHistory {
        +Integer id PK
        +Integer itemId FK
        +ItemStatus previousStatus
        +ItemStatus newStatus
        +String changedById FK
        +String notes
        +Timestamp createdAt
        +Timestamp updatedAt
    }
    
    class ItemStatus {
        <<enumeration>>
        unclaimed
        claimed
        returned
        archived
    }
    
    class QuestionType {
        <<enumeration>>
        multiple_choice
        free_text
    }
    
    User "1" --> "*" Session : has
    User "1" --> "*" LostItem : creates
    User "1" --> "*" ItemImage : uploads
    User "1" --> "*" SecurityQuestion : creates
    User "1" --> "*" ItemStatusHistory : changes
    
    LostItem "*" --> "1" ItemCategory : belongs to
    LostItem "1" --> "*" ItemImage : has
    LostItem "1" --> "*" SecurityQuestion : has
    LostItem "1" --> "*" ItemStatusHistory : tracks
    
    LostItem --> ItemStatus : uses
    SecurityQuestion --> QuestionType : uses
```

## Service Layer Classes

```mermaid
classDiagram
    class ItemsService {
        +getItems(filters) PaginatedResponse~LostItemWithImages~
        +getPublicItems(filters) PaginatedResponse~PublicLostItem~
        +getItemById(id) LostItem
        +getItemByIdWithImages(id) LostItemWithImages
        +getItemWithSecurity(id) LostItemWithSecurity
        +getItemWithDecryptedSecurity(id) LostItemWithDecryptedSecurity
        +getPublicItem(id) PublicLostItem
        +createItem(input) LostItemWithImages
        +updateItem(id, input) LostItemWithImages
        +deleteItem(id, userId) Boolean
        +addItemImages(itemId, images, userId) ItemImage[]
        +deleteItemImage(imageId) Boolean
        +updateImageOrder(imageId, order) ItemImage
        +updateItemStatus(id, statusUpdate) LostItem
        +getItemStatusHistory(itemId) StatusHistoryEntry[]
        +getDashboardStats() DashboardStats
    }
    
    class SecurityQuestionsService {
        +createQuestions(itemId, questions, userId) SecurityQuestion[]
        +getQuestionsWithAnswers(itemId) SecurityQuestionWithDecryptedAnswer[]
        +getQuestions(itemId) SecurityQuestion[]
        +updateQuestions(itemId, questions, userId) SecurityQuestion[]
        +deleteQuestions(itemId) void
        +deleteQuestion(questionId) Boolean
        +hasSecurityQuestions(itemId) Boolean
    }
    
    class EncryptionService {
        +encrypt(plainText) EncryptedData
        +decrypt(encryptedText, iv, authTag) String
        -getKey() String
    }
    
    class CategoryService {
        +getAllCategories() ItemCategory[]
        +getCategoryById(id) ItemCategory
        +createCategory(input) ItemCategory
        +updateCategory(id, input) ItemCategory
        +deleteCategory(id) Boolean
    }
    
    class UploadService {
        +uploadItemImage(file) UploadResult
        +deleteItemImage(key) Boolean
    }
    
    ItemsService --> SecurityQuestionsService : uses
    ItemsService --> CategoryService : uses
    ItemsService --> UploadService : uses
    SecurityQuestionsService --> EncryptionService : uses
```

## Data Transfer Objects (DTOs)

```mermaid
classDiagram
    class CreateItemInput {
        +String name
        +String description
        +Integer categoryId
        +String keywords
        +String location
        +Date dateFound
        +File[] images
        +String createdById
        +SecurityQuestionInput[] securityQuestions
        +Boolean hideLocation
        +Boolean hideDateFound
    }
    
    class UpdateItemInput {
        +String name
        +String description
        +Integer categoryId
        +String keywords
        +String location
        +Date dateFound
        +File[] images
        +ItemStatus status
        +SecurityQuestionInput[] securityQuestions
        +Boolean hideLocation
        +Boolean hideDateFound
    }
    
    class SecurityQuestionInput {
        +String questionText
        +QuestionType questionType
        +String[] options
        +String answer
        +Integer displayOrder
    }
    
    class StatusUpdateInput {
        +ItemStatus status
        +String notes
        +String changedById
    }
    
    class SearchFilters {
        +String query
        +Integer categoryId
        +String location
        +ItemStatus status
        +Date dateFrom
        +Date dateTo
        +Integer page
        +Integer pageSize
    }
    
    class EncryptedData {
        +String encryptedText
        +String iv
        +String authTag
    }
    
    class LostItemWithImages {
        +LostItem item
        +ItemImage[] images
    }
    
    class LostItemWithSecurity {
        +LostItem item
        +ItemImage[] images
        +SecurityQuestion[] securityQuestions
    }
    
    class LostItemWithDecryptedSecurity {
        +LostItem item
        +ItemImage[] images
        +SecurityQuestionWithDecryptedAnswer[] securityQuestions
    }
    
    class PublicLostItem {
        +LostItem item
        +ItemImage[] images
        +String location
        +Date dateFound
    }
    
    class SecurityQuestionWithDecryptedAnswer {
        +Integer id
        +Integer itemId
        +String questionText
        +QuestionType questionType
        +String[] options
        +String answer
        +Integer displayOrder
    }
    
    class PaginatedResponse~T~ {
        +T[] data
        +Integer total
        +Integer page
        +Integer pageSize
        +Integer totalPages
    }
```

## Class Relationships Summary

### Entity Relationships
- **User** creates multiple **LostItems**, **ItemImages**, **SecurityQuestions**, and **ItemStatusHistory** entries
- **LostItem** belongs to one **ItemCategory** and has multiple **ItemImages**, **SecurityQuestions**, and **ItemStatusHistory** entries
- **SecurityQuestion** uses **QuestionType** enum (multiple_choice or free_text)
- **LostItem** uses **ItemStatus** enum (unclaimed, claimed, returned, archived)

### Service Dependencies
- **ItemsService** orchestrates item management and depends on:
  - **SecurityQuestionsService** for security question operations
  - **CategoryService** for category validation
  - **UploadService** for image storage
- **SecurityQuestionsService** depends on **EncryptionService** for encrypting/decrypting answers

### Data Flow
1. **CreateItemInput/UpdateItemInput** → **ItemsService** → Database entities
2. **SecurityQuestionInput** → **SecurityQuestionsService** → **EncryptionService** → **SecurityQuestion** (encrypted)
3. Database entities → **ItemsService** → **PublicLostItem** (filtered for public) or **LostItemWithDecryptedSecurity** (admin view)

## Key Design Patterns

### Privacy Filtering
- **PublicLostItem** type filters sensitive data based on `hideLocation` and `hideDateFound` flags
- Security questions are never exposed in public API responses

### Encryption
- **EncryptionService** uses AES-256-GCM for encrypting security answers
- Stores encrypted data with IV (initialization vector) and authentication tag
- Decryption only available through admin endpoints

### Soft Delete
- Items are marked as "archived" status instead of hard deletion
- Maintains data integrity and audit trail

### Pagination
- **PaginatedResponse** generic type wraps list responses with metadata
- Supports efficient data retrieval with page/pageSize parameters
