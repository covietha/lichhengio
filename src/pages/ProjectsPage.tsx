import { useState, type FormEvent } from "react";
import { ArrowLeft, CalendarDays, Plus } from "lucide-react";
import { useData } from "../hooks/useData";
import { projectService } from "../services/instance";
import { progressOf, tasksOfProject } from "../services/progress";
import type { Project, ProjectStatus, TaskPriority } from "../types";
import { ProgressBar } from "../components/ProgressBar";
import { QuickAdd } from "../components/QuickAdd";
import { TaskRow } from "../components/TaskRow";
import { btnDanger, btnGhost, btnOutline, btnPrimary, errMsg, errText, field, fmtDate, lbl, muted, pageTitle, PRIORITY_VI, PROJECT_BAND, PROJECT_STATUS_VI } from "../ui";

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
    <form onSubmit={submit} className="panel grid gap-3 sm:grid-cols-2" aria-label={project ? "Sửa dự án" : "Thêm dự án"}>
      <label className={`${lbl} sm:col-span-2`}>Tên dự án
        <input className={field} value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className={`${lbl} sm:col-span-2`}>Mô tả
        <textarea className={field} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      <label className={lbl}>Trạng thái
        <select className={field} value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)}>
          {(Object.keys(PROJECT_STATUS_VI) as ProjectStatus[]).map((k) => <option key={k} value={k}>{PROJECT_STATUS_VI[k]}</option>)}
        </select>
      </label>
      <label className={lbl}>Ưu tiên
        <select className={field} value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
          {(Object.keys(PRIORITY_VI) as TaskPriority[]).map((k) => <option key={k} value={k}>{PRIORITY_VI[k]}</option>)}
        </select>
      </label>
      <label className={lbl}>Ngày bắt đầu
        <input type="date" className={field} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      </label>
      <label className={lbl}>Hạn hoàn thành
        <input type="date" className={field} value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
      </label>
      <div className="flex flex-wrap gap-2 sm:col-span-2">
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
        <button className={`${btnGhost} -ml-3`} onClick={() => { setSel(null); setMode("view"); }}><ArrowLeft size={18} aria-hidden /> Tất cả dự án</button>
        {mode === "edit" ? (
          <div className="mt-3"><ProjectForm project={selected} onDone={() => setMode("view")} /></div>
        ) : (
          <>
            <h1 className={`mt-4 ${pageTitle}`}>{selected.name}</h1>
            <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
              <span className="rounded-md bg-pen-soft px-2 py-0.5 font-medium text-pen">{PROJECT_STATUS_VI[selected.status]}</span>
              <span>Ưu tiên {PRIORITY_VI[selected.priority].toLowerCase()}</span>
              {selected.startDate && <span className="inline-flex items-center gap-1"><CalendarDays size={14} aria-hidden /> Từ {fmtDate(selected.startDate)}</span>}
              {selected.targetDate && <span className="inline-flex items-center gap-1"><CalendarDays size={14} aria-hidden /> Hạn {fmtDate(selected.targetDate)}</span>}
            </p>
            {selected.description && <p className="mt-2 whitespace-pre-line">{selected.description}</p>}
            <div className="panel mt-4 max-w-md"><ProgressBar progress={progressOf(pt)} label={`Tiến độ dự án ${selected.name}`} /></div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className={btnOutline} onClick={() => setMode("edit")}>Sửa dự án</button>
              <button className={btnOutline} onClick={() => projectService.update(selected.id, { status: archived ? "ACTIVE" : "ARCHIVED" }).catch(() => setError("Không đổi được trạng thái."))}>
                {archived ? "Bỏ lưu trữ" : "Lưu trữ"}
              </button>
              <button
                className={btnDanger}
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
        <h2 className="mt-10 text-xl font-bold tracking-tight">Việc trong dự án ({pt.length})</h2>
        <div className="mt-3"><QuickAdd projectId={selected.id} /></div>
        {pt.length === 0 ? <p className={`mt-3 ${muted}`}>Dự án chưa có việc nào. Thêm việc ở phía trên.</p>
          : <ul className="mt-3 rounded-xl border border-line bg-surface">{pt.map((t) => <TaskRow key={t.id} task={t} showDate onError={setError} />)}</ul>}
      </div>
    );
  }

  const list = projects.filter((p) => showArchived || p.status !== "ARCHIVED");
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className={pageTitle}>Dự án</h1>
        <button className={btnPrimary} onClick={() => setMode("create")}><Plus size={16} aria-hidden /> Thêm dự án</button>
      </div>
      {mode === "create" && <div className="mt-4"><ProjectForm onDone={(p) => { setMode("view"); if (p) setSel(p.id); }} /></div>}
      <label className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm">
        <input type="checkbox" className="h-4 w-4 accent-pen" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} /> Hiện dự án đã lưu trữ
      </label>
      {!ready ? <p className="mt-6">Đang tải dữ liệu từ máy...</p>
        : list.length === 0 ? <p className={`mt-8 ${muted}`}>Chưa có dự án nào. Bấm "Thêm dự án" để bắt đầu.</p>
        : <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {list.map((p) => (
              <li key={p.id} className="relative flex flex-col overflow-hidden rounded-xl border border-line bg-surface">
                <span aria-hidden className={`h-1.5 ${PROJECT_BAND[p.status]}`} />
                <button className="w-full px-4 pb-1 pt-3 text-left" onClick={() => setSel(p.id)}>
                  <span className="block font-display text-lg font-bold leading-snug tracking-tight">{p.name}</span>
                  <span className={`mt-1 flex flex-wrap items-center gap-x-3 text-xs ${muted}`}>
                    <span>{PROJECT_STATUS_VI[p.status]}</span>
                    {p.targetDate && <span className="inline-flex items-center gap-1"><CalendarDays size={12} aria-hidden /> Hạn {fmtDate(p.targetDate)}</span>}
                  </span>
                </button>
                <div className="mt-auto px-4 pb-4 pt-3"><ProgressBar progress={progressOf(tasksOfProject(tasks, p.id))} label={`Tiến độ dự án ${p.name}`} /></div>
              </li>
            ))}
          </ul>}
    </div>
  );
}
