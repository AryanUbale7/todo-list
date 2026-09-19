# FocusList - Modern Frontend-Only To-Do Application 🚀

FocusList is a fast, responsive, and intuitive frontend-only task and productivity management application built with **React**, **Vite**, and **Tailwind CSS**. It is designed for maximum efficiency with zero server overhead, featuring instant `localStorage` persistence, advanced filtering, priority management, keyboard shortcuts, and responsive analytics.

---

## ✨ Key Features & Capabilities

### 1. 📝 Task Creation & Management
- **Add Tasks (`TaskForm`, `AddTask`, `TaskInput`):** Add tasks with a title, description, category, due date, and priority level.
- **Task Management (`TaskItem`, `TaskCard`, `TaskActions`, `EditTask`, `DeleteTask`):** Mark tasks complete, inline edit, delete with soft-delete/trash and permanent purge support.
- **Subtasks & Breakdown:** Add interactive subtasks with real-time completion tracking.

### 2. 🎯 Priority Management
- **Task Priorities (`PrioritySelector`, `PriorityBadge`, `TaskPriority`):** Assign and filter tasks with color-coded badges for **High**, **Medium**, **Low**, and **Urgent** priorities.

### 3. 🔍 Search & Advanced Filtering
- **Search by Title (`TaskSearch`, `SearchInput`):** Real-time instant search across task titles and descriptions.
- **Status & Priority Filters (`TaskFilter`, `FilterControls`, `FilterBar`):** Filter by status (**All**, **Active / Pending**, **Completed**), category, priority, and due date.
- **Smart Sorting:** Sort by Date Created, Due Date, Priority, or Alphabetical title order.

### 4. 📊 Task Statistics & Productivity
- **Live Metrics (`TaskStats`, `TaskStatistics`, `ProgressSummary`, `TaskSummary`):** Instant dashboard showing **Total Tasks**, **Completed Tasks**, **Pending Tasks**, and overall **Completion Rate**.
- **Interactive Views:** Switch seamlessly between List View, Kanban Board, Calendar, Analytics Dashboard, and Trash.
- **Pomodoro Focus Timer & Gamification:** Built-in focus timer with completion streaks and celebration confetti.

### 5. 💾 Data Persistence & Portability
- **100% Client-Side (`localStorage`):** Retains all task data, categories, and theme settings locally across sessions.
- **Import & Export:** Export full workspace data to JSON backup or CSV spreadsheet and restore anytime.

---

## 🛠️ Tech Stack
- **Framework:** React 18 (Vite SPA)
- **Styling:** Tailwind CSS + Lucide Icons
- **Effects:** Canvas Confetti
- **Storage:** Browser `localStorage` (Key: `focuslist_tasks`)

---

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Local Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Run Tests
```bash
npm test
```

---

## 🧪 Testing

Automated domain tests verify all core operations including task creation, status transitions, priority updates, active/completed filtering, and bulk clearance. Run:
```bash
npm test
```

---

## 📄 License
MIT © FocusList
