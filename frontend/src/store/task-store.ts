"use client";

import { create } from "zustand";
import { api, type Task } from "@/lib/api";

type TaskState = {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  addTask: (title: string) => Promise<void>;
  toggleTask: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
};

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      const tasks = await api.listTasks();
      set({ tasks, loading: false });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : "Failed to load tasks" });
    }
  },
  addTask: async (title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    set({ error: null });
    const task = await api.createTask(trimmed);
    set({ tasks: [task, ...get().tasks] });
  },
  toggleTask: async (task: Task) => {
    set({ error: null });
    const updated = await api.updateTask(task.id, { completed: !task.completed });
    set({ tasks: get().tasks.map((t) => (t.id === task.id ? updated : t)) });
  },
  deleteTask: async (id: string) => {
    set({ error: null });
    await api.deleteTask(id);
    set({ tasks: get().tasks.filter((t) => t.id !== id) });
  },
}));
