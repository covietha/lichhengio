import { useMemo, useState } from "react";
import { useData } from "../hooks/useData";
import { TaskRow } from "../components/TaskRow";
import { QuickAdd } from "../components/QuickAdd";
import { errText, field, muted } from "../ui";

const LIMIT = 200;

export function TasksPage() {
  const { tasks, projects, ready } = useData();
  const [status, setStatus] = useState<"open" | "done" | "all">("open");
  const [projectFilter, setProjectFilter] = useState<string>("all"); // all | none | <id>
  const [error, setError] = useState<string | null>(null);

  const shown = useMemo(() => {
    return tasks
      .filter((t) => (status === "open" ? t.status === "TODO" || t.status === "IN_PROGRESS" : status === "done" ? t.status === "COMPLETED" : true))
      .filter((t) => projectFilter === "all" ? true : projectFilter === "none" ? !t.projectId || !projects.some((p) => p.id === t.projectId) : t.projectId === projectFilter)
      .sort((a, b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999") || (a.dueTime ?? "99").localeCompare(b.dueTime ?? "99"));
  }, [tasks, projects, status, projectFilter]);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Công việc</h1>
      <div className="mt-4"><QuickAdd /></div>
      <div className="mt-6 flex flex-wrap gap-3">
        <label className="flex flex-col text-sm">Trạng thái
          <select className={field + " mt-1"} value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
            <option value="open">Đang mở</option><option value="done">Đã xong</option><option value="all">Tất cả</option>
          </select>
        </label>
        <label className="flex flex-col text-sm">Dự án
          <select className={field + " mt-1"} value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
            <option value="all">Tất cả</option><option value="none">Không thuộc dự án</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
      </div>
      {error && <p role="alert" className={`mt-3 ${errText}`}>{error}</p>}
      {!ready ? <p className="mt-6">Đang tải dữ liệu từ máy...</p>
        : shown.length === 0 ? <p className={`mt-6 ${muted}`}>Không có việc nào khớp bộ lọc.</p>
        : <>
            <ul className="mt-4">{shown.slice(0, LIMIT).map((t) => <TaskRow key={t.id} task={t} showDate onError={setError} />)}</ul>
            {shown.length > LIMIT && <p className={`mt-2 text-sm ${muted}`}>Đang hiện {LIMIT}/{shown.length} việc đầu tiên. Dùng bộ lọc để thu hẹp.</p>}
          </>}
    </div>
  );
}
