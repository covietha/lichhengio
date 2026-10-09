import { useState } from "react";
import { Check, Circle, Pencil, Trash2 } from "lucide-react";
import type { Task } from "../types";
import { taskService } from "../services/instance";
import { todayStr } from "../utils/date";
import { useData } from "../hooks/useData";
import { btnGhost, fmtDate, muted, PRIORITY_VI } from "../ui";
import { TaskEditForm } from "./TaskEditForm";

export function TaskRow({ task, overdue = false, showDate = false, onError }: {
  task: Task; overdue?: boolean; showDate?: boolean; onError: (m: string) => void;
}) {
  const { projects, goals } = useData();
  const [editing, setEditing] = useState(false);
  const done = task.status === "COMPLETED";
  const cancelled = task.status === "CANCELLED";
  const project = projects.find((p) => p.id === task.projectId);
  const goal = goals.find((g) => g.id === task.goalId);
  const run = (p: Promise<unknown>) => p.catch(() => onError("Thao tác không thành công. Thử lại."));

  if (editing) {
    return <li className="border-b border-ink/10 py-3 dark:border-ink-dark/15"><TaskEditForm task={task} onDone={() => setEditing(false)} /></li>;
  }

  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-ink/10 py-2 dark:border-ink-dark/15">
      <button
        aria-label={done ? `Mở lại việc: ${task.title}` : `Hoàn thành việc: ${task.title}`}
        onClick={() => run(done ? taskService.reopen(task.id) : taskService.complete(task.id))}
        className="text-brand dark:text-brand-dark" disabled={cancelled}
      >
        {done ? <Check size={20} aria-hidden /> : <Circle size={20} aria-hidden />}
      </button>
      <div className="min-w-0 flex-1 basis-48">
        <p className={done || cancelled ? "line-through opacity-60" : ""}>{task.title}</p>
        <p className={`text-xs ${muted}`}>
          {cancelled ? "Đã hủy · " : ""}{PRIORITY_VI[task.priority]}
          {showDate && task.dueDate ? ` · hạn ${fmtDate(task.dueDate)}` : ""}
          {task.dueTime ? ` · ${task.dueTime}` : ""}
          {project ? ` · Dự án: ${project.name}` : ""}
          {goal ? ` · Mục tiêu: ${goal.title}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-1">
        {overdue && (
          <>
            <button className={btnGhost} onClick={() => run(taskService.update(task.id, { dueDate: todayStr() }))}>Chuyển hôm nay</button>
            <button className={btnGhost} onClick={() => run(taskService.cancel(task.id))}>Hủy việc</button>
          </>
        )}
        <button aria-label={`Sửa việc: ${task.title}`} className={btnGhost} onClick={() => setEditing(true)}><Pencil size={18} aria-hidden /></button>
        <button
          aria-label={`Xóa việc: ${task.title}`} className={btnGhost}
          onClick={() => { if (confirm(`Xóa việc "${task.title}"?`)) run(taskService.remove(task.id)); }}
        ><Trash2 size={18} aria-hidden /></button>
      </div>
    </li>
  );
}
