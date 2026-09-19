# 🏛️ TaskPulse Architecture & Technical Design

This document details the architectural blueprint, design principles, database schema, security provisions, and data flows of **TaskPulse Enterprise v2.0**.

---

## 🏗️ 1. High-Level System Architecture

```mermaid
flowchart TD
    subgraph Client ["Frontend Layer (React 18 + Vite + Tailwind CSS)"]
        UI[App UI & Multi-View Engine]
        Views["Views: List | Kanban | Calendar | Analytics | Trash"]
        State[State Management & API Client]
        A11y[WCAG 2.1 AA Accessibility Engine]
        NLPVoice["Voice Speech-to-Text & Quick NLP"]
        Pomo[Pomodoro Focus Timer]
        Confetti[Gamification & Confetti Engine]
        
        UI --> Views
        Views --> State
        NLPVoice --> State
        Pomo --> State
    end

    subgraph Server ["Backend Layer (Node.js + Express)"]
        MW["Middlewares: Helmet | Compression | RateLimiter | CORS"]
        Routes["API Router: /api/tasks | /api/categories"]
        Controllers["Controllers (TaskController, CategoryController)"]
        Services["Services (AIService, AnalyticsService)"]
        
        MW --> Routes
        Routes --> Controllers
        Controllers --> Services
    end

    subgraph Storage ["Persistence Layer (SQLite Database Engine)"]
        DB[(SQLite3 DB: taskpulse.sqlite)]
        Idx["B-Tree Indexes (status, priority, category, due_date, deleted_at)"]
        Logs[Activity Audit Trail]
        
        DB --- Idx
        DB --- Logs
    end

    State <-->|JSON REST API /api/v1| MW
    Services <-->|Parameterized Queries & Connection Pool| DB
```

---

## 📊 2. Database Entity-Relationship (ER) Schema

```mermaid
erDiagram
    CATEGORIES ||--o{ TASKS : classifies
    TASKS ||--o{ ACTIVITY_LOGS : records

    CATEGORIES {
        int id PK
        string name UK
        string color
        string icon
        datetime created_at
    }

    TASKS {
        int id PK
        string title
        string description
        int category_id FK
        string priority
        string status
        string due_date
        string subtasks
        string recurring
        int estimated_minutes
        int time_spent_seconds
        datetime created_at
        datetime updated_at
        datetime completed_at
        datetime deleted_at
    }

    ACTIVITY_LOGS {
        int id PK
        int task_id FK
        string action
        string details
        datetime created_at
    }
```

---

## 🛡️ 3. Security, Scalability & Resilience

| Pillar | Implementation Details |
|---|---|
| **Security Headers** | `helmet` protects against XSS, clickjacking, MIME-sniffing, and SSL downgrade. |
| **Rate Limiting** | `express-rate-limit` mitigates brute-force, scrape, and denial-of-service attempts (1000 req/15m). |
| **SQL Injection Defense** | 100% Parameterized queries with prepared statements through SQLite driver wrappers. |
| **Payload Compression** | Gzip & Brotli HTTP payload compression with `compression`. |
| **Database Performance** | Indexed lookups on query filters (`status`, `priority`, `category_id`, `due_date`, `deleted_at`). |
| **Soft Deletes & Recovery** | Tasks use `deleted_at` timestamp enabling instant recovery from the Trash Bin. |

---

## 🤖 4. AI & NLP Decomposition Engine

The integrated **AI Subtask Generator (`aiService.js`)** performs automated goal decomposition:
- **Heuristic Pattern Matching**: Detects actionable verbs (e.g. *Deploy, Design, Study, Workout, Grocery*) and breaks them down into ordered subtasks.
- **Time Estimation**: Automatically estimates focus duration per subtask.
- **Natural Language Parsing**: Analyzes strings like `"Submit audit slides by tomorrow !urgent #Work"` into structured fields.
