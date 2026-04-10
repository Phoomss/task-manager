# 📋 Task Management System — Requirements Document

---

## 1️⃣ Project Overview

A **Task Management Web Application** that allows users to create, manage, and track their daily tasks with a clean, modern interface. Built with enterprise-grade infrastructure including Kubernetes, CI/CD pipelines, and load testing.

---

## 2️⃣ Functional Requirements

### ✅ Task Management
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | User can create a new task with **title** and **description** | High |
| FR-02 | User can edit existing tasks | High |
| FR-03 | User can delete tasks | High |
| FR-04 | User can mark tasks as **completed** or **pending** | High |
| FR-05 | User can view all tasks in a list | High |
| FR-06 | User can filter tasks by status (All / Pending / Completed) | Medium |
| FR-07 | User can add **due date** to a task | Medium |
| FR-08 | User can set **priority level** (Low / Medium / High) | Medium |
| FR-09 | Tasks sorted by creation date (newest first) or due date | Medium |
| FR-10 | User can search tasks by title or description | Low |

### ✅ User Authentication *(if needed)*
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-11 | User can register with email & password | TBD |
| FR-12 | User can login/logout | TBD |
| FR-13 | Each user sees only their own tasks | TBD |

---

## 3️⃣ Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-01 | Page load time under **2 seconds** |
| NFR-02 | Responsive design (works on desktop, tablet, mobile) |
| NFR-03 | API response time under **500ms** |
| NFR-04 | Secure password hashing (if auth is included) |
| NFR-05 | Proper error handling with user-friendly messages |
| NFR-06 | Data persisted in PostgreSQL (no data loss on restart) |
| NFR-07 | System handles **100+ concurrent users** without degradation |
| NFR-08 | 99.9% uptime target (production) |

---

## 4️⃣ Technical Requirements

### Backend (NestJS)
- NestJS with **TypeScript**
- PostgreSQL database
- **Prisma ORM** for type-safe database queries
- RESTful API endpoints
- Validation using **class-validator** & **class-transformer**
- Environment variables via **@nestjs/config**
- Swagger API documentation

### Frontend (Next.js)
- Next.js **App Router** with TypeScript
- Tailwind CSS for styling
- Server Components for data fetching
- Client Components for interactivity
- Axios or Fetch for API calls
- Form handling with **React Hook Form**
- Toast notifications for user feedback

---

## 5️⃣ Infrastructure Requirements

### Containerization (Docker)
| ID | Requirement |
|----|-------------|
| INF-01 | Dockerize **NestJS backend** with multi-stage build |
| INF-02 | Dockerize **Next.js frontend** with multi-stage build |
| INF-03 | Use `.dockerignore` to optimize image size |
| INF-04 | PostgreSQL runs in Docker container |
| INF-05 | Docker Compose for local development |

### Kubernetes (K8s)
| ID | Requirement |
|----|-------------|
| INF-06 | K8s **Deployment** for backend (min 2 replicas) |
| INF-07 | K8s **Deployment** for frontend (min 2 replicas) |
| INF-08 | K8s **Service** (ClusterIP) for internal communication |
| INF-09 | K8s **Ingress** for external access |
| INF-10 | **ConfigMaps** for non-sensitive config |
| INF-11 | **Secrets** for DB credentials |
| INF-12 | **Health checks** (liveness & readiness probes) |
| INF-13 | Resource limits (CPU/Memory) defined |

---

## 6️⃣ CI/CD Pipeline Requirements

### Jenkins Pipeline
| ID | Requirement |
|----|-------------|
| CI-01 | Trigger on **Git push** to main/develop |
| CI-02 | Run **linting & type checking** |
| CI-03 | Run **unit tests** (backend + frontend) |
| CI-04 | Build **Docker images** |
| CI-05 | Push images to **Docker Registry** |
| CI-06 | Deploy to **K8s cluster** |
| CI-07 | Run **k6 load tests** after deployment |
| CI-08 | Send **notifications** (email/Slack) on success/failure |

### GitLab CI Pipeline
| ID | Requirement |
|----|-------------|
| CI-09 | `.gitlab-ci.yml` with **stages**: test → build → deploy |
| CI-10 | Cache dependencies for faster runs |
| CI-11 | Artifact storage (build reports, test results) |
| CI-12 | Environment-specific deployments (staging → production) |

---

## 7️⃣ Load Testing Requirements (k6)

| ID | Requirement |
|----|-------------|
| LT-01 | Test **task creation** endpoint (100 concurrent users) |
| LT-02 | Test **task listing** endpoint (200 concurrent users) |
| LT-03 | Test **task update** endpoint (50 concurrent users) |
| LT-04 | Measure **response times** (p95 < 1s) |
| LT-05 | Measure **error rate** (< 1% allowed) |
| LT-06 | Generate **HTML report** for stakeholders |
| LT-07 | Test **sustained load** for 5 minutes |

---

## 8️⃣ API Endpoints (Proposed)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/tasks` | Create a new task |
| `GET` | `/api/tasks` | Get all tasks (with optional filters) |
| `GET` | `/api/tasks/:id` | Get a single task by ID |
| `PATCH` | `/api/tasks/:id` | Update a task |
| `DELETE` | `/api/tasks/:id` | Delete a task |
| `PATCH` | `/api/tasks/:id/status` | Toggle task status |

---

## 9️⃣ Database Schema (Tasks Table)

```sql
tasks
├── id          UUID (Primary Key)
├── title       VARCHAR(255) NOT NULL
├── description TEXT
├── status      ENUM('pending', 'completed') DEFAULT 'pending'
├── priority    ENUM('low', 'medium', 'high') DEFAULT 'medium'
├── dueDate     TIMESTAMP (nullable)
├── createdAt   TIMESTAMP DEFAULT NOW()
└── updatedAt   TIMESTAMP DEFAULT NOW()
```

---

## 🔟 UI/UX Requirements

- Clean, minimal design
- Clear visual feedback for actions (success/error toasts)
- Loading states during API calls
- Empty state message when no tasks exist
- Confirmation dialog before deleting a task
- Color-coded priority indicators
- Strikethrough styling for completed tasks

---

## 1️⃣1️⃣ Project Structure

```
task-manager/
├── backend/                    # NestJS API
│   ├── src/
│   ├── test/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── package.json
│
├── frontend/                   # Next.js App
│   ├── src/
│   ├── Dockerfile
│   └── package.json
│
├── infrastructure/
│   ├── k8s/
│   │   ├── backend-deployment.yaml
│   │   ├── frontend-deployment.yaml
│   │   ├── postgres-deployment.yaml
│   │   ├── services.yaml
│   │   ├── ingress.yaml
│   │   ├── configmap.yaml
│   │   └── secrets.yaml
│   └── docker-compose.yml
│
├── cicd/
│   ├── Jenkinsfile             # Jenkins pipeline
│   └── .gitlab-ci.yml          # GitLab CI pipeline
│
├── load-tests/
│   ├── task-api-test.js        # k6 load test script
│   └── report-config.json
│
├── docs/                       # Documentation
│
└── REQUIREMENTS.md             # This file
```

---

## 1️⃣2️⃣ CI/CD Flow

```
Developer Push → GitLab/GitHub
        │
        ▼
   [Jenkins / GitLab CI]
        │
        ├──▶ Lint & Type Check
        │
        ├──▶ Run Unit Tests
        │
        ├──▶ Build Docker Images
        │
        ├──▶ Push to Registry
        │
        ├──▶ Deploy to K8s
        │
        └──▶ Run k6 Load Tests
                │
                ├──▶ Pass → ✅ Notify Success
                └──▶ Fail → ❌ Rollback + Notify
```

---

## 1️⃣3️⃣ Open Questions

| # | Question | Status |
|---|----------|--------|
| Q1 | User authentication required? | TBD |
| Q2 | K8s cluster: local (Minikube/Kind) or cloud (EKS/GKE)? | TBD |
| Q3 | Docker Registry: Docker Hub, GitLab Registry, or private? | TBD |
| Q4 | Notification channel: Email, Slack, Discord? | TBD |

---

**Version:** 1.0  
**Last Updated:** April 9, 2026  
**Status:** Draft — Awaiting Confirmation
