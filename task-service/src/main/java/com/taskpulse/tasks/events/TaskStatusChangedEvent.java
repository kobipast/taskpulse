package com.taskpulse.tasks.events;

import com.taskpulse.tasks.persistence.entity.TaskStatus;

import java.time.Instant;
import java.util.UUID;

public record TaskStatusChangedEvent(
        UUID taskId,
        String title,
        Instant createdAt,
        Instant dueAt,
        TaskStatus status,
        Instant changedAt
) {
}