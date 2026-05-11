package com.taskpulse.notifications.events;

import com.fasterxml.jackson.databind.JsonNode;

public record EventEnvelope(
        String type,
        JsonNode payload
) {
}