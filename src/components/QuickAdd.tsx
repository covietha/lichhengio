import { useRef, useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { taskService } from "../services/instance";
import type { TaskPriority } from "../types";
import { todayStr } from "../utils/date";
import { useData } from "../hooks/useData";
import { btnPrimary, errMsg, errText, field, PRIORITY_VI } from "../ui";

interface Props { defaultDate?: string; defaultTime?: string; projectId?: string; goalId?: string }

/** Muốn đặt lại giá trị mặc định thì đổi `key` của component. */
export function QuickAdd({ defaultDate, defaultTime, projectId, goalId }: Props) {
  const { projects, goals } = useData();
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(defaultDate ?? todayStr());
  const [dueTime, setDueTime] = useState(defaultTime ?? "");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [pid, setPid] = useState(projectId ?? "");
  const [gid, setGid] = useState(goalId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const lock = useRef(false); // chặn gửi hai lần liên tiếp

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (lock.current) return;
    lock.current = true;
    setError(null); setSaving(true);
    try {
      await taskService.create({
        title, priority,
        dueDate: dueDate || undefined, dueTime: dueTime || undefined,
        projectId: pid || undefined, goalId: gid || undefined,
      });
      setTitle("");
    } catch (err) {
      setError(errMsg(err));
    } finally {
      lock.current = false; setSaving(false);
    }
  }

  const openProjects = projects.filter((p) => p.status !== "ARCHIVED" || p.id === projectId);
  const openGoals = goals.filter((g) => g.status !== "ARCHIVED" || g.id === goalId);

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-2" aria-label="Thêm việc">
      <label className="flex min-w-[14rem] flex-1 flex-col text-sm">Việc cần làm
        <input className={field + " mt-1"} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ví dụ: Chấm bài kiểm tra 12A3" />
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
      {!projectId && openProjects.length > 0 && (
        <label className="flex flex-col text-sm">Dự án
          <select className={field + " mt-1"} value={pid} onChange={(e) => setPid(e.target.value)}>
            <option value="">Không có</option>
            {openProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
      )}
      {!goalId && openGoals.length > 0 && (
        <label className="flex flex-col text-sm">Mục tiêu
          <select className={field + " mt-1"} value={gid} onChange={(e) => setGid(e.target.value)}>
            <option value="">Không có</option>
            {openGoals.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
          </select>
        </label>
      )}
      <button disabled={saving} className={btnPrimary}><Plus size={16} aria-hidden /> {saving ? "Đang lưu..." : "Thêm việc"}</button>
      {error && <p role="alert" className={`w-full ${errText}`}>{error}</p>}
    </form>
  );
}
