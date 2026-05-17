# Mermaid Diagrams

## API Flow

```mermaid
sequenceDiagram
    participant Client
    participant API as Top K API
    participant Cache as Redis / Result Cache
    participant Coordinator as Top K Coordinator
    participant Workers as Top K Workers

    Client->>API: GET /top-items?k=100&time_window=1d
    API->>Cache: Read cached top K result

    alt Cache hit
        Cache-->>API: Top K songs
        API-->>Client: 200 OK
    else Cache miss
        API->>Coordinator: Request latest top K
        Coordinator->>Workers: Fetch local top K
        Workers-->>Coordinator: Local top K per partition
        Coordinator->>Coordinator: Merge local results
        Coordinator->>Cache: Store global top K
        Coordinator-->>API: Global top K
        API-->>Client: 200 OK
    end
```

## Global Window Top K, Low QPS

```mermaid
flowchart TD
    A[Play Event Stream] --> B[Single Top K Instance]
    B --> C[HashMap: song_id to count]
    B --> D[Min Heap: top K songs]
    C --> E[Update song count]
    E --> F{Can affect top K?}
    F -- No --> G[Ignore heap update]
    F -- Yes --> H[Update min heap]
    H --> I[Serve all-time top K]
```

## Global Window Top K, High QPS

```mermaid
flowchart TD
    A[Play Event Stream] --> B[Kafka / Pulsar / Kinesis]
    B --> C{Partition by song_id}

    C --> P1[Partition 1]
    C --> P2[Partition 2]
    C --> P3[Partition N]

    P1 --> W1[Worker 1<br/>Local HashMap + Min Heap]
    P2 --> W2[Worker 2<br/>Local HashMap + Min Heap]
    P3 --> W3[Worker N<br/>Local HashMap + Min Heap]

    W1 --> L1[Local Top K]
    W2 --> L2[Local Top K]
    W3 --> L3[Local Top K]

    L1 --> M[Top K Coordinator]
    L2 --> M
    L3 --> M

    M --> R[Merge num_workers * K items]
    R --> C1[Redis / Cache]
    C1 --> API[Top K API]
```

## Snapshot Recovery

```mermaid
flowchart TD
    A[Worker processes partition] --> B[In-memory state]
    B --> C[Heap data]
    B --> D[HashMap counts]
    B --> E[Stream offset]

    C --> S[Periodic Snapshot Store]
    D --> S
    E --> S

    F[Worker crash / restart] --> G[Load latest snapshot]
    G --> H[Restore heap and counts]
    H --> I[Resume from stored stream offset]
    I --> J[Replay missed events]
    J --> K[State caught up]
```

## Sliding Window With Two Offsets

```mermaid
flowchart LR
    A[Event Stream Partition] --> B[Beginning Offset]
    A --> C[End Offset]

    B --> D[Expired Events]
    C --> E[New Events]

    D --> F[Decrement song counts]
    E --> G[Increment song counts]

    F --> H[Update ranking]
    G --> H
    H --> I[Local Sliding Window Top K]
```

## Bucket-Based Sliding Window

```mermaid
flowchart TD
    A[Play Event] --> B{Route by song_id}
    B --> C[Worker Partition]

    C --> D[Current Time Bucket<br/>HashMap song_id to count_in_bucket]
    C --> E[Song Counts<br/>HashMap song_id to current_window_count]
    C --> F[Ranking<br/>TreeMap count to Set of song_id]

    D --> G[Increment bucket count]
    E --> H[Increment window count]
    F --> I[Move song from old count to new count]

    G --> J[Local state updated]
    H --> J
    I --> J
```

## Bucket Expiration

```mermaid
flowchart TD
    A[Window slides forward] --> B[Find expired bucket]
    B --> C[Read per-song counts in expired bucket]
    C --> D[For each song_id, expired_count]
    D --> E[Subtract from song_counts]
    E --> F[Remove song from old TreeMap count]
    F --> G{New count > 0?}
    G -- Yes --> H[Add song to new TreeMap count]
    G -- No --> I[Remove song from song_counts]
    H --> J[Clear expired bucket]
    I --> J
    J --> K[Reuse bucket for new time interval]
```

## Sliding Window Top K Read Path

```mermaid
flowchart TD
    A[Worker] --> B[TreeMap count to Set of song_id]
    B --> C[Iterate counts descending]
    C --> D[Collect songs until K]
    D --> E[Local Top K]

    E --> F[Coordinator]
    F --> G[Merge all local Top K lists]
    G --> H[Global Top K]
    H --> I[Redis / Cache]
    I --> J[Top K API]
```
