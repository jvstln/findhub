# FindHub Activity Diagrams

## 1. Admin - Create Lost Item with Security Questions

```mermaid
graph
    Start([Start]) --> A1[Fill Form & Upload]
    A1 --> A2{Add Questions?}
    A2 -->|Yes| A3[Add Security Questions]
    A3 --> A4[Submit]
    A2 -->|No| A4
    A4 --> S1{Valid?}
    S1 -->|No| E1[Show Errors]
    S1 -->|Yes| S2[Store & Encrypt]
    S2 --> End([Success])
```

## 2. Public User - Search and View Item

```mermaid
graph
    Start([Start]) --> P1[Search Items]
    P1 --> P2[Apply Filters]
    P2 --> S1[System: Filter Privacy]
    S1 --> P3{Found?}
    P3 -->|No| End1([No Results])
    P3 -->|Yes| P4[View Details]
    P4 --> P5{Hidden Fields?}
    P5 -->|Yes| P6[Show Indicators]
    P5 -->|No| P7[Show All Info]
    P6 --> End2([End])
    P7 --> End2
```

## 3. Admin - Update Item Status with History

```mermaid
graph
    Start([Start]) --> A1[Login]
    A1 --> S1{Auth?}
    S1 -->|No| End1([Redirect])
    S1 -->|Yes| A2[Select Item]
    A2 --> A3[Choose Status]
    A3 --> A4[Add Notes]
    A4 --> S2{Valid?}
    S2 -->|No| End2([Error])
    S2 -->|Yes| S3[Update & Log History]
    S3 --> End3([Success])
```

## 4. System - Offline Functionality (PWA)

```mermaid
graph
    Start([Start]) --> SW1[Register Service Worker]
    SW1 --> SW2[Cache Assets]
    SW2 --> U1[Browse Items]
    U1 --> N1{Online?}
    N1 -->|Yes| S1[Fetch Fresh Data]
    N1 -->|No| SW3[Serve Cache]
    S1 --> End1([View Content])
    SW3 --> End1
```

## Activity Diagram Descriptions

### 1. Create Lost Item with Security Questions
Admin workflow for creating a new lost item with optional security questions and privacy controls. The system validates input, encrypts security answers, and stores everything in the database.

### 2. Public User Search and View
Public users search for items with filters. The system automatically filters hidden information based on privacy controls and excludes security questions from the response.

### 3. Update Item Status with History
Admin workflow for updating item status (unclaimed/claimed/disposed) with authentication validation. All status changes are tracked in history with timestamps and notes.

### 4. Offline Functionality (PWA)
Service worker enables offline browsing by caching assets and API responses. When offline, users can view cached content. When online, fresh data is fetched and cache is updated.

## Notes

- **Security**: All security answers are encrypted before storage
- **Privacy**: Hidden fields are filtered at the API level, never sent to public users
- **Authentication**: Admin operations require valid authentication tokens
- **Offline**: Service workers enable offline browsing of cached content
- **History**: All status changes are tracked with timestamps and admin information
