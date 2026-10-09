import { useState } from "react";
import { CalendarDays, Check, Circle, Clock, FolderKanban, Pencil, Target, Trash2 } from "lucide-react";
import type { Task } from "../types";
import { taskService } from "../services/instance";
import { todayStr } from "../utils/date";
import { useData } from "../hooks/useData";
import { btnOutline, fmtDate, iconBtn, PRIORITY_RING, PRIORITY_TAG, PRIORITY_VI } from "../ui";
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
    return <li className="border-b border-line py-3"><div className="panel"><TaskEditForm task={task} onDone={() => setEditing(false)} /></div></li>;
  }

  const metaItem = "inline-flex items-center gap-1";

  return (
    <li className="ruled-row flex flex-wrap items-center gap-y-1">
      <button
        aria-label={done ? `Mở lại việc: ${task.title}` : `Hoàn thành việc: ${task.title}`}
        onClick={() => run(done ? taskService.reopen(task.id) : taskService.complete(task.id))}
        className={`flex h-14 w-[3.25rem] shrink-0 items-center justify-center ${done ? "text-ok" : PRIORITY_RING[task.priority]} disabled:opacity-40`}
        disabled={cancelled}
      >
        {done
          ? <Check key="done" size={24} strokeWidth={2.5} aria-hidden className="check-pop rounded-full bg-ok/15 p-0.5" />
          : <Circle size={24} strokeWidth={2} aria-hidden />}
      </button>
      <div className="min-w-0 flex-1 basis-48 py-2 pl-3">
        <p className={`text-[15px] font-medium leading-snug ${done || cancelled ? "text-muted line-through" : ""}`}>{task.title}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          {cancelled && <span className="rounded-md bg-line/60 px-1.5 py-0.5 font-medium">Đã hủy</span>}
          {task.priority !== "MEDIUM" && !done && (
            <span className={`rounded-md px-1.5 py-0.5 font-medium ${PRIORITY_TAG[task.priority]}`}>{PRIORITY_VI[task.priority]}</span>
          )}
          {showDate && task.dueDate && (
            <span className={`${metaItem} ${overdue ? "font-medium text-margin" : ""}`}>
              <CalendarDays size={13} aria-hidden /> Hạn {fmtDate(task.dueDate)}
            </span>
          )}
          {task.dueTime && <span className={`${metaItem} tabular-nums`}><Clock size={13} aria-hidden /> {task.dueTime}</span>}
          {project && <span className={metaItem}><FolderKanban size={13} aria-hidden /> {project.name}</span>}
          {goal && <span className={metaItem}><Target size={13} aria-hidden /> {goal.title}</span>}
        </p>
      </div>
      {overdue && (
        <div className="order-last flex basis-full gap-2 pb-2 pl-[3.25rem] pr-3 sm:order-none sm:basis-auto sm:pb-0 sm:pl-0 sm:pr-0">
          <button className={`${btnOutline} !min-h-9 !px-2.5 !py-1 text-xs`} onClick={() => run(taskService.update(task.id, { dueDate: todayStr() }))}>Chuyển hôm nay</button>
          <button className={`${btnOutline} !min-h-9 !px-2.5 !py-1 text-xs`} onClick={() => run(taskService.cancel(task.id))}>Hủy việc</button>
        </div>
      )}
      <div className="flex items-center gap-0.5 pr-1">
        <button aria-label={`Sửa việc: ${task.title}`} className={iconBtn} onClick={() => setEditing(true)}><Pencil size={18} aria-hidden /></button>
        <button
          aria-label={`Xóa việc: ${task.title}`} className={`${iconBtn} hover:!bg-margin-soft hover:!text-margin`}
          onClick={() => { if (confirm(`Xóa việc "${task.title}"?`)) run(taskService.remove(task.id)); }}
        ><Trash2 size={18} aria-hidden /></button>
      </div>
    </li>
  );
}
