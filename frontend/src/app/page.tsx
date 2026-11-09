"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Inbox, ListTodo, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useTaskStore } from "@/store/task-store";

export default function Home() {
  const { tasks, loading, error, fetchTasks, addTask, toggleTask, deleteTask } = useTaskStore();
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks]);

  const total = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const remaining = total - completedCount;
  const progress = total === 0 ? 0 : Math.round((completedCount / total) * 100);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await addTask(title);
      setTitle("");
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteTask(id);
    } finally {
      setDeletingId(null);
    }
  }

  function pluralizeTasks(n: number) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return "задача";
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "задачи";
    return "задач";
  }

  const stats = [
    { label: "Всего", value: total, icon: ListTodo, tone: "text-blue-600 bg-blue-50" },
    { label: "Выполнено", value: completedCount, icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-50" },
    { label: "Осталось", value: remaining, icon: Inbox, tone: "text-amber-600 bg-amber-50" },
  ];

  return (
    <div className="page-bg min-h-screen">
      <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/25">
              <ListTodo className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-900">Task Management</p>
              <p className="text-xs text-slate-500">Управление задачами</p>
            </div>
          </div>
          <span className="hidden rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500 sm:inline-block">
            {total} {pluralizeTasks(total)}
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 pb-20 pt-8 sm:px-6">
        <div className="animate-fade-up">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Управление задачами</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
            Добавляйте задачи, отмечайте выполнение и удаляйте лишнее. Данные сохраняются на сервере.
          </p>
        </div>

        <div className="animate-fade-up mt-6 grid grid-cols-3 gap-3 sm:gap-4" style={{ animationDelay: "60ms" }}>
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm transition-shadow hover:shadow-md sm:p-4"
            >
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.tone}`}>
                <stat.icon className="h-4 w-4" />
              </span>
              <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight text-slate-900 sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-0.5 text-xs font-medium text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="animate-fade-up mt-4" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Прогресс</span>
            <span className="tabular-nums text-slate-700">{progress}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-primary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div
          className="animate-fade-up mt-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5"
          style={{ animationDelay: "140ms" }}
        >
          <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Новая задача..."
              aria-label="Название задачи"
              maxLength={500}
              className="h-11 flex-1"
            />
            <Button
              type="submit"
              disabled={submitting || !title.trim()}
              className="h-11 shrink-0 px-5 sm:w-auto"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              <span>Добавить</span>
            </Button>
          </form>

          {error ? (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Не удалось выполнить запрос: {error}</span>
            </div>
          ) : null}
        </div>

        <div className="animate-fade-up mt-6" style={{ animationDelay: "180ms" }}>
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Задачи</h2>
            <span className="text-xs text-slate-400">
              {completedCount} из {total} выполнено
            </span>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-2xl border border-slate-200/70 bg-white/70"
                  style={{ animationDelay: `${i * 120}ms` }}
                />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-14 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <Inbox className="h-6 w-6 text-slate-400" />
              </span>
              <p className="mt-4 text-sm font-medium text-slate-700">Пока нет задач</p>
              <p className="mt-1 text-sm text-slate-500">Добавьте первую — она появится здесь.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {tasks.map((task, index) => (
                <li
                  key={task.id}
                  className="animate-fade-up group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                  style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => void toggleTask(task)}
                    aria-label={task.completed ? "Снять отметку выполнения" : "Отметить выполненной"}
                  />
                  <span
                    className={`min-w-0 flex-1 break-words text-sm ${
                      task.completed ? "text-slate-400 line-through" : "text-slate-800"
                    }`}
                  >
                    {task.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => void onDelete(task.id)}
                    disabled={deletingId === task.id}
                    aria-label="Удалить задачу"
                    className="h-8 w-8 text-slate-400 opacity-100 hover:bg-red-50 hover:text-red-600 focus-visible:text-red-600 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                  >
                    {deletingId === task.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="mt-12 border-t border-slate-200/70 pt-6 text-center text-xs text-slate-400">
          Task Management Service · Next.js + FastAPI
        </footer>
      </main>
    </div>
  );
}
