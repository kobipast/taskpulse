package com.taskpulse.tasks.scheduler;

import com.taskpulse.tasks.persistence.entity.Task;
import com.taskpulse.tasks.persistence.entity.TaskStatus;
import com.taskpulse.tasks.persistence.repository.TaskRepository;
import com.taskpulse.tasks.service.TaskService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class TaskOverdueScheduler {

    private final TaskRepository taskRepository;
    private final TaskService taskService;

    @Scheduled(fixedDelay = 10000)
    public void markOverdueTasks() {

        List<Task> overdueTasks =
                taskRepository.findByDueAtBeforeAndStatusNotAndStatusNot(
                        Instant.now(),
                        TaskStatus.COMPLETED,
                        TaskStatus.OVERDUE
                );

        for (Task task : overdueTasks) {
            log.info("Marking task as OVERDUE: {}", task.getId());

            taskService.updateTaskStatus(
                    task.getId(),
                    TaskStatus.OVERDUE
            );
        }
    }
}