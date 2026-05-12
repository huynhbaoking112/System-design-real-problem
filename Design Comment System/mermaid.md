# Comment System Mermaid Diagrams

## High-Level Architecture

```mermaid
flowchart LR
    Client[Client]
    LB[Load Balancer]
    Auth[User Authentication Service]
    CommentService[Comment Service]
    Cache[(Redis Cache)]
    Primary[(MongoDB Primary)]
    Secondary[(MongoDB Secondary Replicas)]
    Analytics[Analytics Pipeline]

    Client --> LB
    LB --> CommentService
    CommentService --> Auth
    CommentService --> Cache
    CommentService --> Primary
    Primary --> Secondary
    CommentService --> Analytics
```

## Read Comments Flow

```mermaid
sequenceDiagram
    participant Client
    participant LB as Load Balancer
    participant Service as Comment Service
    participant Cache as Redis Cache
    participant DB as Comment Database

    Client->>LB: GET /{topic_id}/comments?cursor={last_timestamp}&size={size}
    LB->>Service: Forward request
    Service->>Cache: Get comments by cache key

    alt Cache hit
        Cache-->>Service: Return cached comments
    else Cache miss
        Service->>DB: Query comments where timestamp < cursor
        DB-->>Service: Return comments
        Service->>Cache: Store result with short TTL
    end

    Service-->>Client: Return paginated comments
```

## Write Comment Flow

```mermaid
sequenceDiagram
    participant Client
    participant LB as Load Balancer
    participant Service as Comment Service
    participant Auth as User Authentication Service
    participant Spam as Spam Check Service
    participant DB as Comment Database
    participant Cache as Redis Cache

    Client->>LB: POST /comment or POST /comment/{comment_id}/reply
    LB->>Service: Forward request
    Service->>Auth: Validate user permission

    alt Unauthorized
        Auth-->>Service: Permission denied
        Service-->>Client: Return failed response
    else Authorized
        Auth-->>Service: Permission approved
        Service->>Spam: Check comment content

        alt Spam detected
            Spam-->>Service: Spam
            Service->>DB: Save to spam_comments collection
            Service-->>Client: Return moderation response
        else Valid comment
            Spam-->>Service: Not spam
            Service->>DB: Save comment or reply
            Service->>Cache: Invalidate topic comment cache
            Service-->>Client: Return success response
        end
    end
```

## Voting Flow

```mermaid
sequenceDiagram
    participant Client
    participant LB as Load Balancer
    participant Service as Comment Service
    participant Auth as User Authentication Service
    participant DB as Comment Database
    participant Cache as Redis Cache

    Client->>LB: PUT /comment/{comment_id}/upvote or /downvote
    LB->>Service: Forward request
    Service->>Auth: Validate user permission

    alt Unauthorized
        Auth-->>Service: Permission denied
        Service-->>Client: Return failed response
    else Authorized
        Auth-->>Service: Permission approved
        Service->>DB: Insert vote record and update vote count
        Service->>Cache: Invalidate affected topic cache
        Service-->>Client: Return success response
    end
```

## Data Model

```mermaid
erDiagram
    TOPICS ||--o{ COMMENTS : contains
    COMMENTS ||--o{ COMMENTS : replies_to
    COMMENTS ||--o{ UPVOTES : receives
    COMMENTS ||--o{ DOWNVOTES : receives
    USERS ||--o{ COMMENTS : posts
    USERS ||--o{ UPVOTES : creates
    USERS ||--o{ DOWNVOTES : creates

    TOPICS {
        ObjectId _id
        string topic_id
        number total_count
    }

    COMMENTS {
        ObjectId _id
        string content
        string user_id
        string topic_id
        string replied_comment_id
        number upvote_count
        number downvote_count
        datetime timestamp
    }

    UPVOTES {
        ObjectId _id
        string topic_id
        string comment_id
        string user_id
        datetime timestamp
    }

    DOWNVOTES {
        ObjectId _id
        string topic_id
        string comment_id
        string user_id
        datetime timestamp
    }

    USERS {
        string user_id
        string username
        string role
    }
```

## Peak Traffic Design

```mermaid
flowchart LR
    Client[Client]
    Edge[Cloudflare or Edge Rate Limit]
    LB1[Load Balancer]
    RateLimiter[Rate Limiter Service Cluster]
    LB2[Load Balancer]
    CommentService[Comment Service Cluster]
    MQ[Message Queue]
    Workers[Async Workers]
    DB[(Comment Database)]
    Cache[(Redis Cache)]

    Client --> Edge
    Edge --> LB1
    LB1 --> RateLimiter
    RateLimiter --> LB2
    LB2 --> CommentService
    CommentService --> Cache
    CommentService --> DB
    CommentService --> MQ
    MQ --> Workers
    Workers --> DB
```

## Database Replication and Sharding

```mermaid
flowchart TB
    Service[Comment Service]

    subgraph ShardA[Shard by topic_id: A-M]
        PrimaryA[(Primary)]
        SecondaryA1[(Secondary)]
        SecondaryA2[(Secondary)]
        PrimaryA --> SecondaryA1
        PrimaryA --> SecondaryA2
    end

    subgraph ShardB[Shard by topic_id: N-Z]
        PrimaryB[(Primary)]
        SecondaryB1[(Secondary)]
        SecondaryB2[(Secondary)]
        PrimaryB --> SecondaryB1
        PrimaryB --> SecondaryB2
    end

    Service --> PrimaryA
    Service --> PrimaryB
    Service -. read replicas .-> SecondaryA1
    Service -. read replicas .-> SecondaryB1
```
