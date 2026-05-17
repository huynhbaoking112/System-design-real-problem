# Requirements

## Background

### Global, Tumbling, Or Sliding Window

In a typical stream processing system, we need to group events by time windows. There are four types of windows: tumbling window, sliding window, session window, and global window. You can learn more about them in Stream Processing section.

Global window is a window that covers the entire period of data. For example, if we set up a global window, all events will be in the same window regardless of time. In the context of this problem, global window means the top K songs of all time.

```text
Timeline:      0     5    10    15    20    25    30
Events:        e1    e2   e3    e4    e5    e6    e7
Global Win: [---------------------------------------]
```

Tumbling window is a fixed size window that does not slide. Events in the same window are not overlapping and set by a start and end time. For example, if we set up a tumbling window of 10 minutes, all events in the last 10 minutes will be in the same window. At 10:00:00, the window starts and at 10:10:00, the window ends. And the next window will start at 10:10:00 and end at 10:20:00. In the context of this problem, tumbling window means top K songs at predefined time intervals.

```text
Timeline:     0    5    10   15   20   25   30
Events:       e1   e2   e3   e4   e5   e6   e7
Tumbling Win: [----W1----][----W2----][---W3---]
              e1  e2  e3    e4    e5    e6    e7
```

Sliding window is a dynamic window that slides over time. For example, if we set up a sliding window of 10 minutes with a slide interval of 1 minute, all events in the last 10 minutes will be in the same window, but every minute, the window will slide forward by 1 minute. At 10:00:00, the window starts and at 10:10:00, the window ends. At 10:01:00, the window will slide forward to 10:11:00 and so on.

Now there is another question we need to answer about sliding window: is the slide interval fixed or can it be arbitrary?

In a fixed sliding window, the window size and slide interval are predefined. Events are bucketed along a fixed time axis, meaning the windows open and close at fixed intervals, regardless of when events arrive. They are like tumbling windows except that the windows may overlap.

```text
Timeline:      0    5    10   15   20   25   30
Events:        e1   e2   e3   e4   e5   e6   e7
Fixed Win:   [----W1----]
                [----W2----]
                    [----W3----]
```

In a arbitrary sliding window, the slide interval is not fixed. The window size is predefined. Events are bucketed along a dynamic time axis, meaning the windows open and close based on when events arrive.

```text
Events:     e1   e2      e3     e4     e5
Times:      12s  15s     18s    21s    25s
Arbitrary Win:  [12s, 22s)
                    [15s, 25s)
                          [18s, 28s)
```

### Which Type Of Window To Use?

Obviously, if you encounter this problem in an interview, you should clarify with the interviewer which type of sliding window they are asking for.

In the context of the Top K problem, depending on the scenario, we can choose different types of windows. In the real world, a tumbling window of 24 hours is a good choice. For example, Spotify's Top Songs Playlist is updated every 24 hours. The same is likely true for Amazon's Top products per day, YouTube's Top videos etc. Consumers are unlikely care about the top songs or videos of down to the minute or even hour.

However, if the interviewer insists on a more complex scenario, such as the top K songs in the last X minutes using a sliding window, we still need to be able to handle it.

## How Top K Would Be Implemented In Production

Before we begin designing the system, let's answer a commonly asked question - can't we just use Flink to implement the top K aggregator in a sliding window?

### Stream Processor Implementation

Yes, we can and it's only a few lines of code. In production, we could use a stream processor like Apache Flink, Spark Streaming, Kafka Streams, Google Cloud Dataflow, AWS Kinesis, Azure Stream Analytics, or whatever favorite stream processor to implement the top K aggregator. It's a very popular technology and there are many providers out there.

The typical data flow in a stream processor is to read data from a stream (Kafka, Pulsar, Kinesis, etc.), apply transformations and aggregations, and write the result to a stream (Kafka, Pulsar, Kinesis, etc.).

We would write MapReduce style code to:

- Apply transformations (filter, map, aggregate, join, etc.).
- Group or partition the data based on keys (e.g., by `user_id` or `item_id`).
- Use windowing logic (tumbling, sliding, or custom windows).

For example, in Flink, we can use `.window(SlidingEventTimeWindows.of(Time.minutes(10), Time.minutes(1)))` to set up a sliding window of 10 minutes with a slide interval of 1 minute and write a custom `ProcessWindowFunction` to compute the top K items within the window.

Here's a sample implementation of the top K aggregator in a sliding window in Flink.

### Flink Top K Implementation

### Redis Sorted Set Implementation

If the question asks for the top K songs in a Global window, we have an even simpler implementation using Redis's sorted set (ZSET). A sorted set is a data structure that stores elements with a score. Elements are automatically ordered by their score in ascending order. Internally, it's implemented as a hash map and a skip list. The time complexity of the basic operations (add ZADD, remove ZREM) is O(log n). To find the top K elements, we can use ZREVRANGE which has a time complexity of O(log n + K).

Now that we have a good understanding of the background windowing types and how top K would be implemented in production using pre-built technologies, let's move on to the designing the system from scratch.

## Functional Requirements

- The system should allow users to view the top K most played songs of all time. The traffic is limited so that a single instance can handle it.
- The system should allow users to view the top K most played songs of all time. The traffic is high so that we need to scale out the system.
- The system should allow users to view the top K most played songs in the last X time in a sliding window.

## Out Of Scope

- Ingesting streaming data
- User Interface

## Scale Requirements

- There are 10 billion song plays per day.
- There are 100 millions of songs.
- The top K songs API is accessed 1 million times per day.
- K is ~100-1000.

## Non-Functional Requirements

- Low latency, ideally real time.
- High accuracy
