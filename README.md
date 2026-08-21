# TeamFlow — Team Project & Task Management Application

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.2+-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4+-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com)

> **Full Stack Developer Assignment Submission** for **Zylentrix / SHE STARTS**  
> Primary Source of Truth: Assignment Objective & Specifications.

---

## 🌟 Executive Summary

**TeamFlow** is an enterprise-grade, full-stack project and task management platform. It features strict **Role-Based Access Control (RBAC)** distinguishing **Admin** and **Team Member** capabilities, real-time completion analytics, threaded progress discussions, and a dedicated **Task Deadline Audit Trail** satisfying the mandatory Additional Challenge.

---

## 🚀 Core Features Matrix

| Feature | Admin | Team Member | Description |
|---|:---:|:---:|---|
| **User Authentication** | ✅ | ✅ | JWT-secured login, registration, and password hashing (bcrypt). |
| **Project Creation & Deletion** | ✅ | ❌ | Create, edit, and delete workspace projects with auto-member enrollment. |
| **Project Member Assignment** | ✅ | ❌ | Add or remove team members from specific projects. |
| **Task Creation & Assignment** | ✅ | ❌ | Create tasks, assign priorities (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), and set deadlines. |
| **Task Status Updates** | ✅ | ✅ | Move tasks across workflow (`TODO` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `IN_REVIEW` $\rightarrow$ `COMPLETED`). |
| **Comments & Progress Updates** | ✅ | ✅ | Post and delete progress updates and discussions on tasks. |
| **Deadline Change Audit History** | ✅ | ✅ (View) | **Mandatory Challenge**: Automatically record previous deadline, updated deadline, timestamp, and changing Admin. |
| **Workload & Progress Analytics** | ✅ | ✅ | Interactive dashboard with completion rates, overdue counters, and team workload tables. |

---

## 🛠️ Technology Stack

* **Frontend**: React 18, Vite, Tailwind CSS, Axios, React Router v6, Lucide React
* **Backend**: Python 3.12, FastAPI, SQLAlchemy 2.0 (Async ORM), Pydantic v2
* **Database**: PostgreSQL 16 with `asyncpg` async driver
* **Authentication**: JWT (JSON Web Tokens), `passlib` with `bcrypt`
* **Containerization & Testing**: Docker, Docker Compose, `pytest`, `httpx`

---

## 🗄️ Database & Entity-Relationship (ER) Architecture

```
  ┌────────────────┐               1:N               ┌───────────────────────┐
  │     users      │────────────────────────────────<│       projects        │
  └───────┬────────┘                                 └───────────┬───────────┘
          │                                                      │
          │ 1:N (Members)                                        │ 1:N
          │                                                      │
  ┌───────▼──────────────┐                               ┌───────▼───────────┐
  │   project_members    │>──────────────────────────────│       tasks       │
  └──────────────────────┘                               └───────────┬───────┘
                                                                     │
                                  ┌──────────────────────────────────┴──────────────────────────────────┐
                                  │ 1:N                                                                 │ 1:N
                       ┌──────────▼───────────┐                                              ┌──────────▼──────────────┐
                       │    task_comments     │                                              │ task_deadline_histories │
                       └──────────────────────┘                                              └─────────────────────────┘
```

### Table Definitions & Constraints

1. **`users`**:
   * `id` (UUID, Primary Key)
   * `email` (VARCHAR(255), Unique, Indexed)
   * `username` (VARCHAR(100), Unique, Indexed)
   * `full_name` (VARCHAR(255))
   * `hashed_password` (VARCHAR(255))
   * `role` (ENUM: `ADMIN`, `TEAM_MEMBER`)
   * `is_active` (BOOLEAN, Default: `TRUE`)
   * `created_at`, `updated_at` (TIMESTAMPTZ)

2. **`projects`**:
   * `id` (UUID, Primary Key)
   * `title` (VARCHAR(255), Indexed)
   * `description` (TEXT, Nullable)
   * `status` (ENUM: `PLANNING`, `ACTIVE`, `ON_HOLD`, `COMPLETED`)
   * `created_by_id` (UUID, FK $\rightarrow$ `users.id` ON DELETE RESTRICT)
   * `created_at`, `updated_at` (TIMESTAMPTZ)

3. **`project_members`**:
   * `id` (UUID, Primary Key)
   * `project_id` (UUID, FK $\rightarrow$ `projects.id` ON DELETE CASCADE)
   * `user_id` (UUID, FK $\rightarrow$ `users.id` ON DELETE CASCADE)
   * `joined_at` (TIMESTAMPTZ)
   * *Constraint*: `UNIQUE(project_id, user_id)`

4. **`tasks`**:
   * `id` (UUID, Primary Key)
   * `project_id` (UUID, FK $\rightarrow$ `projects.id` ON DELETE CASCADE, Indexed)
   * `title` (VARCHAR(255), Indexed)
   * `description` (TEXT, Nullable)
   * `assigned_to_id` (UUID, FK $\rightarrow$ `users.id` ON DELETE SET NULL, Nullable, Indexed)
   * `created_by_id` (UUID, FK $\rightarrow$ `users.id` ON DELETE RESTRICT)
   * `priority` (ENUM: `LOW`, `MEDIUM`, `HIGH`, `URGENT`)
   * `status` (ENUM: `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `COMPLETED`)
   * `deadline` (TIMESTAMPTZ, Nullable, Indexed)
   * `created_at`, `updated_at` (TIMESTAMPTZ)

5. **`task_comments`**:
   * `id` (UUID, Primary Key)
   * `task_id` (UUID, FK $\rightarrow$ `tasks.id` ON DELETE CASCADE, Indexed)
   * `author_id` (UUID, FK $\rightarrow$ `users.id` ON DELETE RESTRICT)
   * `content` (TEXT)
   * `created_at`, `updated_at` (TIMESTAMPTZ)

6. **`task_deadline_histories`** *(Mandatory Additional Challenge)*:
   * `id` (UUID, Primary Key)
   * `task_id` (UUID, FK $\rightarrow$ `tasks.id` ON DELETE CASCADE, Indexed)
   * `previous_deadline` (TIMESTAMPTZ, Nullable)
   * `new_deadline` (TIMESTAMPTZ, Not Null)
   * `changed_by_id` (UUID, FK $\rightarrow$ `users.id` ON DELETE RESTRICT)
   * `changed_at` (TIMESTAMPTZ, Default: `NOW()`)
   * `reason` (VARCHAR(255), Nullable)

---

## 🎯 Deadline History Workflow (Additional Challenge)

When an Admin modifies a task's deadline via `PATCH /api/v1/tasks/{id}`:
1. The backend inspects if `deadline` has changed compared to `task.deadline`.
2. If modified, it records an immutable audit log entry in `task_deadline_histories` with:
   - `task_id`: Target task UUID
   - `previous_deadline`: Previous datetime value
   - `new_deadline`: Newly assigned datetime value
   - `changed_by_id`: Authenticated Admin UUID
   - `changed_at`: UTC Timestamp of the event
   - `reason`: Admin's stated justification
3. The UI allows any team member or admin to click **"History"** on a task to view the timeline breakdown with color-coded dates and reasons.

---

## ⚡ Quick Start with Docker (Recommended)

Run the entire application stack (PostgreSQL + FastAPI + React) in one command:

```bash
docker compose up --build
```

* **Frontend UI**: [http://localhost:3000](http://localhost:3000)
* **Backend API Docs (Swagger)**: [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)

---

## 🔧 Manual Local Setup

### 1. Prerequisites
* Python 3.10+
* Node.js 18+ & npm
* PostgreSQL 14+ running locally on port 5432

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Windows:
.\venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt

# Initialize database and seed demo data
python manage.py seed-db

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Pre-seeded Demo Credentials

| Role | Email | Password | Identifier |
|---|---|---|---|
| **Admin** | `admin@teamflow.com` | `AdminPass123!` | `admin` |
| **Team Member** | `member@teamflow.com` | `MemberPass123!` | `john_dev` |
| **Team Member 2** | `sarah@teamflow.com` | `MemberPass123!` | `sarah_qa` |

*(The login page includes 1-click demo login buttons for instant access).*

---

## 📚 REST API Reference

### Authentication (`/api/v1/auth`)
* `POST /auth/register` — Register a new account (Public)
* `POST /auth/login` — Login and receive JWT access token (Public)
* `GET /auth/me` — Get current user profile (Authenticated)
* `POST /auth/seed-demo` — Seed demo workspace data

### Users & Team Management (`/api/v1/users`)
* `GET /users` — List team members (Authenticated)
* `GET /users/summaries` — Lightweight user summaries for dropdowns (Authenticated)
* `GET /users/stats` — Team member task workload distribution (Admin)
* `POST /users` — Create new user account (Admin)
* `PATCH /users/{id}` — Update user role or active status (Admin)
* `DELETE /users/{id}` — Remove user account (Admin)

### Projects (`/api/v1/projects`)
* `POST /projects` — Create project with initial members (Admin)
* `GET /projects` — List projects with computed completion % (Authenticated)
* `GET /projects/{id}` — Project details, member roster, and task breakdown (Authenticated)
* `PATCH /projects/{id}` — Update project status or details (Admin)
* `DELETE /projects/{id}` — Delete project and cascade tasks (Admin)
* `POST /projects/{id}/members` — Add member to project (Admin)
* `DELETE /projects/{id}/members/{user_id}` — Remove member from project (Admin)

### Tasks (`/api/v1/tasks`)
* `POST /tasks` — Create task with priority and deadline (Admin)
* `GET /tasks` — List tasks with search, project, status, and priority filters (Authenticated)
* `GET /tasks/{id}` — Single task details with relation counts (Authenticated)
* `PATCH /tasks/{id}` — Update task (Admin: all fields + deadline; Member: status only)
* `DELETE /tasks/{id}` — Delete task (Admin)

### Comments & Progress (`/api/v1/tasks/{id}/comments`)
* `GET /tasks/{id}/comments` — List task comments in chronological order (Authenticated)
* `POST /tasks/{id}/comments` — Post progress update / comment (Authenticated)
* `DELETE /tasks/{id}/comments/{comment_id}` — Delete comment (Admin or author)

### Deadline History Audit (`/api/v1/tasks/{id}/deadline-history`)
* `GET /tasks/{id}/deadline-history` — Fetch full timeline of deadline changes (Authenticated)

---

## 🧪 Automated Testing

Execute the automated test suite covering authentication, RBAC policies, project lifecycles, and deadline history auditing:

```bash
cd backend
pytest -v
```

---

## ✅ Final Submission Checklist

- [x] Functional Full-Stack Application (React + FastAPI + PostgreSQL)
- [x] Admin Role: Create projects, add members, create/assign tasks, set priorities/deadlines, monitor progress
- [x] Team Member Role: View assigned tasks, update task status, add comments, view deadlines
- [x] **Mandatory Additional Challenge**: Deadline History audit log (previous, new, who, when)
- [x] JWT Authentication & Bcrypt Password Hashing
- [x] Role-Based Access Control (RBAC) enforced on backend & frontend
- [x] Clean PostgreSQL relational schema with foreign key cascades & timestamps
- [x] Form validation, loading states, error states, and responsive dark-mode UI
- [x] Automated `pytest` test suite
- [x] Docker & Docker Compose configuration
- [x] Comprehensive README with setup instructions, ER diagram, and API reference
