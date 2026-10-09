import { useRef, useState, type FormEvent } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { taskService } from "../services/instance";
import type { TaskPriority } from "../types";
import { todayStr } from "../utils/date";
import { useData } from "../hooks/useData";
import { btnPrimary, errMsg, errText, field, fmtDate, lbl, PRIORITY_VI } from "../ui";

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
  const [more, setMore] = useState(Boolean(defaultTime));
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
    <form onSubmit={submit} className="panel" aria-label="Thêm việc">
      <div className="flex flex-wrap gap-2">
        <label className="min-w-[14rem] flex-1">
          <span className="sr-only">Việc cần làm</span>
          <input className={field} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Việc cần làm, ví dụ: Chấm bài kiểm tra 12A3" />
        </label>
        <button disabled={saving} className={`${btnPrimary} w-full sm:w-auto`}><Plus size={18} aria-hidden /> {saving ? "Đang lưu..." : "Thêm việc"}</button>
      </div>
      <button
        type="button" aria-expanded={more} onClick={() => setMore((v) => !v)}
        className="mt-3 inline-flex min-h-9 items-center gap-1 text-sm font-medium text-pen hover:underline"
      >
        <ChevronDown size={16} aria-hidden className={`transition-transform ${more ? "rotate-180" : ""}`} />
        Hạn {dueDate ? fmtDate(dueDate) : "chưa đặt"}{dueTime ? ` lúc ${dueTime}` : ""}, ưu tiên, dự án
      </button>
      {more && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className={lbl}>Hạn
            <input type="date" className={field} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </label>
          <label className={lbl}>Giờ
            <input type="time" className={field} value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
          </label>
          <label className={lbl}>Ưu tiên
            <select className={field} value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
              {(Object.keys(PRIORITY_VI) as TaskPriority[]).map((k) => <option key={k} value={k}>{PRIORITY_VI[k]}</option>)}
            </select>
          </label>
          {!projectId && openProjects.length > 0 && (
            <label className={lbl}>Dự án
              <select className={field} value={pid} onChange={(e) => setPid(e.target.value)}>
                <option value="">Không có</option>
                {openProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
          )}
          {!goalId && openGoals.length > 0 && (
            <label className={lbl}>Mục tiêu
              <select className={field} value={gid} onChange={(e) => setGid(e.target.value)}>
                <option value="">Không có</option>
                {openGoals.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
              </select>
            </label>
          )}
        </div>
      )}
      {error && <p role="alert" className={`mt-3 ${errText}`}>{error}</p>}
    </form>
  );
}
