package com.taskpulse.tasks.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

    @Id
    private UUID id;
    private String title;
    private Instant createdAt;
    private Instant dueAt;

    @Enumerated(EnumType.STRING)
    private TaskStatus status;
}