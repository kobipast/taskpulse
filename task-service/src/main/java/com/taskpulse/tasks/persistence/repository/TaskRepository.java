package com.taskpulse.tasks.persistence.repository;

import com.taskpulse.tasks.persistence.entity.Task;
import com.taskpulse.tasks.persistence.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, UUID> {

    List<Task> findByDueAtBeforeAndStatusNotAndStatusNot(
            Instant now,
            TaskStatus status1,
            TaskStatus status2
    );
}