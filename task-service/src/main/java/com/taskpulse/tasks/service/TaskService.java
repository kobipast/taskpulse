package com.taskpulse.tasks.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskpulse.tasks.dto.TaskCommentResponse;
import com.taskpulse.tasks.dto.TaskResponse;
import com.taskpulse.tasks.events.TaskCommentAddedEvent;
import com.taskpulse.tasks.events.TaskCreatedEvent;
import com.taskpulse.tasks.events.TaskStatusChangedEvent;
import com.taskpulse.tasks.persistence.entity.*;
import com.taskpulse.tasks.persistence.repository.OutboxEventRepository;
import com.taskpulse.tasks.persistence.repository.TaskCommentRepository;
import com.taskpulse.tasks.persistence.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final OutboxEventRepository outboxRepository;
    private final ObjectMapper objectMapper;
    private final TaskCommentRepository taskCommentRepository;

    @Transactional
    public UUID createTask(String title, Instant dueAt) {
        Instant now = Instant.now();
        UUID taskId = UUID.randomUUID();

        Task task = Task.builder()
                .id(taskId)
                .title(title)
                .createdAt(now)
                .dueAt(dueAt)
                .status(TaskStatus.CREATED)
                .build();

        taskRepository.save(task);

        TaskCreatedEvent event = new TaskCreatedEvent(
                taskId,
                title,
                now,
                dueAt,
                TaskStatus.CREATED
        );

        OutboxEvent outboxEvent = OutboxEvent.builder()
                .id(UUID.randomUUID())
                .aggregateType("TASK")
                .aggregateId(taskId)
                .eventType("TASK_CREATED")
                .payload(toJson(event))
                .status(OutboxEventStatus.PENDING)
                .createdAt(now)
                .build();

        outboxRepository.save(outboxEvent);

        return taskId;
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize outbox event", e);
        }
    }

    public List<TaskResponse> getAllTasks() {
        return taskRepository.findAll()
                .stream()
                .map(task -> new TaskResponse(
                        task.getId(),
                        task.getTitle(),
                        task.getCreatedAt(),
                        task.getDueAt(),
                        task.getStatus()
                ))
                .toList();
    }

    @Transactional
    public UUID updateTaskStatus(UUID taskId, TaskStatus newStatus) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found: " + taskId));

        task.setStatus(newStatus);

        Task savedTask = taskRepository.save(task);

        TaskStatusChangedEvent event = new TaskStatusChangedEvent(
                savedTask.getId(),
                savedTask.getTitle(),
                savedTask.getCreatedAt(),
                savedTask.getDueAt(),
                savedTask.getStatus(),
                Instant.now()
        );

        OutboxEvent outboxEvent = OutboxEvent.builder()
                .id(UUID.randomUUID())
                .aggregateType("TASK")
                .aggregateId(savedTask.getId())
                .eventType("TASK_STATUS_CHANGED")
                .payload(toJson(event))
                .status(OutboxEventStatus.PENDING)
                .createdAt(Instant.now())
                .build();

        outboxRepository.save(outboxEvent);

        return savedTask.getId();
    }

    @Transactional
    public TaskCommentResponse addComment(UUID taskId, String content) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found: " + taskId));

        Instant now = Instant.now();

        TaskComment comment = TaskComment.builder()
                .id(UUID.randomUUID())
                .task(task)
                .content(content)
                .createdAt(now)
                .build();

        taskCommentRepository.save(comment);

        TaskCommentAddedEvent event = new TaskCommentAddedEvent(
                task.getId(),
                comment.getId(),
                comment.getContent(),
                comment.getCreatedAt()
        );

        OutboxEvent outboxEvent = OutboxEvent.builder()
                .id(UUID.randomUUID())
                .aggregateType("TASK")
                .aggregateId(task.getId())
                .eventType("TASK_COMMENT_ADDED")
                .payload(toJson(event))
                .status(OutboxEventStatus.PENDING)
                .createdAt(now)
                .build();

        outboxRepository.save(outboxEvent);

        return new TaskCommentResponse(
                comment.getId(),
                task.getId(),
                comment.getContent(),
                comment.getCreatedAt()
        );
    }

    public List<TaskCommentResponse> getComments(UUID taskId) {
        return taskCommentRepository.findByTaskIdOrderByCreatedAtAsc(taskId)
                .stream()
                .map(comment -> new TaskCommentResponse(
                        comment.getId(),
                        comment.getTask().getId(),
                        comment.getContent(),
                        comment.getCreatedAt()
                ))
                .toList();
    }
}