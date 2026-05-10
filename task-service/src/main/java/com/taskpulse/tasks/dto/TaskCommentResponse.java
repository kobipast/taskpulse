package com.taskpulse.tasks.dto;

import java.time.Instant;
import java.util.UUID;

public record TaskCommentResponse(
        UUID id,
        UUID taskId,
        String content,
        Instant createdAt
) {
}