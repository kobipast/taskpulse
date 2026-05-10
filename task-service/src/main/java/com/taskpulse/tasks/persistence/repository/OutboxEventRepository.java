package com.taskpulse.tasks.persistence.repository;

import com.taskpulse.tasks.persistence.entity.OutboxEvent;
import com.taskpulse.tasks.persistence.entity.OutboxEventStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OutboxEventRepository extends JpaRepository<OutboxEvent, UUID> {

    List<OutboxEvent> findTop20ByStatusOrderByCreatedAtAsc(OutboxEventStatus status);
}