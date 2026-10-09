import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { useData } from "../hooks/useData";
import { goalService } from "../services/instance";
import { progressOf, tasksOfGoal } from "../services/progress";
import type { Goal, GoalPeriod, GoalStatus } from "../types";
import { ProgressBar } from "../components/ProgressBar";
import { QuickAdd } from "../components/QuickAdd";
import { TaskRow } from "../components/TaskRow";
import { btnGhost, btnPrimary, errMsg, errText, field, fmtDate, GOAL_PERIOD_VI, GOAL_STATUS_VI, muted } from "../ui";

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
    <form onSubmit={submit} className="grid gap-2 sm:grid-cols-2" aria-label={goal ? "Sửa mục tiêu" : "Thêm mục tiêu"}>
      <label className="flex flex-col text-sm sm:col-span-2">Tên mục tiêu
        <input className={field + " mt-1"} value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label className="flex flex-col text-sm sm:col-span-2">Mô tả
        <textarea className={field + " mt-1"} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      <label className="flex flex-col text-sm">Khung thời gian
        <select className={field + " mt-1"} value={period} onChange={(e) => setPeriod(e.target.value as GoalPeriod)}>
          {(Object.keys(GOAL_PERIOD_VI) as GoalPeriod[]).map((k) => <option key={k} value={k}>{GOAL_PERIOD_VI[k]}</option>)}
        </select>
      </label>
      <label className="flex flex-col text-sm">Trạng thái
        <select className={field + " mt-1"} value={status} onChange={(e) => setStatus(e.target.value as GoalStatus)}>
          {(Object.keys(GOAL_STATUS_VI) as GoalStatus[]).map((k) => <option key={k} value={k}>{GOAL_STATUS_VI[k]}</option>)}
        </select>
      </label>
      <label className="flex flex-col text-sm">Hạn đạt mục tiêu
        <input type="date" className={field + " mt-1"} value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
      </label>
      <fieldset className="text-sm sm:col-span-2">
        <legend>Dự án liên quan</legend>
        {projects.length === 0 ? <p className={muted}>Chưa có dự án nào để liên kết.</p>
          : projects.map((p) => (
              <label key={p.id} className="mr-4 inline-flex items-center gap-2">
                <input type="checkbox" checked={projectIds.includes(p.id)} onChange={() => toggle(p.id)} /> {p.name}
              </label>
            ))}
      </fieldset>
      <div className="flex gap-2 sm:col-span-2">
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
        <button className={btnGhost} onClick={() => { setSel(null); setMode("view"); }}>← Tất cả mục tiêu</button>
        {mode === "edit" ? (
          <div className="mt-3"><GoalForm goal={selected} onDone={() => setMode("view")} /></div>
        ) : (
          <>
            <h1 className="mt-3 text-2xl font-semibold">{selected.title}</h1>
            <p className={`mt-1 text-sm ${muted}`}>
              {GOAL_PERIOD_VI[selected.period]} · {GOAL_STATUS_VI[selected.status]}{selected.targetDate ? ` · hạn ${fmtDate(selected.targetDate)}` : ""}
            </p>
            {selected.description && <p className="mt-2 whitespace-pre-line">{selected.description}</p>}
            <p className="mt-2 text-sm">Dự án liên quan: {linked.length ? linked.map((p) => p.name).join(", ") : "chưa có"}</p>
            <div className="mt-3 max-w-md"><ProgressBar progress={progressOf(gt)} label={`Tiến độ mục tiêu ${selected.title}`} /></div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className={btnGhost} onClick={() => setMode("edit")}>Sửa mục tiêu</button>
              <button className={btnGhost} onClick={() => goalService.update(selected.id, { status: selected.status === "COMPLETED" ? "ACTIVE" : "COMPLETED" }).catch(() => setError("Không đổi được trạng thái."))}>
                {selected.status === "COMPLETED" ? "Mở lại mục tiêu" : "Đánh dấu hoàn thành"}
              </button>
              <button
                className={btnGhost}
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
        <h2 className="mt-8 text-lg font-semibold">Việc liên quan ({gt.length})</h2>
        <div className="mt-3"><QuickAdd goalId={selected.id} /></div>
        {gt.length === 0 ? <p className={`mt-3 ${muted}`}>Chưa có việc nào gắn với mục tiêu này.</p>
          : <ul className="mt-2">{gt.map((t) => <TaskRow key={t.id} task={t} showDate onError={setError} />)}</ul>}
      </div>
    );
  }

  const list = goals.filter((g) => period === "ALL" || g.period === period);
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Mục tiêu</h1>
        <button className={btnPrimary} onClick={() => setMode("create")}><Plus size={16} aria-hidden /> Thêm mục tiêu</button>
      </div>
      {mode === "create" && <div className="mt-4"><GoalForm onDone={(g) => { setMode("view"); if (g) setSel(g.id); }} /></div>}
      <div className="mt-4 flex flex-wrap gap-1" role="group" aria-label="Lọc theo khung thời gian">
        {(["ALL", "TODAY", "WEEK", "MONTH", "LONG_TERM"] as const).map((k) => (
          <button key={k} aria-pressed={period === k} onClick={() => setPeriod(k)}
            className={`rounded-full px-3 py-1 text-sm ${period === k ? "bg-brand text-white dark:bg-brand-dark dark:text-black" : btnGhost}`}>
            {k === "ALL" ? "Tất cả" : GOAL_PERIOD_VI[k]}
          </button>
        ))}
      </div>
      {!ready ? <p className="mt-6">Đang tải dữ liệu từ máy...</p>
        : list.length === 0 ? <p className={`mt-6 ${muted}`}>Chưa có mục tiêu nào trong nhóm này. Bấm "Thêm mục tiêu" để bắt đầu.</p>
        : <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {list.map((g) => (
              <li key={g.id} className="rounded-lg border border-ink/15 p-3 dark:border-ink-dark/20">
                <button className="w-full text-left" onClick={() => setSel(g.id)}>
                  <span className="font-medium">{g.title}</span>
                  <span className={`block text-xs ${muted}`}>{GOAL_PERIOD_VI[g.period]} · {GOAL_STATUS_VI[g.status]}{g.targetDate ? ` · hạn ${fmtDate(g.targetDate)}` : ""}</span>
                </button>
                <div className="mt-2"><ProgressBar progress={progressOf(tasksOfGoal(tasks, g))} label={`Tiến độ mục tiêu ${g.title}`} /></div>
              </li>
            ))}
          </ul>}
    </div>
  );
}
