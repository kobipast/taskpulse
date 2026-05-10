# TaskPulse

TaskPulse is a real-time event-driven task management system built for learning and experimenting with modern backend architecture concepts.

The project started as a simple Kafka playground and evolved into a full end-to-end system with:

- Spring Boot
- PostgreSQL
- Apache Kafka
- Outbox Pattern
- WebSocket realtime updates
- Live dashboard
- Automated overdue detection
- Realtime comments

---

# Architecture Overview

```text
REST API
   ↓
Spring Service
   ↓
PostgreSQL Transaction
   ↓
Outbox Events
   ↓
Kafka
   ↓
Consumers
   ↓
WebSocket
   ↓
Realtime Dashboard
```

---

# Features

## Tasks
- Create tasks
- Update task status
- Automatic overdue detection
- Persistent PostgreSQL storage

## Comments
- Add comments to tasks
- Realtime comment updates

## Realtime Updates
- WebSocket/STOMP dashboard
- Live task updates
- Live comment updates

## Event-Driven Architecture
- Kafka event bus
- Outbox Pattern for consistency
- Event publishing through scheduled relay

---

# Tech Stack

## Backend
- Java 21
- Spring Boot
- Spring Web
- Spring Kafka
- Spring WebSocket
- Spring Data JPA
- PostgreSQL
- Lombok

## Infrastructure
- Docker
- Docker Compose
- Kafka
- Kafka UI

## Frontend
- Plain HTML/CSS/JavaScript
- STOMP over WebSocket

---

# Project Structure

```text
taskpulse/
├── docker-compose.yml
├── dashboard/
│   └── index.html
├── task-service/
│   ├── src/
│   └── pom.xml
└── README.md
```

---

# Running the Project

## 1. Start infrastructure

```bash
docker compose up -d
```

This starts:
- Kafka
- PostgreSQL
- Kafka UI

---

## 2. Run Spring Boot application

From `task-service`:

```bash
mvn spring-boot:run
```

---

## 3. Run the dashboard

From the `dashboard` directory:

```bash
py -m http.server 5500
```

Open:

```text
http://localhost:5500
```

---

# Kafka UI

Available at:

```text
http://localhost:8081
```

---

# Example API Calls

## Create task

```bash
curl -X POST http://localhost:8080/tasks ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"Finish TaskPulse\",\"dueAt\":\"2026-05-10T18:00:00Z\"}"
```

---

## Update task status

```bash
curl -X PATCH http://localhost:8080/tasks/<TASK_ID>/status ^
  -H "Content-Type: application/json" ^
  -d "{\"status\":\"IN_PROGRESS\"}"
```

---

## Add comment

```bash
curl -X POST http://localhost:8080/tasks/<TASK_ID>/comments ^
  -H "Content-Type: application/json" ^
  -d "{\"content\":\"This is a realtime comment\"}"
```

---

# Current Task Statuses

```text
CREATED
IN_PROGRESS
COMPLETED
OVERDUE
```

---

# Learning Goals

- Event-driven architecture
- Kafka fundamentals
- Distributed systems thinking
- Outbox Pattern
- Realtime communication
- WebSocket/STOMP
- Stateful frontend synchronization
- Background scheduling
- Clean layered backend design

---

# Future Improvements

- Authentication / users
- Notification service
- Python analytics consumer
- Dead Letter Queue (DLQ)
- Retry policies
- Flyway migrations
- Integration tests
- Kanban board UI
- Search and filtering
- Task ownership

---

# License

This project is for educational and portfolio purposes.
