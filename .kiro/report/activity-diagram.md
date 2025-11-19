# FindHub Activity Diagrams

## 1. Admin - Create Lost Item with Security Questions

```mermaid
graph TB
    Start([Admin Starts]) --> A1[Navigate to Create Form]
    A1 --> A2[Fill Basic Details]
    A2 --> A3[Upload Images]
    A3 --> A4[Set Privacy Controls]
    A4 --> A5{Add Security<br/>Questions?}
    
    A5 -->|Yes| A6[Click Add Question]
    A6 --> A7{Question Type?}
    
    A7 -->|Multiple Choice| A8[Enter Question Text]
    A8 --> A9[Add Answer Options]
    A9 --> A10[Mark Correct Answer]
    A10 --> A11{Add More?<br/>Max 10}
    
    A7 -->|Free Text| A12[Enter Question Text]
    A12 --> A13[Enter Expected Answer]
    A13 --> A11
    
    A11 -->|Yes| A6
    A11 -->|No| A14[Submit Form]
    A5 -->|No| A14
    
    A14 --> S1[System: Validate Data]
    S1 --> S2{Valid?}
    
    S2 -->|No| E1[Display Errors]
    E1 --> End([End])
    
    S2 -->|Yes| S3[Store Item in DB]
    S3 --> S4{Has Security<br/>Questions?}
    
    S4 -->|Yes| S5[Encrypt Answers]
    S5 --> S6[Store in security_questions]
    S6 --> S7{Has Images?}
    
    S4 -->|No| S7
    
    S7 -->|Yes| S8[Upload to Storage]
    S8 --> S9[Store Image URLs]
    S9 --> S10[Apply Privacy Controls]
    
    S7 -->|No| S10
    
    S10 --> S11[Return Success]
    S11 --> A15[Display Success Message]
    A15 --> A16[Redirect to Item List]
    A16 --> End([End])
```

## 2. Public User - Search and View Item

```mermaid
graph TB
    Start([Public User Starts]) --> P1[Access Website]
    P1 --> P2[Enter Search Keywords]
    P2 --> P3[Apply Filters]
    
    P3 --> S1[System: Query Database]
    S1 --> S2[Retrieve Matching Items]
    S2 --> S3[Apply Privacy Filtering]
    S3 --> S4[Exclude Security Questions]
    
    S4 --> P4[View Search Results]
    P4 --> P5{Item Found?}
    
    P5 -->|No| P6[Display No Results]
    P6 --> End1([End])
    
    P5 -->|Yes| P7[Click on Item]
    P7 --> S5[System: Fetch Details]
    
    S5 --> S6{Location<br/>Hidden?}
    S6 -->|Yes| S7[Set location = null]
    S7 --> S8{Date<br/>Hidden?}
    S6 -->|No| S8
    
    S8 -->|Yes| S9[Set dateFound = null]
    S9 --> S10[Return Filtered Data]
    S8 -->|No| S10
    
    S10 --> P8[View Item Details]
    P8 --> P9{Has Hidden<br/>Fields?}
    
    P9 -->|Yes| P10[Display Obscured<br/>Field Indicators]
    P10 --> P11[View Available Info]
    P9 -->|No| P11
    
    P11 --> P12{Want to<br/>Claim?}
    P12 -->|Yes| P13[Note Contact Info]
    P13 --> P14[Contact Admin Office]
    P14 --> End2([End])
    
    P12 -->|No| End2
```

## 3. Admin - Update Item Status with History

```mermaid
graph TB
    Start([Admin Starts]) --> A1[Login to Dashboard]
    A1 --> S1[System: Validate Auth]
    
    S1 --> S2{Authenticated?}
    S2 -->|No| A2[Redirect to Login]
    A2 --> End1([End])
    
    S2 -->|Yes| A3[Navigate to Item List]
    A3 --> A4[Select Item]
    A4 --> A5[View Current Status]
    A5 --> A6[Select New Status]
    
    A6 --> A7{Status Type?}
    
    A7 -->|Claimed| A8[Enter Claimant Info]
    A8 --> A9[Add Verification Notes]
    A9 --> A10[Submit Update]
    
    A7 -->|Disposed| A11[Enter Disposal Method]
    A11 --> A12[Add Disposal Notes]
    A12 --> A10
    
    A7 -->|Unclaimed| A10
    
    A10 --> S3[System: Validate Transition]
    S3 --> S4{Valid?}
    
    S4 -->|No| A13[Display Error]
    A13 --> End2([End])
    
    S4 -->|Yes| S5[Update Item Status]
    S5 --> S6[Create History Entry]
    S6 --> S7[Save to Database]
    S7 --> S8[Return Success]
    
    S8 --> A14[Display Success]
    A14 --> A15[View Updated Item]
    A15 --> A16[View Status History]
    A16 --> End3([End])
```

## 4. System - Offline Functionality (PWA)

```mermaid
graph TB
    Start([User Starts]) --> U1[Access Website]
    U1 --> SW1[Service Worker: Register]
    
    SW1 --> SW2[Cache Static Assets]
    SW2 --> SW3[Cache API Responses]
    
    SW3 --> U2[Browse Items]
    U2 --> U3[Perform Searches]
    
    U3 --> SW4{Network<br/>Available?}
    
    SW4 -->|Yes| S1[System: Fetch Fresh Data]
    S1 --> SW5[Update Cache]
    SW5 --> U4[View Fresh Content]
    U4 --> U7{Continue<br/>Browsing?}
    
    SW4 -->|No| SW6[Detect Offline]
    SW6 --> SW7[Display Offline Indicator]
    SW7 --> SW8[Serve Cached Data]
    SW8 --> U5[View Cached Content]
    
    U5 --> U6{Try to<br/>Create/Update?}
    U6 -->|Yes| SW9[Display Error Message]
    SW9 --> U8[Wait for Connection]
    U8 --> U7
    
    U6 -->|No| U9[Continue Browsing Cache]
    U9 --> U7
    
    U7 -->|Yes| U3
    U7 -->|No| SW10{Network<br/>Restored?}
    
    SW10 -->|Yes| SW11[Detect Online]
    SW11 --> SW12[Hide Offline Indicator]
    SW12 --> SW13[Sync with Server]
    SW13 --> SW14[Update Cache]
    SW14 --> U10[Resume Normal Operations]
    U10 --> End1([End])
    
    SW10 -->|No| End1
```

## Activity Diagram Descriptions

### 1. Create Lost Item with Security Questions
This diagram shows the complete workflow for an admin user creating a new lost item with optional security questions and privacy controls. Key steps include:
- Form filling with basic item details
- Image upload
- Privacy control configuration
- Security question creation (multiple choice or free text)
- System validation and encryption
- Database storage

### 2. Public User Search and View
This diagram illustrates how public users search for and view lost items, with the system automatically filtering hidden information. Key steps include:
- Search with filters
- Privacy filtering by system
- Security question exclusion
- Obscured field indicators for hidden data
- Contact information for claiming items

### 3. Update Item Status with History
This diagram shows the admin workflow for updating item status and maintaining status history. Key steps include:
- Authentication validation
- Status selection (unclaimed/claimed/disposed)
- Additional information based on status type
- Status history tracking
- Database updates

### 4. Offline Functionality (PWA)
This diagram demonstrates how the Progressive Web App handles offline scenarios using service workers. Key steps include:
- Service worker registration
- Asset and data caching
- Offline detection
- Cached content serving
- Network restoration and sync

## Notes

- **Security**: All security answers are encrypted before storage
- **Privacy**: Hidden fields are filtered at the API level, never sent to public users
- **Authentication**: Admin operations require valid authentication tokens
- **Offline**: Service workers enable offline browsing of cached content
- **History**: All status changes are tracked with timestamps and admin information
