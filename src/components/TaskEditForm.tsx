import { useState, type FormEvent } from "react";
import { taskService } from "../services/instance";
import type { Task, TaskPriority } from "../types";
import { useData } from "../hooks/useData";
import { btnGhost, btnPrimary, errMsg, errText, field, PRIORITY_VI } from "../ui";

export function TaskEditForm({ task, onDone }: { task: Task; onDone: () => void }) {
  const { projects, goals } = useData();
  const [title, setTitle] = useState(task.title);
  const [dueDate, setDueDate] = useState(task.dueDate ?? "");
  const [dueTime, setDueTime] = useState(task.dueTime ?? "");
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [projectId, setProjectId] = useState(task.projectId ?? "");
  const [goalId, setGoalId] = useState(task.goalId ?? "");
  const [est, setEst] = useState(task.estimatedMinutes?.toString() ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null); setSaving(true);
    try {
      // "" = xóa giá trị (bỏ hạn, bỏ liên kết...)
      await taskService.update(task.id, {
        title, priority, dueDate, dueTime, projectId, goalId,
        estimatedMinutes: est === "" ? "" : Number(est),
      });
      onDone();
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid w-full gap-2 sm:grid-cols-2" aria-label={`Sửa việc: ${task.title}`}>
      <label className="flex flex-col text-sm sm:col-span-2">Tên việc
        <input className={field + " mt-1"} value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label className="flex flex-col text-sm">Hạn
        <input type="date" className={field + " mt-1"} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </label>
      <label className="flex flex-col text-sm">Giờ
        <input type="time" className={field + " mt-1"} value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
      </label>
      <label className="flex flex-col text-sm">Ưu tiên
        <select className={field + " mt-1"} value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
          {(Object.keys(PRIORITY_VI) as TaskPriority[]).map((k) => <option key={k} value={k}>{PRIORITY_VI[k]}</option>)}
        </select>
      </label>
      <label className="flex flex-col text-sm">Thời lượng dự kiến (phút)
        <input type="number" min={0} max={1440} className={field + " mt-1"} value={est} onChange={(e) => setEst(e.target.value)} />
      </label>
      <label className="flex flex-col text-sm">Dự án
        <select className={field + " mt-1"} value={projectId} onChange={(e) => setProjectId(e.target.value)}>
          <option value="">Không có</option>
          {projects.filter((p) => p.status !== "ARCHIVED" || p.id === task.projectId).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </label>
      <label className="flex flex-col text-sm">Mục tiêu
        <select className={field + " mt-1"} value={goalId} onChange={(e) => setGoalId(e.target.value)}>
          <option value="">Không có</option>
          {goals.filter((g) => g.status !== "ARCHIVED" || g.id === task.goalId).map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
        </select>
      </label>
      <div className="flex gap-2 sm:col-span-2">
        <button disabled={saving} className={btnPrimary}>{saving ? "Đang lưu..." : "Lưu thay đổi"}</button>
        <button type="button" className={btnGhost} onClick={onDone}>Hủy sửa</button>
      </div>
      {error && <p role="alert" className={`sm:col-span-2 ${errText}`}>{error}</p>}
    </form>
  );
}
