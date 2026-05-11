package com.taskpulse.notifications.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskpulse.notifications.events.EventEnvelope;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventConsumer {

    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "task-events")
    public void consume(String eventJson) {
        log.info("Notification service received event: {}", eventJson);
        try {
            EventEnvelope envelope = objectMapper.readValue(eventJson, EventEnvelope.class);

            if (!"TASK_STATUS_CHANGED".equals(envelope.type())) {
                return;
            }

            String status = envelope.payload().path("status").asText();

            if (!"OVERDUE".equals(status)) {
                return;
            }

            String taskId = envelope.payload().path("taskId").asText();
            String title = envelope.payload().path("title").asText();
            String dueAt = envelope.payload().path("dueAt").asText();

            log.info(
                    "Sending overdue notification | taskId={} | title={} | dueAt={}",
                    taskId,
                    title,
                    dueAt
            );

        } catch (Exception e) {
            log.error("Failed to process notification event: {}", eventJson, e);
        }
    }
}