package com.taskpulse.tasks.persistence.entity;

public enum OutboxEventStatus {
    PENDING,
    PUBLISHED,
    FAILED
}