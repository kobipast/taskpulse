package com.taskpulse.tasks.messaging;

import com.taskpulse.tasks.events.EventEnvelope;
import com.taskpulse.tasks.persistence.entity.OutboxEvent;
import com.taskpulse.tasks.persistence.entity.OutboxEventStatus;
import com.taskpulse.tasks.persistence.repository.OutboxEventRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Slf4j
@Component
@RequiredArgsConstructor
public class OutboxPublisher {

    private static final String TOPIC = "task-events";

    private final OutboxEventRepository outboxRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Scheduled(fixedDelay = 1000)
    public void publishPendingEvents() {
        var events = outboxRepository.findTop20ByStatusOrderByCreatedAtAsc(
                OutboxEventStatus.PENDING
        );

        for (OutboxEvent event : events) {
            try {

                EventEnvelope envelope = new EventEnvelope(
                        event.getEventType(),
                        objectMapper.readTree(event.getPayload())
                );

                String json = objectMapper.writeValueAsString(envelope);

                kafkaTemplate.send(
                        TOPIC,
                        event.getAggregateId().toString(),
                        json
                ).get();

                event.setStatus(OutboxEventStatus.PUBLISHED);
                event.setPublishedAt(Instant.now());
                outboxRepository.save(event);

                log.info("Published outbox event {}", event.getId());

            } catch (Exception e) {
                log.error("Failed to publish outbox event {}", event.getId(), e);
            }
        }
    }
}