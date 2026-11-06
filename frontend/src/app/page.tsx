"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ListTodo, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useTaskStore } from "@/store/task-store";

export default function Home() {
  const { tasks, loading, error, fetchTasks, addTask, toggleTask, deleteTask } = useTaskStore();
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks]);

  const completedCount = tasks.filter((t) => t.completed).length;

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

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-12">
      <div className="mx-auto w-full max-w-2xl">
        <Card className="border-slate-200/80">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <ListTodo className="h-5 w-5" />
              <span className="text-sm font-medium">Task Management</span>
            </div>
            <CardTitle className="text-3xl tracking-tight text-slate-900">Управление задачами</CardTitle>
            <p className="text-sm text-muted-foreground">
              Добавляйте задачи, отмечайте выполнение и удаляйте лишнее. Данные сохраняются на сервере.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={onSubmit} className="flex gap-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Новая задача..."
                aria-label="Название задачи"
                maxLength={500}
              />
              <Button type="submit" disabled={submitting || !title.trim()}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                <span className="ml-2 hidden sm:inline">Добавить</span>
              </Button>
            </form>

            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                Не удалось выполнить запрос: {error}
              </div>
            ) : null}

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Всего: {tasks.length}</span>
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Выполнено: {completedCount}
              </span>
            </div>

            <div className="space-y-2">
              {loading ? (
                <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Загрузка...
                </div>
              ) : tasks.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 py-10 text-center text-sm text-muted-foreground">
                  Пока нет задач. Добавьте первую.
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 transition-colors hover:border-slate-300"
                  >
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => void toggleTask(task)}
                      aria-label={task.completed ? "Снять отметку выполнения" : "Отметить выполненной"}
                    />
                    <span className={`flex-1 text-sm ${task.completed ? "text-muted-foreground line-through" : "text-slate-800"}`}>
                      {task.title}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => void deleteTask(task.id)}
                      aria-label="Удалить задачу"
                      className="text-slate-500 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
