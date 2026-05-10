package com.taskpulse.tasks.events;

public record EventEnvelope(
        String type,
        Object payload
) {
}