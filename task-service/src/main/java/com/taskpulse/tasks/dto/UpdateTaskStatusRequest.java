package com.taskpulse.tasks.dto;

import com.taskpulse.tasks.persistence.entity.TaskStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateTaskStatusRequest(
        @NotNull TaskStatus status
) {
}