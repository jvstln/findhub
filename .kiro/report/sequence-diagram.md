# FindHub Sequence Diagrams

## 1. Admin Creates Lost Item with Security Questions

```mermaid
sequenceDiagram
    actor Admin
    participant UI as Admin UI
    participant API as API Server
    participant ItemService as ItemsService
    participant SecService as SecurityQuestionsService
    participant EncService as EncryptionService
    participant Upload as UploadService
    participant DB as Database
    
    Admin->>UI: Fill form & add security questions
    Admin->>UI: Upload images
    Admin->>UI: Set privacy controls
    Admin->>UI: Submit form
    
    UI->>API: POST /api/items
    API->>API: Validate auth token
    API->>ItemService: createItem(input)
    
    alt Has images
        ItemService->>Upload: uploadItemImage(file)
        Upload->>Upload: Store in file storage
        Upload-->>ItemService: {url, key}
    end
    
    ItemService->>DB: INSERT INTO lost_items
    DB-->>ItemService: item
    
    alt Has images
        ItemService->>DB: INSERT INTO item_images
        DB-->>ItemService: images[]
    end
    
    alt Has security questions
        ItemService->>SecService: createQuestions(itemId, questions)
        loop For each question
            SecService->>EncService: encrypt(answer)
            EncService-->>SecService: {encryptedText, iv, authTag}
        end
        SecService->>DB: INSERT INTO security_questions
        DB-->>SecService: questions[]
    end
    
    ItemService-->>API: LostItemWithImages
    API-->>UI: 201 Created
    UI-->>Admin: Success message
```

## 2. Public User Searches and Views Item

```mermaid
sequenceDiagram
    actor User as Public User
    participant UI as Web UI
    participant API as API Server
    participant ItemService as ItemsService
    participant DB as Database
    
    User->>UI: Enter search query
    User->>UI: Apply filters
    UI->>API: GET /api/public/items?query=...
    
    API->>ItemService: getPublicItems(filters)
    ItemService->>DB: SELECT with filters
    DB-->>ItemService: items[]
    
    ItemService->>ItemService: Apply privacy filtering
    Note over ItemService: Set location=null if hideLocation<br/>Set dateFound=null if hideDateFound<br/>Exclude security questions
    
    ItemService-->>API: PublicLostItem[]
    API-->>UI: 200 OK
    UI-->>User: Display search results
    
    User->>UI: Click on item
    UI->>API: GET /api/public/items/:id
    
    API->>ItemService: getPublicItem(id)
    ItemService->>DB: SELECT item with images
    DB-->>ItemService: item
    
    ItemService->>ItemService: Apply privacy filtering
    ItemService-->>API: PublicLostItem
    API-->>UI: 200 OK
    
    alt Has hidden fields
        UI-->>User: Show obscured field indicators
    else No hidden fields
        UI-->>User: Show complete information
    end
```

## 3. Admin Updates Item Status with History

```mermaid
sequenceDiagram
    actor Admin
    participant UI as Admin UI
    participant API as API Server
    participant Auth as Auth Middleware
    participant ItemService as ItemsService
    participant DB as Database
    
    Admin->>UI: Login
    UI->>API: POST /api/auth/sign-in
    API->>Auth: Validate credentials
    Auth-->>API: Session token
    API-->>UI: 200 OK + token
    
    Admin->>UI: Navigate to item
    Admin->>UI: Select new status
    Admin->>UI: Add notes
    Admin->>UI: Submit
    
    UI->>API: PATCH /api/items/:id/status
    API->>Auth: Verify token
    
    alt Invalid token
        Auth-->>API: 401 Unauthorized
        API-->>UI: 401 Unauthorized
        UI-->>Admin: Redirect to login
    else Valid token
        Auth-->>API: User info
        API->>ItemService: updateItemStatus(id, statusUpdate)
        
        ItemService->>DB: SELECT current item
        DB-->>ItemService: currentItem
        
        ItemService->>DB: UPDATE lost_items SET status
        DB-->>ItemService: updatedItem
        
        ItemService->>DB: INSERT INTO item_status_histories
        Note over DB: Store previous status,<br/>new status, timestamp,<br/>admin user, notes
        DB-->>ItemService: historyEntry
        
        ItemService-->>API: updatedItem
        API-->>UI: 200 OK
        UI-->>Admin: Success message
    end
```

## 4. Admin Views Item with Decrypted Security Questions

```mermaid
sequenceDiagram
    actor Admin
    participant UI as Admin UI
    participant API as API Server
    participant Auth as Auth Middleware
    participant ItemService as ItemsService
    participant SecService as SecurityQuestionsService
    participant EncService as EncryptionService
    participant DB as Database
    
    Admin->>UI: Navigate to item details
    UI->>API: GET /api/items/:id
    API->>Auth: Verify admin token
    
    alt Not authenticated
        Auth-->>API: 401 Unauthorized
        API-->>UI: 401 Unauthorized
    else Authenticated
        Auth-->>API: Admin user info
        API->>ItemService: getItemWithDecryptedSecurity(id)
        
        ItemService->>DB: SELECT item with images
        DB-->>ItemService: item
        
        ItemService->>SecService: getQuestionsWithAnswers(itemId)
        SecService->>DB: SELECT security_questions
        DB-->>SecService: questions[] (encrypted)
        
        loop For each question
            SecService->>EncService: decrypt(encryptedAnswer, iv, authTag)
            EncService-->>SecService: plainTextAnswer
        end
        
        SecService-->>ItemService: questions[] (decrypted)
        ItemService-->>API: LostItemWithDecryptedSecurity
        API-->>UI: 200 OK
        
        UI-->>Admin: Display complete info
        Note over UI: Shows location, date,<br/>and decrypted security questions
    end
```

## 5. System Handles Offline Request (PWA)

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant SW as Service Worker
    participant Cache
    participant API as API Server
    
    User->>Browser: Access website
    Browser->>SW: Register service worker
    SW->>Cache: Cache static assets
    
    User->>Browser: Browse items
    Browser->>SW: Fetch /api/items
    
    alt Network available
        SW->>API: Forward request
        API-->>SW: Response data
        SW->>Cache: Update cache
        SW-->>Browser: Response data
        Browser-->>User: Display fresh content
    else Network offline
        SW->>SW: Detect offline
        SW->>Cache: Retrieve cached data
        
        alt Cache hit
            Cache-->>SW: Cached data
            SW-->>Browser: Cached response
            Browser->>Browser: Show offline indicator
            Browser-->>User: Display cached content
        else Cache miss
            SW-->>Browser: Network error
            Browser-->>User: Show error message
        end
    end
    
    alt User tries to create/update
        User->>Browser: Submit form
        Browser->>SW: POST request
        SW->>SW: Check network
        
        alt Offline
            SW-->>Browser: Error response
            Browser-->>User: "You are offline" message
        end
    end
    
    Note over User,API: Network restored
    SW->>SW: Detect online
    Browser->>Browser: Hide offline indicator
    SW->>API: Sync requests
    API-->>SW: Updated data
    SW->>Cache: Update cache
```

## 6. Security Question Encryption Flow

```mermaid
sequenceDiagram
    participant Admin
    participant API as API Server
    participant SecService as SecurityQuestionsService
    participant EncService as EncryptionService
    participant DB as Database
    
    Admin->>API: Create item with security question
    Note over Admin: Question: "What color is the item?"<br/>Answer: "Blue"
    
    API->>SecService: createQuestions(itemId, questions)
    SecService->>EncService: encrypt("Blue")
    
    EncService->>EncService: Generate random IV (16 bytes)
    EncService->>EncService: Get encryption key from env
    EncService->>EncService: Create AES-256-GCM cipher
    EncService->>EncService: Encrypt plaintext
    EncService->>EncService: Get auth tag
    
    EncService-->>SecService: {encryptedText, iv, authTag}
    
    SecService->>DB: INSERT INTO security_questions
    Note over DB: Stores:<br/>- encryptedAnswer<br/>- iv (initialization vector)<br/>- authTag (authentication tag)
    
    DB-->>SecService: Saved question
    SecService-->>API: Success
    
    Note over Admin,DB: Later: Admin views item
    
    Admin->>API: GET /api/items/:id
    API->>SecService: getQuestionsWithAnswers(itemId)
    SecService->>DB: SELECT security_questions
    DB-->>SecService: {encryptedAnswer, iv, authTag}
    
    SecService->>EncService: decrypt(encryptedAnswer, iv, authTag)
    EncService->>EncService: Get encryption key from env
    EncService->>EncService: Create AES-256-GCM decipher
    EncService->>EncService: Set auth tag
    EncService->>EncService: Decrypt and verify
    
    alt Auth tag valid
        EncService-->>SecService: "Blue"
        SecService-->>API: Question with decrypted answer
        API-->>Admin: Display answer
    else Auth tag invalid
        EncService-->>SecService: Error (tampered data)
        SecService-->>API: Error
        API-->>Admin: Error message
    end
```

## Sequence Diagram Descriptions

### 1. Admin Creates Lost Item with Security Questions
Shows the complete flow of creating a lost item including image uploads, security question encryption, and privacy control settings. Demonstrates how the system coordinates between multiple services.

### 2. Public User Searches and Views Item
Illustrates how public users search for items and how the system automatically filters hidden information based on privacy controls. Security questions are never exposed to public users.

### 3. Admin Updates Item Status with History
Demonstrates the authentication flow and status update process with automatic history tracking. Shows how the system maintains an audit trail of all status changes.

### 4. Admin Views Item with Decrypted Security Questions
Shows how admin users can view complete item information including decrypted security questions. Highlights the authentication requirement and decryption process.

### 5. System Handles Offline Request (PWA)
Illustrates how the service worker handles online/offline scenarios, caching strategies, and user feedback. Shows the difference between read operations (cached) and write operations (require network).

### 6. Security Question Encryption Flow
Detailed view of the encryption/decryption process using AES-256-GCM. Shows how the system generates initialization vectors, encrypts data, stores authentication tags, and verifies data integrity during decryption.

## Key Interactions

- **Authentication**: All admin operations require valid authentication tokens
- **Privacy Filtering**: System automatically filters hidden fields for public API responses
- **Encryption**: Security answers are encrypted before storage and decrypted only for admin users
- **Caching**: Service worker caches responses for offline access
- **History Tracking**: All status changes are logged with timestamps and user information
- **Error Handling**: System handles authentication failures, network errors, and decryption failures gracefully
