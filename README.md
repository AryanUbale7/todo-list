# ⚡ TaskPulse - Modern Full-Stack Task & Todo Management App

**TaskPulse** is a full-featured, responsive task management web application built with a modern stack (**React 18 + Vite + Tailwind CSS** frontend and **Node.js + Express + SQLite** backend). It offers comprehensive organization tools, subtasks checklists, multi-criteria filtering, productivity analytics, keyboard shortcuts, and full JSON backup/restore.

---

## 🌟 Key Features

- **⚡ Complete Task Management (CRUD):** Create, update, delete, view, and complete tasks with instant persistence.
- **🏷️ Category & Tag Organization:** Color-coded customizable categories with icons (Work, Health, Projects, Shopping, Personal, etc.).
- **🔥 Priority Levels:** Low, Medium, High, and Urgent (🔥) tags for smart prioritization.
- **📅 Due Dates & Overdue Alerts:** Automated date badges indicating *Due Today*, *Due Tomorrow*, or *Overdue (by X days)*.
- **✅ Nested Subtasks & Checklists:** Add step-by-step subtasks with interactive progress tracking.
- **📊 Real-time Productivity Dashboard:** Live stats on Completion Rate, Total Tasks, In Progress, Due Today, and Overdue tasks.
- **🔍 Instant Search & Multi-Filters:** Full-text instant search with quick shortcuts, filtering by Status, Category, Priority, and Due Date timeframe.
- **🌓 Dark & Light Mode:** System-aware theme with persistent preference toggle.
- **⌨️ Keyboard Shortcuts:** Fast workflow shortcuts (`N` for new task, `/` for search, `D` for dark theme, `?` for cheatsheet, `Esc` to close).
- **💾 Data Persistence & JSON Backup:** SQLite backend database with export and import functionality.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, PostCSS |
| **Backend** | Node.js, Express.js, SQLite3, CORS, Dotenv |
| **Architecture** | REST API, Monorepo with root orchestrator scripts |

---

## 📁 Project Directory Structure

```text
TODO LIST/
├── package.json              # Root package orchestrator (concurrently)
├── README.md                 # Project documentation & guide
├── server/                   # Backend Express & SQLite API
│   ├── package.json
│   ├── data/                 # SQLite database storage (taskpulse.sqlite)
│   └── src/
│       ├── server.js         # Express server entry point & middleware
│       ├── db.js             # SQLite database layer & schema auto-migration
│       ├── controllers/
│       │   ├── taskController.js      # Task CRUD, filters & stats handlers
│       │   └── categoryController.js  # Category management handlers
│       └── routes/
│           ├── taskRoutes.js          # /api/tasks endpoints
│           └── categoryRoutes.js      # /api/categories endpoints
└── client/                   # Frontend React + Vite + Tailwind application
    ├── package.json
    ├── vite.config.js        # Vite config with API proxy
    ├── tailwind.config.js    # Tailwind configuration & theme
    ├── index.html            # HTML entry point
    └── src/
        ├── main.jsx          # React DOM entry
        ├── App.jsx           # Root application state & layout
        ├── index.css         # Tailwind styles & animations
        ├── services/
        │   └── api.js        # Fetch API service layer
        ├── utils/
        │   └── iconMap.jsx   # Lucide icons mapper
        └── components/
            ├── Header.jsx           # Navbar, search, theme & backup actions
            ├── StatsDashboard.jsx   # Metric cards & completion progress
            ├── FilterBar.jsx        # Status tabs, category chips, sort dropdown
            ├── TaskItem.jsx         # Individual task card with subtasks
            ├── TaskModal.jsx        # Create & edit task modal dialog
            ├── CategoryModal.jsx    # Custom category management modal
            ├── ShortcutsModal.jsx   # Keyboard shortcut cheatsheet
            ├── EmptyState.jsx       # Illustrated empty states
            └── Toast.jsx            # Toast notification banners
```

---

## 🚀 Getting Started & Installation

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)

### 1. Install All Dependencies
Run from the root directory:
```bash
npm run install:all
```
*(Or install root, server, and client dependencies individually using `npm install` inside each folder)*.

### 2. Start Both Backend & Frontend in Development Mode
Run the following single command from the project root:
```bash
npm run dev
```

This will concurrently launch:
- **Backend API Server:** `http://localhost:5000`
- **Frontend Vite App:** `http://localhost:3000`

---

## 🌐 API Reference

### Tasks Endpoints (`/api/tasks`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tasks` | Fetch tasks with query filters (`search`, `status`, `category_id`, `priority`, `timeframe`, `sort_by`, `order`) |
| `GET` | `/api/tasks/stats` | Get aggregated productivity metrics and statistics |
| `GET` | `/api/tasks/:id` | Fetch a single task by ID |
| `POST` | `/api/tasks` | Create a new task |
| `PUT` | `/api/tasks/:id` | Update task details and subtasks |
| `PATCH` | `/api/tasks/:id/toggle` | Toggle task completion status |
| `DELETE` | `/api/tasks/:id` | Delete a task |

### Categories Endpoints (`/api/categories`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/categories` | Fetch all categories with task counts |
| `POST` | `/api/categories` | Create a new custom category |
| `DELETE` | `/api/categories/:id` | Delete a category |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| <kbd>N</kbd> | Open New Task modal |
| <kbd>/</kbd> | Focus global search input |
| <kbd>D</kbd> | Toggle Dark / Light mode |
| <kbd>?</kbd> | Open keyboard shortcuts cheatsheet |
| <kbd>Esc</kbd> | Close active modal |
| <kbd>Ctrl</kbd> + <kbd>Enter</kbd> | Quick-save task in modal |

---

## 📄 License
MIT License. Built for seamless productivity.
