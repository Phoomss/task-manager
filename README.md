# 📋 Task Management System (TaskSpace)

A premium Task Management Web Application built with a NestJS backend and Next.js (Tailwind CSS v4) frontend.

---

## 🚀 Getting Started

### 1. Database Setup
Ensure you have a running PostgreSQL database. You can run one locally or via Docker Compose.
The backend expects the database connection string in `backend/.env`.

Update the connection string in `backend/.env`:
```env
DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/<database>?schema=public"
```

Once the database details are updated, push the Prisma schema to the database:
```bash
cd backend
npx prisma db push
```

### 2. Start the Backend API (NestJS)
Install dependencies and start the NestJS dev server:
```bash
cd backend
npm install
npm run start:dev
```
- API Endpoint: `http://localhost:3000`
- Swagger API Docs: `http://localhost:3000/api/docs`

### 3. Start the Frontend App (Next.js)
Install dependencies and start the Next.js development server:
```bash
cd frontend
npm install
npm run dev
```
- App URL: `http://localhost:3000` (next dev will run on port `3001` or another free port if port `3000` is taken by the backend).

---

## ✨ Features Implemented

### 🛡️ Backend (NestJS + Prisma + PostgreSQL)
- **Data Model**: Complete database schema matching the requirements with UUIDs, status, priority, and date values.
- **REST Endpoints**:
  - `POST /api/tasks` — Create a new task (with Validation)
  - `GET /api/tasks` — List all tasks with search, status filters, and sorting.
  - `GET /api/tasks/:id` — Retrieve a single task by ID.
  - `PATCH /api/tasks/:id` — Update task details.
  - `DELETE /api/tasks/:id` — Delete a task.
  - `PATCH /api/tasks/:id/status` — Toggle status between `pending` and `completed`.
- **CORS Support**: Configured to connect seamlessly to the frontend client.
- **Prisma 7 Compatibility**: Uses driver-level pooling adapters (`@prisma/adapter-pg`) matching the modern Prisma 7 standard.
- **Swagger Documentation**: Self-documenting Swagger interface available at `/api/docs`.

### 🎨 Frontend (Next.js 16 + Tailwind CSS v4)
- **Interactive UI**: Responsive, rich dark-themed dashboard.
- **Task Management CRUD**: Users can create, view, edit, toggle, and delete tasks dynamically.
- **Filters & Searching**: Real-time filters for Status, Priorities, Sorting, and text search queries.
- **Overdue Detection**: Automatically visualizes when due dates are missed.
- **Visual Feedback & Toasts**: Rich, non-intrusive notification toasts for feedback on every action.
