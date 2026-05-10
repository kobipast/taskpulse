package com.taskpulse.tasks.api;

import com.taskpulse.tasks.dto.AddTaskCommentRequest;
import com.taskpulse.tasks.dto.TaskCommentResponse;
import com.taskpulse.tasks.dto.TaskResponse;
import com.taskpulse.tasks.dto.UpdateTaskStatusRequest;
import com.taskpulse.tasks.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService service;

    @PostMapping
    public String createTask(@RequestBody CreateTaskRequest request) {
        UUID id = service.createTask(request.title(), request.dueAt());
        return "Task created: " + id;
    }

    public record CreateTaskRequest(String title, Instant dueAt) {}

    @GetMapping
    public List<TaskResponse> getTasks() {
        return service.getAllTasks();
    }

    @PatchMapping("/{id}/status")
    public String updateTaskStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTaskStatusRequest request
    ) {
        UUID updatedId = service.updateTaskStatus(id, request.status());
        return "Task status updated: " + updatedId;
    }

    @PostMapping("/{id}/comments")
    public TaskCommentResponse addComment(
            @PathVariable UUID id,
            @Valid @RequestBody AddTaskCommentRequest request
    ) {
        return service.addComment(id, request.content());
    }

    @GetMapping("/{id}/comments")
    public List<TaskCommentResponse> getComments(@PathVariable UUID id) {
        return service.getComments(id);
    }
}