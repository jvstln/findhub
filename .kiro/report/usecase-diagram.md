# FindHub Use Case Diagram

## PlantUML Diagram

```plantuml
@startuml FindHub Use Case Diagram
left to right direction
skinparam packageStyle rectangle

actor "Public User\n(Student/Visitor)" as PU #LightGreen
actor "Admin User\n(Staff Member)" as AU #Orange
actor "System\n(Automated)" as SYS #Purple

rectangle "FindHub Lost and Found System" {
  
  package "Public Use Cases" #LightGreen {
    usecase (Search Lost Items) as UC1
    usecase (View Item Details) as UC2
    usecase (Filter by Category) as UC3
    usecase (Filter by Date Range) as UC4
    usecase (Filter by Location) as UC5
    usecase (Access Offline) as UC6
    usecase (View About Page) as UC7
    usecase (Get Contact Info) as UC8
  }
  
  package "Admin Use Cases" #LightYellow {
    usecase (Login to Admin) as UC9
    usecase (Create Lost Item) as UC10
    usecase (Edit Lost Item) as UC11
    usecase (Delete Lost Item) as UC12
    usecase (Update Item Status) as UC13
    usecase (Upload Item Images) as UC14
    usecase (Add Security Questions) as UC15
    usecase (Set Privacy Controls) as UC16
    usecase (View Complete Info) as UC17
    usecase (Edit Security Questions) as UC18
    usecase (Manage Status History) as UC19
  }
  
  package "System Use Cases" #Lavender {
    usecase (Encrypt Security Answers) as UC20
    usecase (Filter Hidden Fields) as UC21
    usecase (Decrypt for Admin) as UC22
    usecase (Cache for Offline) as UC23
    usecase (Store Images) as UC24
    usecase (Validate Authentication) as UC25
  }
}

' Public User Relationships
PU --> UC1
PU --> UC2
PU --> UC3
PU --> UC4
PU --> UC5
PU --> UC6
PU --> UC7
PU --> UC8

' Admin User Relationships
AU --> UC9
AU --> UC10
AU --> UC11
AU --> UC12
AU --> UC13
AU --> UC14
AU --> UC15
AU --> UC16
AU --> UC17
AU --> UC18
AU --> UC19

' System Relationships
SYS --> UC20
SYS --> UC21
SYS --> UC22
SYS --> UC23
SYS --> UC24
SYS --> UC25

' Include Relationships
UC2 ..> UC21 : <<include>>
UC10 ..> UC14 : <<include>>
UC10 ..> UC15 : <<include>>
UC10 ..> UC16 : <<include>>
UC10 ..> UC20 : <<include>>
UC11 ..> UC18 : <<include>>
UC11 ..> UC16 : <<include>>
UC13 ..> UC19 : <<include>>
UC15 ..> UC20 : <<include>>
UC17 ..> UC22 : <<include>>
UC18 ..> UC20 : <<include>>

' Extend Relationships
UC9 <.. UC10 : <<extend>>
UC9 <.. UC11 : <<extend>>
UC9 <.. UC12 : <<extend>>
UC9 <.. UC13 : <<extend>>
UC9 <.. UC17 : <<extend>>

note right of UC20
  Security answers are encrypted
  before storage using AES-256
end note

note right of UC21
  Hidden fields are filtered
  based on privacy controls
  (hideLocation, hideDateFound)
end note

note bottom of UC9
  Authentication required
  for all admin operations
end note

@enduml
```

## Mermaid Diagram (Flowchart Style)

```mermaid
graph TB
    subgraph Actors["👥 Actors"]
        PU["👤 Public User<br/>(Student/Visitor)"]
        AU["👨‍💼 Admin User<br/>(Staff Member)"]
        SYS["🤖 System<br/>(Automated)"]
    end
    
    subgraph PublicUseCases["🌐 Public User Use Cases"]
        UC1["🔍 Search Lost Items"]
        UC2["👁️ View Item Details"]
        UC3["🏷️ Filter by Category"]
        UC4["📅 Filter by Date Range"]
        UC5["📍 Filter by Location"]
        UC6["📱 Access Offline"]
        UC7["ℹ️ View About Page"]
        UC8["📞 Get Contact Info"]
    end
    
    subgraph AdminUseCases["🔐 Admin User Use Cases"]
        UC9["🔑 Login to Admin"]
        UC10["➕ Create Lost Item"]
        UC11["✏️ Edit Lost Item"]
        UC12["🗑️ Delete Lost Item"]
        UC13["📊 Update Item Status"]
        UC14["📸 Upload Item Images"]
        UC15["❓ Add Security Questions"]
        UC16["🔒 Set Privacy Controls"]
        UC17["👁️ View Complete Info"]
        UC18["📝 Edit Security Questions"]
        UC19["🔄 Manage Status History"]
    end
    
    subgraph SystemUseCases["⚙️ System Use Cases"]
        UC20["🔐 Encrypt Security Answers"]
        UC21["🚫 Filter Hidden Fields"]
        UC22["🔓 Decrypt for Admin"]
        UC23["💾 Cache for Offline"]
        UC24["🗄️ Store Images"]
        UC25["🔍 Validate Authentication"]
    end
    
    %% Public User Relationships
    PU --> UC1
    PU --> UC2
    PU --> UC3
    PU --> UC4
    PU --> UC5
    PU --> UC6
    PU --> UC7
    PU --> UC8
    
    %% Admin User Relationships
    AU --> UC9
    AU --> UC10
    AU --> UC11
    AU --> UC12
    AU --> UC13
    AU --> UC14
    AU --> UC15
    AU --> UC16
    AU --> UC17
    AU --> UC18
    AU --> UC19
    
    %% Use Case Dependencies (includes)
    UC2 -.->|includes| UC21
    UC10 -.->|includes| UC14
    UC10 -.->|includes| UC15
    UC10 -.->|includes| UC16
    UC10 -.->|includes| UC20
    UC11 -.->|includes| UC18
    UC11 -.->|includes| UC16
    UC13 -.->|includes| UC19
    UC15 -.->|includes| UC20
    UC17 -.->|includes| UC22
    UC18 -.->|includes| UC20
    
    %% System Triggered Use Cases
    SYS --> UC20
    SYS --> UC21
    SYS --> UC22
    SYS --> UC23
    SYS --> UC24
    SYS --> UC25
    
    %% Authentication Extension
    UC9 -.->|extends| UC10
    UC9 -.->|extends| UC11
    UC9 -.->|extends| UC12
    UC9 -.->|extends| UC13
    UC9 -.->|extends| UC17
    
    %% Styling
    style Actors fill:#e1f5ff
    style PublicUseCases fill:#e8f5e9
    style AdminUseCases fill:#fff3e0
    style SystemUseCases fill:#f3e5f5
    
    style PU fill:#4CAF50,color:#fff
    style AU fill:#FF9800,color:#fff
    style SYS fill:#9C27B0,color:#fff
```

## Use Case Descriptions

### Public User Use Cases

| Use Case | Description | Requirements |
|----------|-------------|--------------|
| **Search Lost Items** | Search for lost items using keywords | Basic functionality |
| **View Item Details** | View detailed information about a specific item | May show obscured fields |
| **Filter by Category** | Filter search results by item category | Search enhancement |
| **Filter by Date Range** | Filter items by date found range | Search enhancement |
| **Filter by Location** | Filter items by location found | Search enhancement |
| **Access Offline** | Access cached items when offline | PWA functionality |
| **View About Page** | View information about the service | Information access |
| **Get Contact Info** | Access admin office contact details | Support access |

### Admin User Use Cases

| Use Case | Description | Requirements |
|----------|-------------|--------------|
| **Login to Admin** | Authenticate to access admin features | Req 8.1, 8.5 |
| **Create Lost Item** | Register a new lost item in the system | Core functionality |
| **Edit Lost Item** | Update existing item information | Core functionality |
| **Delete Lost Item** | Remove an item from the system | Core functionality |
| **Update Item Status** | Change item status (unclaimed/claimed/disposed) | Status workflow |
| **Upload Item Images** | Upload photos of lost items | File handling |
| **Add Security Questions** | Create verification questions for items | Req 1.1-1.9 |
| **Set Privacy Controls** | Hide location/date from public view | Req 3.1-3.7 |
| **View Complete Info** | See all item details including hidden fields | Req 5.1-5.5 |
| **Edit Security Questions** | Modify or remove existing security questions | Req 6.1-6.6 |
| **Manage Status History** | Track and view item status changes | Status tracking |

### System Use Cases

| Use Case | Description | Requirements |
|----------|-------------|--------------|
| **Encrypt Security Answers** | Encrypt answers before storing in database | Req 2.2, 2.8 |
| **Filter Hidden Fields** | Remove hidden fields from public API responses | Req 4.1-4.6, 8.3 |
| **Decrypt for Admin** | Decrypt security answers for admin view | Req 8.4 |
| **Cache for Offline** | Store data in service worker cache | PWA functionality |
| **Store Images** | Save uploaded images to file storage | File handling |
| **Validate Authentication** | Verify admin user tokens | Req 8.5 |

## Use Case Relationships

### Includes Relationships
- **View Item Details** includes **Filter Hidden Fields**: System automatically filters hidden fields when public users view items
- **Create Lost Item** includes **Upload Item Images**, **Add Security Questions**, **Set Privacy Controls**, **Encrypt Security Answers**: Creating an item involves these sub-processes
- **Edit Lost Item** includes **Edit Security Questions**, **Set Privacy Controls**: Editing allows modification of these features
- **Update Item Status** includes **Manage Status History**: Status changes are tracked in history

### Extends Relationships
- **Login to Admin** extends all admin use cases: Authentication is required before performing admin actions

### System Triggers
- System automatically encrypts security answers when they are created or updated
- System automatically filters hidden fields for public API responses
- System automatically decrypts answers for authenticated admin users
- System automatically validates authentication tokens on protected endpoints

## Actor Descriptions

### Public User
- **Role**: Unauthenticated student or visitor
- **Access**: Public pages only
- **Capabilities**: Search, view (with restrictions), filter items
- **Restrictions**: Cannot see hidden fields or security questions

### Admin User
- **Role**: Authenticated staff member
- **Access**: Admin dashboard and public pages
- **Capabilities**: Full CRUD operations, security questions, privacy controls
- **Restrictions**: Must authenticate before accessing admin features

### System
- **Role**: Automated processes
- **Responsibilities**: Encryption, filtering, caching, validation
- **Triggers**: API requests, data operations, authentication checks
