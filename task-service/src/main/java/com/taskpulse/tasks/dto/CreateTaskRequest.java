package com.taskpulse.tasks.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record CreateTaskRequest(
        @NotBlank String title,
        @NotNull Instant dueAt
) {}
