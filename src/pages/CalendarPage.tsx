import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useData } from "../hooks/useData";
import { addDays } from "../utils/date";
import { dayOfWeek, groupByDate, monthGrid, shiftMonth, weekDays } from "../utils/calendar";
import { QuickAdd } from "../components/QuickAdd";
import { TaskRow } from "../components/TaskRow";
import type { Task } from "../types";
import { btnGhost, errText, muted } from "../ui";

type View = "day" | "week" | "month";
const DOW = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const VIEW_VI: Record<View, string> = { day: "Ngày", week: "Tuần", month: "Tháng" };
const dayNum = (d: string) => Number(d.slice(8));

function Chip({ t }: { t: Task }) {
  return (
    <span className={`block truncate text-xs ${t.status === "COMPLETED" ? "line-through opacity-60" : ""}`}>
      {t.dueTime ? `${t.dueTime} ` : ""}{t.title}
    </span>
  );
}

export function CalendarPage() {
  const { tasks, today } = useData();
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState(today);
  const [slot, setSlot] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const byDate = useMemo(() => groupByDate(tasks), [tasks]);

  const [y, m] = cursor.split("-").map(Number);
  const step = (dir: -1 | 1) => {
    setSlot(undefined);
    if (view === "day") setCursor(addDays(cursor, dir));
    else if (view === "week") setCursor(addDays(cursor, 7 * dir));
    else { const n = shiftMonth(y, m, dir); setCursor(`${n.year}-${String(n.month).padStart(2, "0")}-01`); }
  };
  const openDay = (d: string) => { setCursor(d); setView("day"); setSlot(undefined); };

  const title = view === "month" ? `Tháng ${m}/${y}`
    : view === "week" ? `Tuần ${weekDays(cursor)[0].split("-").reverse().slice(0, 2).join("/")} – ${weekDays(cursor)[6].split("-").reverse().slice(0, 2).join("/")}`
    : `${DOW[dayOfWeek(cursor)]}, ${cursor.split("-").reverse().join("/")}`;

  const cellCls = (d: string) => `rounded-md border p-1 text-left align-top ${d === today ? "border-brand dark:border-brand-dark" : "border-ink/15 dark:border-ink-dark/20"}`;

  const dayTasks = byDate[cursor] ?? [];
  const untimed = dayTasks.filter((t) => !t.dueTime);
  const hours = useMemo(() => {
    const set = new Set<number>(Array.from({ length: 17 }, (_, i) => i + 6));
    for (const t of dayTasks) if (t.dueTime) set.add(Number(t.dueTime.slice(0, 2)));
    return [...set].sort((a, b) => a - b);
  }, [dayTasks]);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Lịch</h1>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button aria-label="Kỳ trước" className={btnGhost} onClick={() => step(-1)}><ChevronLeft size={18} aria-hidden /></button>
        <button className={btnGhost} onClick={() => { setCursor(today); setSlot(undefined); }}>Hôm nay</button>
        <button aria-label="Kỳ sau" className={btnGhost} onClick={() => step(1)}><ChevronRight size={18} aria-hidden /></button>
        <h2 className="mx-2 text-lg font-medium" aria-live="polite">{title}</h2>
        <div className="ml-auto flex gap-1" role="group" aria-label="Chế độ xem">
          {(Object.keys(VIEW_VI) as View[]).map((v) => (
            <button key={v} aria-pressed={view === v} onClick={() => setView(v)}
              className={`rounded-full px-3 py-1 text-sm ${view === v ? "bg-brand text-white dark:bg-brand-dark dark:text-black" : btnGhost}`}>{VIEW_VI[v]}</button>
          ))}
        </div>
      </div>
      {error && <p role="alert" className={`mt-3 ${errText}`}>{error}</p>}

      {view === "month" && (
        <div className="mt-4 overflow-x-auto">
          <div className="grid min-w-[34rem] grid-cols-7 gap-1" aria-label={title}>
            {DOW.map((d) => <div key={d} className={`px-1 text-xs ${muted}`}>{d}</div>)}
            {monthGrid(y, m).flat().map((d) => {
              const list = byDate[d] ?? [];
              const inMonth = Number(d.slice(5, 7)) === m;
              return (
                <button key={d} onClick={() => openDay(d)} className={`${cellCls(d)} min-h-[4.5rem] ${inMonth ? "" : "opacity-50"}`}
                  aria-label={`Ngày ${d.split("-").reverse().join("/")}, ${list.length} việc`}>
                  <span className="text-sm font-medium">{dayNum(d)}</span>
                  {list.slice(0, 2).map((t) => <Chip key={t.id} t={t} />)}
                  {list.length > 2 && <span className={`block text-xs ${muted}`}>+{list.length - 2} việc</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {view === "week" && (
        <ul className="mt-4 grid gap-2 md:grid-cols-7">
          {weekDays(cursor).map((d) => {
            const list = byDate[d] ?? [];
            return (
              <li key={d} className={`${cellCls(d)} min-h-[5rem]`}>
                <button className="w-full text-left text-sm font-medium" onClick={() => openDay(d)} aria-label={`Mở ngày ${d.split("-").reverse().join("/")}`}>
                  {DOW[dayOfWeek(d)]} {dayNum(d)}
                </button>
                {list.length === 0 ? <span className={`text-xs ${muted}`}>Trống</span> : list.map((t) => <Chip key={t.id} t={t} />)}
              </li>
            );
          })}
        </ul>
      )}

      {view === "day" && (
        <div className="mt-4">
          <QuickAdd key={`${cursor}|${slot ?? ""}`} defaultDate={cursor} defaultTime={slot} />
          <h3 className="mt-6 font-semibold">Chưa xếp giờ ({untimed.length})</h3>
          {untimed.length === 0 ? <p className={`text-sm ${muted}`}>Không có việc nào chưa xếp giờ.</p>
            : <ul>{untimed.map((t) => <TaskRow key={t.id} task={t} onError={setError} />)}</ul>}
          <h3 className="mt-6 font-semibold">Theo giờ</h3>
          <ul>
            {hours.map((h) => {
              const hh = String(h).padStart(2, "0");
              const list = dayTasks.filter((t) => t.dueTime?.startsWith(hh));
              return (
                <li key={h} className="flex gap-3 border-b border-ink/10 py-1 dark:border-ink-dark/15">
                  <span className={`w-12 shrink-0 pt-2 text-sm ${muted}`}>{hh}:00</span>
                  <div className="min-w-0 flex-1">
                    {list.length > 0 && <ul>{list.map((t) => <TaskRow key={t.id} task={t} onError={setError} />)}</ul>}
                    <button className={`${btnGhost} ${muted}`} onClick={() => setSlot(`${hh}:00`)}>+ Thêm việc lúc {hh}:00</button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <p className={`mt-6 text-xs ${muted}`}>Lịch hiện chỉ hiển thị việc có hạn. Sự kiện riêng và Google Calendar chưa có trong phiên bản này.</p>
    </div>
  );
}
