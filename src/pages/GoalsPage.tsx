import { useState, type FormEvent } from "react";
import { ArrowLeft, CalendarDays, Plus } from "lucide-react";
import { useData } from "../hooks/useData";
import { goalService } from "../services/instance";
import { progressOf, tasksOfGoal } from "../services/progress";
import type { Goal, GoalPeriod, GoalStatus } from "../types";
import { ProgressBar } from "../components/ProgressBar";
import { QuickAdd } from "../components/QuickAdd";
import { TaskRow } from "../components/TaskRow";
import { btnDanger, btnGhost, btnOutline, btnPrimary, errMsg, errText, field, fmtDate, GOAL_BAND, GOAL_PERIOD_VI, GOAL_STATUS_VI, lbl, muted, pageTitle, segActive } from "../ui";

function GoalForm({ goal, onDone }: { goal?: Goal; onDone: (g?: Goal) => void }) {
  const { projects } = useData();
  const [title, setTitle] = useState(goal?.title ?? "");
  const [description, setDescription] = useState(goal?.description ?? "");
  const [period, setPeriod] = useState<GoalPeriod>(goal?.period ?? "WEEK");
  const [status, setStatus] = useState<GoalStatus>(goal?.status ?? "ACTIVE");
  const [targetDate, setTargetDate] = useState(goal?.targetDate ?? "");
  const [projectIds, setProjectIds] = useState<string[]>(goal?.projectIds ?? []);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null); setSaving(true);
    try {
      const saved = goal
        ? await goalService.update(goal.id, { title, description, period, status, targetDate, projectIds })
        : await goalService.create({ title, description: description || undefined, period, status, targetDate: targetDate || undefined, projectIds });
      onDone(saved);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setSaving(false);
    }
  }
  const toggle = (id: string) => setProjectIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  return (
    <form onSubmit={submit} className="panel grid gap-3 sm:grid-cols-2" aria-label={goal ? "Sửa mục tiêu" : "Thêm mục tiêu"}>
      <label className={`${lbl} sm:col-span-2`}>Tên mục tiêu
        <input className={field} value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label className={`${lbl} sm:col-span-2`}>Mô tả
        <textarea className={field} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      <label className={lbl}>Khung thời gian
        <select className={field} value={period} onChange={(e) => setPeriod(e.target.value as GoalPeriod)}>
          {(Object.keys(GOAL_PERIOD_VI) as GoalPeriod[]).map((k) => <option key={k} value={k}>{GOAL_PERIOD_VI[k]}</option>)}
        </select>
      </label>
      <label className={lbl}>Trạng thái
        <select className={field} value={status} onChange={(e) => setStatus(e.target.value as GoalStatus)}>
          {(Object.keys(GOAL_STATUS_VI) as GoalStatus[]).map((k) => <option key={k} value={k}>{GOAL_STATUS_VI[k]}</option>)}
        </select>
      </label>
      <label className={lbl}>Hạn đạt mục tiêu
        <input type="date" className={field} value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
      </label>
      <fieldset className="text-sm sm:col-span-2">
        <legend className="mb-1 font-medium">Dự án liên quan</legend>
        {projects.length === 0 ? <p className={muted}>Chưa có dự án nào để liên kết.</p>
          : projects.map((p) => (
              <label key={p.id} className="mr-4 inline-flex min-h-11 items-center gap-2">
                <input type="checkbox" className="h-4 w-4 accent-pen" checked={projectIds.includes(p.id)} onChange={() => toggle(p.id)} /> {p.name}
              </label>
            ))}
      </fieldset>
      <div className="flex flex-wrap gap-2 sm:col-span-2">
        <button disabled={saving} className={btnPrimary}>{saving ? "Đang lưu..." : goal ? "Lưu thay đổi" : "Tạo mục tiêu"}</button>
        <button type="button" className={btnGhost} onClick={() => onDone()}>Hủy</button>
      </div>
      {error && <p role="alert" className={`sm:col-span-2 ${errText}`}>{error}</p>}
    </form>
  );
}

export function GoalsPage() {
  const { goals, projects, tasks, ready } = useData();
  const [sel, setSel] = useState<string | null>(null);
  const [mode, setMode] = useState<"view" | "create" | "edit">("view");
  const [period, setPeriod] = useState<GoalPeriod | "ALL">("ALL");
  const [error, setError] = useState<string | null>(null);
  const selected = goals.find((g) => g.id === sel);

  if (selected) {
    const gt = tasksOfGoal(tasks, selected);
    const linked = projects.filter((p) => selected.projectIds.includes(p.id));
    return (
      <div>
        <button className={`${btnGhost} -ml-3`} onClick={() => { setSel(null); setMode("view"); }}><ArrowLeft size={18} aria-hidden /> Tất cả mục tiêu</button>
        {mode === "edit" ? (
          <div className="mt-3"><GoalForm goal={selected} onDone={() => setMode("view")} /></div>
        ) : (
          <>
            <h1 className={`mt-4 ${pageTitle}`}>{selected.title}</h1>
            <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
              <span className="rounded-md bg-pen-soft px-2 py-0.5 font-medium text-pen">{GOAL_PERIOD_VI[selected.period]}</span>
              <span>{GOAL_STATUS_VI[selected.status]}</span>
              {selected.targetDate && <span className="inline-flex items-center gap-1"><CalendarDays size={14} aria-hidden /> Hạn {fmtDate(selected.targetDate)}</span>}
            </p>
            {selected.description && <p className="mt-2 whitespace-pre-line">{selected.description}</p>}
            <p className="mt-3 text-sm">Dự án liên quan: {linked.length ? linked.map((p) => p.name).join(", ") : "chưa có"}</p>
            <div className="panel mt-4 max-w-md"><ProgressBar progress={progressOf(gt)} label={`Tiến độ mục tiêu ${selected.title}`} /></div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className={btnOutline} onClick={() => setMode("edit")}>Sửa mục tiêu</button>
              <button className={btnOutline} onClick={() => goalService.update(selected.id, { status: selected.status === "COMPLETED" ? "ACTIVE" : "COMPLETED" }).catch(() => setError("Không đổi được trạng thái."))}>
                {selected.status === "COMPLETED" ? "Mở lại mục tiêu" : "Đánh dấu hoàn thành"}
              </button>
              <button
                className={btnDanger}
                onClick={() => {
                  if (confirm(`Xóa mục tiêu "${selected.title}"? Các việc và dự án liên quan vẫn được giữ lại.`)) {
                    goalService.remove(selected.id).then(() => setSel(null)).catch(() => setError("Không xóa được mục tiêu."));
                  }
                }}
              >Xóa mục tiêu</button>
            </div>
          </>
        )}
        {error && <p role="alert" className={`mt-3 ${errText}`}>{error}</p>}
        <h2 className="mt-10 text-xl font-bold tracking-tight">Việc liên quan ({gt.length})</h2>
        <div className="mt-3"><QuickAdd goalId={selected.id} /></div>
        {gt.length === 0 ? <p className={`mt-3 ${muted}`}>Chưa có việc nào gắn với mục tiêu này.</p>
          : <ul className="mt-3 rounded-xl border border-line bg-surface">{gt.map((t) => <TaskRow key={t.id} task={t} showDate onError={setError} />)}</ul>}
      </div>
    );
  }

  const list = goals.filter((g) => period === "ALL" || g.period === period);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className={pageTitle}>Mục tiêu</h1>
        <button className={btnPrimary} onClick={() => setMode("create")}><Plus size={16} aria-hidden /> Thêm mục tiêu</button>
      </div>
      {mode === "create" && <div className="mt-4"><GoalForm onDone={(g) => { setMode("view"); if (g) setSel(g.id); }} /></div>}
      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Lọc theo khung thời gian">
        {(["ALL", "TODAY", "WEEK", "MONTH", "LONG_TERM"] as const).map((k) => (
          <button key={k} aria-pressed={period === k} onClick={() => setPeriod(k)}
            className={`inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-medium transition-colors ${period === k ? "border-pen " + segActive : "border-line bg-surface hover:border-pen"}`}>
            {k === "ALL" ? "Tất cả" : GOAL_PERIOD_VI[k]}
          </button>
        ))}
      </div>
      {!ready ? <p className="mt-6">Đang tải dữ liệu từ máy...</p>
        : list.length === 0 ? <p className={`mt-6 ${muted}`}>Chưa có mục tiêu nào trong nhóm này. Bấm "Thêm mục tiêu" để bắt đầu.</p>
        : <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {list.map((g) => (
              <li key={g.id} className="relative flex flex-col overflow-hidden rounded-xl border border-line bg-surface">
                <span aria-hidden className={`h-1.5 ${GOAL_BAND[g.status]}`} />
                <button className="w-full px-4 pb-1 pt-3 text-left" onClick={() => setSel(g.id)}>
                  <span className="block font-display text-lg font-bold leading-snug tracking-tight">{g.title}</span>
                  <span className={`mt-1 flex flex-wrap items-center gap-x-3 text-xs ${muted}`}>
                    <span>{GOAL_PERIOD_VI[g.period]}</span>
                    <span>{GOAL_STATUS_VI[g.status]}</span>
                    {g.targetDate && <span className="inline-flex items-center gap-1"><CalendarDays size={12} aria-hidden /> Hạn {fmtDate(g.targetDate)}</span>}
                  </span>
                </button>
                <div className="mt-auto px-4 pb-4 pt-3"><ProgressBar progress={progressOf(tasksOfGoal(tasks, g))} label={`Tiến độ mục tiêu ${g.title}`} /></div>
              </li>
            ))}
          </ul>}
    </div>
  );
}
