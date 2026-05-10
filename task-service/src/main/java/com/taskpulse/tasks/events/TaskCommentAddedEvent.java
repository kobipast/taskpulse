package com.taskpulse.tasks.events;

import java.time.Instant;
import java.util.UUID;

public record TaskCommentAddedEvent(
        UUID taskId,
        UUID commentId,
        String content,
        Instant createdAt
) {
}