import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { useData } from "../hooks/useData";
import { projectService } from "../services/instance";
import { progressOf, tasksOfProject } from "../services/progress";
import type { Project, ProjectStatus, TaskPriority } from "../types";
import { ProgressBar } from "../components/ProgressBar";
import { QuickAdd } from "../components/QuickAdd";
import { TaskRow } from "../components/TaskRow";
import { btnGhost, btnPrimary, errMsg, errText, field, fmtDate, muted, PRIORITY_VI, PROJECT_STATUS_VI } from "../ui";

function ProjectForm({ project, onDone }: { project?: Project; onDone: (p?: Project) => void }) {
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? "ACTIVE");
  const [priority, setPriority] = useState<TaskPriority>(project?.priority ?? "MEDIUM");
  const [startDate, setStartDate] = useState(project?.startDate ?? "");
  const [targetDate, setTargetDate] = useState(project?.targetDate ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null); setSaving(true);
    try {
      const saved = project
        ? await projectService.update(project.id, { name, description, status, priority, startDate, targetDate })
        : await projectService.create({
            name, status, priority,
            description: description || undefined, startDate: startDate || undefined, targetDate: targetDate || undefined,
          });
      onDone(saved);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-2 sm:grid-cols-2" aria-label={project ? "Sửa dự án" : "Thêm dự án"}>
      <label className="flex flex-col text-sm sm:col-span-2">Tên dự án
        <input className={field + " mt-1"} value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="flex flex-col text-sm sm:col-span-2">Mô tả
        <textarea className={field + " mt-1"} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      <label className="flex flex-col text-sm">Trạng thái
        <select className={field + " mt-1"} value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)}>
          {(Object.keys(PROJECT_STATUS_VI) as ProjectStatus[]).map((k) => <option key={k} value={k}>{PROJECT_STATUS_VI[k]}</option>)}
        </select>
      </label>
      <label className="flex flex-col text-sm">Ưu tiên
        <select className={field + " mt-1"} value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
          {(Object.keys(PRIORITY_VI) as TaskPriority[]).map((k) => <option key={k} value={k}>{PRIORITY_VI[k]}</option>)}
        </select>
      </label>
      <label className="flex flex-col text-sm">Ngày bắt đầu
        <input type="date" className={field + " mt-1"} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      </label>
      <label className="flex flex-col text-sm">Hạn hoàn thành
        <input type="date" className={field + " mt-1"} value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
      </label>
      <div className="flex gap-2 sm:col-span-2">
        <button disabled={saving} className={btnPrimary}>{saving ? "Đang lưu..." : project ? "Lưu thay đổi" : "Tạo dự án"}</button>
        <button type="button" className={btnGhost} onClick={() => onDone()}>Hủy</button>
      </div>
      {error && <p role="alert" className={`sm:col-span-2 ${errText}`}>{error}</p>}
    </form>
  );
}

export function ProjectsPage() {
  const { projects, tasks, ready } = useData();
  const [sel, setSel] = useState<string | null>(null);
  const [mode, setMode] = useState<"view" | "create" | "edit">("view");
  const [showArchived, setShowArchived] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selected = projects.find((p) => p.id === sel);

  if (selected) {
    const pt = tasksOfProject(tasks, selected.id);
    const archived = selected.status === "ARCHIVED";
    return (
      <div>
        <button className={btnGhost} onClick={() => { setSel(null); setMode("view"); }}>← Tất cả dự án</button>
        {mode === "edit" ? (
          <div className="mt-3"><ProjectForm project={selected} onDone={() => setMode("view")} /></div>
        ) : (
          <>
            <h1 className="mt-3 text-2xl font-semibold">{selected.name}</h1>
            <p className={`mt-1 text-sm ${muted}`}>
              {PROJECT_STATUS_VI[selected.status]} · Ưu tiên {PRIORITY_VI[selected.priority].toLowerCase()}
              {selected.startDate ? ` · từ ${fmtDate(selected.startDate)}` : ""}{selected.targetDate ? ` · hạn ${fmtDate(selected.targetDate)}` : ""}
            </p>
            {selected.description && <p className="mt-2 whitespace-pre-line">{selected.description}</p>}
            <div className="mt-3 max-w-md"><ProgressBar progress={progressOf(pt)} label={`Tiến độ dự án ${selected.name}`} /></div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className={btnGhost} onClick={() => setMode("edit")}>Sửa dự án</button>
              <button className={btnGhost} onClick={() => projectService.update(selected.id, { status: archived ? "ACTIVE" : "ARCHIVED" }).catch(() => setError("Không đổi được trạng thái."))}>
                {archived ? "Bỏ lưu trữ" : "Lưu trữ"}
              </button>
              <button
                className={btnGhost}
                onClick={() => {
                  if (confirm(`Xóa dự án "${selected.name}"? Các việc trong dự án vẫn được giữ lại, chỉ không còn thuộc dự án nào.`)) {
                    projectService.remove(selected.id).then(() => setSel(null)).catch(() => setError("Không xóa được dự án."));
                  }
                }}
              >Xóa dự án</button>
            </div>
          </>
        )}
        {error && <p role="alert" className={`mt-3 ${errText}`}>{error}</p>}
        <h2 className="mt-8 text-lg font-semibold">Việc trong dự án ({pt.length})</h2>
        <div className="mt-3"><QuickAdd projectId={selected.id} /></div>
        {pt.length === 0 ? <p className={`mt-3 ${muted}`}>Dự án chưa có việc nào. Thêm việc ở phía trên.</p>
          : <ul className="mt-2">{pt.map((t) => <TaskRow key={t.id} task={t} showDate onError={setError} />)}</ul>}
      </div>
    );
  }

  const list = projects.filter((p) => showArchived || p.status !== "ARCHIVED");
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Dự án</h1>
        <button className={btnPrimary} onClick={() => setMode("create")}><Plus size={16} aria-hidden /> Thêm dự án</button>
      </div>
      {mode === "create" && <div className="mt-4"><ProjectForm onDone={(p) => { setMode("view"); if (p) setSel(p.id); }} /></div>}
      <label className="mt-4 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} /> Hiện dự án đã lưu trữ
      </label>
      {!ready ? <p className="mt-6">Đang tải dữ liệu từ máy...</p>
        : list.length === 0 ? <p className={`mt-6 ${muted}`}>Chưa có dự án nào. Bấm "Thêm dự án" để bắt đầu.</p>
        : <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {list.map((p) => (
              <li key={p.id} className="rounded-lg border border-ink/15 p-3 dark:border-ink-dark/20">
                <button className="w-full text-left" onClick={() => setSel(p.id)}>
                  <span className="font-medium">{p.name}</span>
                  <span className={`block text-xs ${muted}`}>{PROJECT_STATUS_VI[p.status]}{p.targetDate ? ` · hạn ${fmtDate(p.targetDate)}` : ""}</span>
                </button>
                <div className="mt-2"><ProgressBar progress={progressOf(tasksOfProject(tasks, p.id))} label={`Tiến độ dự án ${p.name}`} /></div>
              </li>
            ))}
          </ul>}
    </div>
  );
}
