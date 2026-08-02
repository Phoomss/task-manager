"use client";

import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  SlidersHorizontal, 
  Calendar, 
  AlertCircle,
  X,
  Check,
  Loader2,
  ListTodo,
  Info
} from "lucide-react";

// Types matching Backend Prisma output
interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "pending" | "completed";
  priority: "low" | "medium" | "high";
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function Home() {
  // Task State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPriority, setFormPriority] = useState<"low" | "medium" | "high">("medium");
  const [formDueDate, setFormDueDate] = useState("");

  // Toast Notifications State
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" | "info" }[]>([]);

  // Show toast notification helper
  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Fetch Tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (statusFilter !== "all") queryParams.append("status", statusFilter);
      if (search) queryParams.append("search", search);
      queryParams.append("sortBy", sortBy);
      queryParams.append("sortOrder", sortOrder);

      const response = await fetch(`${BACKEND_URL}/api/tasks?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch tasks from the server.");
      }
      
      let data: Task[] = await response.json();
      
      // Client-side filtering for priority since backend handles status & search
      if (priorityFilter !== "all") {
        data = data.filter((t) => t.priority === priorityFilter);
      }

      setTasks(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
      showToast(err.message || "Failed to load tasks", "error");
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when filters change
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchTasks();
    }, 300); // Debounce search
    return () => clearTimeout(delayDebounce);
  }, [search, statusFilter, priorityFilter, sortBy, sortOrder]);

  // Handle Create or Update Task
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast("Title is required", "error");
      return;
    }

    try {
      const taskData = {
        title: formTitle,
        description: formDescription || undefined,
        priority: formPriority,
        dueDate: formDueDate ? new Date(formDueDate).toISOString() : undefined,
      };

      let response;
      if (editingTask) {
        // Edit mode
        response = await fetch(`${BACKEND_URL}/api/tasks/${editingTask.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        });
      } else {
        // Create mode
        response = await fetch(`${BACKEND_URL}/api/tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        });
      }

      if (!response.ok) {
        throw new Error("Failed to save task.");
      }

      showToast(
        editingTask ? "Task updated successfully" : "Task created successfully", 
        "success"
      );
      
      closeModal();
      fetchTasks();
    } catch (err: any) {
      showToast(err.message || "An error occurred while saving the task.", "error");
    }
  };

  // Handle Toggle Status
  const handleToggleStatus = async (id: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/tasks/${id}/status`, {
        method: "PATCH",
      });
      if (!response.ok) {
        throw new Error("Failed to update status.");
      }
      
      const updatedTask = await response.json();
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
      showToast(
        updatedTask.status === "completed" ? "Task completed! 🎉" : "Task set to pending",
        "success"
      );
    } catch (err: any) {
      showToast(err.message || "Failed to update status", "error");
    }
  };

  // Handle Delete Task
  const handleDeleteTask = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/tasks/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete task.");
      }
      
      setTasks(prev => prev.filter(t => t.id !== id));
      showToast("Task deleted", "info");
    } catch (err: any) {
      showToast(err.message || "Failed to delete task", "error");
    }
  };

  // Open Modal for Editing
  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDescription(task.description || "");
    setFormPriority(task.priority);
    setFormDueDate(task.dueDate ? task.dueDate.substring(0, 16) : "");
    setIsModalOpen(true);
  };

  // Open Modal for Creating
  const openCreateModal = () => {
    setEditingTask(null);
    setFormTitle("");
    setFormDescription("");
    setFormPriority("medium");
    setFormDueDate("");
    setIsModalOpen(true);
  };

  // Close Modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  // Count helper
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const pendingTasks = tasks.filter(t => t.status === "pending").length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Toast Manager */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md animate-slide-in transition-all duration-300 ${
              toast.type === "success"
                ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-200"
                : toast.type === "error"
                ? "bg-rose-950/80 border-rose-500/30 text-rose-200"
                : "bg-blue-950/80 border-blue-500/30 text-blue-200"
            }`}
          >
            {toast.type === "success" && <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />}
            {toast.type === "error" && <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />}
            {toast.type === "info" && <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />}
            <div className="flex-1 text-sm font-medium">{toast.message}</div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Main Container */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 md:py-12 flex flex-col gap-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/20 text-white">
              <ListTodo className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-200">
                TaskSpace
              </h1>
              <p className="text-sm text-slate-400">Premium task management space</p>
            </div>
          </div>
          
          {/* Stats Bar */}
          <div className="flex items-center gap-3 self-stretch md:self-auto overflow-x-auto pb-1 md:pb-0">
            <div className="bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-800/40 flex flex-col min-w-[70px] items-center">
              <span className="text-xs text-slate-400">Total</span>
              <span className="text-lg font-bold text-slate-200">{totalTasks}</span>
            </div>
            <div className="bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-800/40 flex flex-col min-w-[70px] items-center">
              <span className="text-xs text-slate-400 text-amber-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Pending
              </span>
              <span className="text-lg font-bold text-amber-400">{pendingTasks}</span>
            </div>
            <div className="bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-800/40 flex flex-col min-w-[70px] items-center">
              <span className="text-xs text-slate-400 text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Done
              </span>
              <span className="text-lg font-bold text-emerald-400">{completedTasks}</span>
            </div>
            <button
              onClick={openCreateModal}
              className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold px-4 py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all text-sm whitespace-nowrap self-stretch"
            >
              <Plus className="w-5 h-5" /> New Task
            </button>
          </div>
        </header>

        {/* Filters and Controls */}
        <section className="bg-slate-900/20 p-5 rounded-2xl border border-slate-800/50 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 placeholder-slate-500 transition-all text-slate-100"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950/80 border border-slate-800/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-300"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-slate-950/80 border border-slate-800/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-300"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-950/80 border border-slate-800/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-300"
              >
                <option value="createdAt">Created Date</option>
                <option value="dueDate">Due Date</option>
              </select>

              <button
                onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                className="bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 active:bg-slate-900 rounded-xl px-4 py-3 text-sm flex items-center gap-2 text-slate-300 transition-colors"
                title="Toggle sort direction"
              >
                <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                <span>{sortOrder === "asc" ? "Asc" : "Desc"}</span>
              </button>
            </div>
          </div>
        </section>

        {/* Task List Section */}
        <main className="flex-1 flex flex-col">
          {loading && tasks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
              <span>Fetching tasks...</span>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 gap-3 text-rose-400 bg-rose-950/10 border border-rose-900/30 rounded-2xl p-6">
              <AlertCircle className="w-12 h-12 text-rose-500" />
              <h3 className="font-semibold text-lg">Connection Error</h3>
              <p className="text-slate-400 text-sm text-center max-w-md">
                Could not connect to the backend server. Make sure the NestJS backend is running at <code className="bg-slate-950 px-2 py-1 rounded text-rose-300 font-mono text-xs">{BACKEND_URL}</code>.
              </p>
              <button 
                onClick={fetchTasks}
                className="mt-2 bg-rose-900/40 hover:bg-rose-900/60 text-rose-200 border border-rose-800 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                Retry Connection
              </button>
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-24 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/5">
              <ListTodo className="w-16 h-16 text-slate-700 mb-4" />
              <h3 className="text-lg font-semibold text-slate-300">No tasks found</h3>
              <p className="text-slate-500 text-sm max-w-sm mt-1">
                There are no tasks matching your filters. Create a new task to get started!
              </p>
              <button
                onClick={openCreateModal}
                className="mt-6 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Create task
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.map((task) => {
                const isCompleted = task.status === "completed";
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted;
                
                return (
                  <article 
                    key={task.id}
                    className={`group bg-slate-900/30 hover:bg-slate-900/50 rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm ${
                      isCompleted 
                        ? "border-slate-800/40 opacity-70" 
                        : "border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {/* Upper content */}
                    <div className="p-5 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        {/* Status Checkbox */}
                        <button
                          onClick={() => handleToggleStatus(task.id)}
                          className="text-slate-400 hover:text-indigo-400 transition-colors mt-1"
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-indigo-500 fill-indigo-500/10" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-500 hover:text-indigo-400" />
                          )}
                        </button>

                        {/* Title and Description */}
                        <div className="flex-1 flex flex-col gap-1 min-w-0">
                          <h4 className={`font-semibold text-slate-200 break-words ${isCompleted ? "line-through text-slate-500" : ""}`}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className={`text-sm text-slate-400 line-clamp-3 break-words ${isCompleted ? "line-through text-slate-600" : ""}`}>
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Priority indicator */}
                        <div className="flex-shrink-0">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                            task.priority === "high"
                              ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                              : task.priority === "medium"
                              ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer / Meta info */}
                    <div className="px-5 py-3.5 bg-slate-900/60 border-t border-slate-800/40 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-3">
                        {task.dueDate ? (
                          <div className={`flex items-center gap-1.5 ${isOverdue ? "text-rose-400 font-medium" : ""}`}>
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              {new Date(task.dueDate).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </span>
                            {isOverdue && <span className="text-[10px] bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.2 rounded">Overdue</span>}
                          </div>
                        ) : (
                          <span className="text-slate-600">No due date</span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(task)}
                          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                          title="Edit Task"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1.5 hover:bg-rose-950/40 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                          title="Delete Task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Slide-over / Modal for Task Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-100">
                {editingTask ? "Edit Task Details" : "Create New Task"}
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              {/* Task Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Task title..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-slate-100"
                />
              </div>

              {/* Task Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  placeholder="Task description (optional)..."
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-slate-100 resize-none"
                />
              </div>

              {/* Priority and Due Date Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200"
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200 [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-sm text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/10"
                >
                  {editingTask ? "Save Changes" : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
