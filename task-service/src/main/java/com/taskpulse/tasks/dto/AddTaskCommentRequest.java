package com.taskpulse.tasks.dto;

import jakarta.validation.constraints.NotBlank;

public record AddTaskCommentRequest(
        @NotBlank String content
) {
}