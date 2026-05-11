package com.taskpulse.tasks.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class TaskEventConsumer {

    private final SimpMessagingTemplate messagingTemplate;

    @KafkaListener(
            topics = "task-events",
            groupId = "taskpulse-websocket-service"
    )
    public void consume(String eventJson) {
        log.info("Received task event: {}", eventJson);
        messagingTemplate.convertAndSend("/topic/tasks", eventJson);
    }
}