# Functional Requirements

- **User Authentication:** Users can create an account, log in, and log out. This requires a secure authentication system that can handle 100M Daily Active Users.
- **Comment Submission and Display:** Users can submit comments, which are then stored in a database and displayed under the related content. Assuming each user posts 10 comments every day, and each comment is 100 bytes, the system needs to handle 1 billion comments daily.
- **Replying to Comments:** Users can reply to other comments, with replies nested under the original comment. This requires a system that can handle complex data relationships.
- **Upvote or Downvote Comments:** Users can upvote or downvote comments. This requires a system that can track and update the vote count for each comment in real-time.
- **Moderation Tools:** Administrators can delete inappropriate comments or ban users. This requires a robust administration system that can handle a large volume of moderation actions.

# Non-Functional Requirements

- **Scalability:** The system needs to support 100M Daily Active Users and handle 1 billion comments posted daily.
- **Reliability:** The system must ensure data integrity and error handling.
- **Availability:** The system must be operational when needed, using techniques like replication to avoid downtime.
- **Consistency:** Allow for brief inconsistencies in the system within a few seconds, but the system will reach consistency afterwards (eventual consistency).
- **Latency:** The system must have low latency to provide a smooth user experience.
- **Efficiency:** The system must minimize redundant operations and optimize resource usage.
