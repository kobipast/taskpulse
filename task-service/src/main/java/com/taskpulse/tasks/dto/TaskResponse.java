package com.taskpulse.tasks.dto;

import com.taskpulse.tasks.persistence.entity.TaskStatus;

import java.time.Instant;
import java.util.UUID;

public record TaskResponse(
        UUID id,
        String title,
        Instant createdAt,
        Instant dueAt,
        TaskStatus status
) {
}