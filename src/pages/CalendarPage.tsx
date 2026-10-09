import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useData } from "../hooks/useData";
import { addDays } from "../utils/date";
import { dayOfWeek, groupByDate, monthGrid, shiftMonth, weekDays } from "../utils/calendar";
import { QuickAdd } from "../components/QuickAdd";
import { TaskRow } from "../components/TaskRow";
import type { Task } from "../types";
import { btnGhost, btnOutline, errText, field, lbl, muted, pageTitle, segActive } from "../ui";

type View = "day" | "week" | "month";
const DOW = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const VIEW_VI: Record<View, string> = { day: "Ngày", week: "Tuần", month: "Tháng" };
const dayNum = (d: string) => Number(d.slice(8));

function Chip({ t }: { t: Task }) {
  const done = t.status === "COMPLETED";
  return (
    <span className={`mt-0.5 block truncate rounded px-1 py-0.5 text-xs ${done ? "bg-ok-soft text-ok line-through" : "bg-pen-soft text-pen"}`}>
      {t.dueTime ? <span className="tabular-nums">{t.dueTime} </span> : null}{t.title}
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

  const cellCls = (d: string) => `rounded-lg border p-1.5 text-left align-top transition-colors hover:border-pen ${d === today ? "border-pen bg-pen-soft/50" : "border-line bg-surface"}`;
  const dayBadge = (d: string) => `inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-sm font-semibold tabular-nums ${d === today ? "bg-margin text-white" : ""}`;

  const dayTasks = byDate[cursor] ?? [];
  const untimed = dayTasks.filter((t) => !t.dueTime);
  const hours = useMemo(() => {
    const set = new Set<number>(Array.from({ length: 17 }, (_, i) => i + 6));
    for (const t of dayTasks) if (t.dueTime) set.add(Number(t.dueTime.slice(0, 2)));
    return [...set].sort((a, b) => a - b);
  }, [dayTasks]);

  return (
    <div>
      <h1 className={pageTitle}>Lịch</h1>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button aria-label="Kỳ trước" className={btnOutline} onClick={() => step(-1)}><ChevronLeft size={18} aria-hidden /></button>
        <button className={btnOutline} onClick={() => { setCursor(today); setSlot(undefined); }}>Hôm nay</button>
        <button aria-label="Kỳ sau" className={btnOutline} onClick={() => step(1)}><ChevronRight size={18} aria-hidden /></button>
        <h2 className="mx-2 w-full text-xl font-bold tracking-tight sm:w-auto" aria-live="polite">{title}</h2>
        <div className="ml-auto flex gap-1 rounded-xl border border-line bg-surface p-1" role="group" aria-label="Chế độ xem">
          {(Object.keys(VIEW_VI) as View[]).map((v) => (
            <button key={v} aria-pressed={view === v} onClick={() => setView(v)}
              className={`min-h-9 rounded-lg px-4 text-sm font-medium transition-colors ${view === v ? segActive : "hover:bg-pen-soft"}`}>{VIEW_VI[v]}</button>
          ))}
        </div>
      </div>
      {error && <p role="alert" className={`mt-3 ${errText}`}>{error}</p>}

      {view === "month" && (
        <div className="mt-4 overflow-x-auto">
          <div className="grid grid-cols-7 gap-1 sm:min-w-[34rem]" aria-label={title}>
            {DOW.map((d) => <div key={d} className={`px-1.5 pb-1 text-xs font-medium ${muted}`}>{d}</div>)}
            {monthGrid(y, m).flat().map((d) => {
              const list = byDate[d] ?? [];
              const inMonth = Number(d.slice(5, 7)) === m;
              return (
                <button key={d} onClick={() => openDay(d)} className={`${cellCls(d)} min-h-[4rem] sm:min-h-[5rem] ${inMonth ? "" : "opacity-45"}`}
                  aria-label={`Ngày ${d.split("-").reverse().join("/")}, ${list.length} việc`}>
                  <span className={dayBadge(d)}>{dayNum(d)}</span>
                  <span className="hidden sm:block">
                    {list.slice(0, 2).map((t) => <Chip key={t.id} t={t} />)}
                    {list.length > 2 && <span className={`block text-xs ${muted}`}>+{list.length - 2} việc</span>}
                  </span>
                  {list.length > 0 && (
                    <span aria-hidden className="mt-1 flex items-center gap-0.5 sm:hidden">
                      {list.slice(0, 3).map((t) => <span key={t.id} className={`h-1.5 w-1.5 rounded-full ${t.status === "COMPLETED" ? "bg-ok" : "bg-pen"}`} />)}
                      {list.length > 3 && <span className="text-[10px] leading-none text-muted">+</span>}
                    </span>
                  )}
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
                <button className="w-full text-left" onClick={() => openDay(d)} aria-label={`Mở ngày ${d.split("-").reverse().join("/")}`}>
                  <span className={`text-xs font-medium ${muted}`}>{DOW[dayOfWeek(d)]}</span> <span className={dayBadge(d)}>{dayNum(d)}</span>
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
          <h3 className="mt-8 text-lg font-bold tracking-tight">Chưa xếp giờ <span className="ml-1 rounded-full bg-pen-soft px-2 py-0.5 text-xs font-semibold tabular-nums text-pen">{untimed.length}</span></h3>
          {untimed.length === 0 ? <p className={`mt-2 text-sm ${muted}`}>Không có việc nào chưa xếp giờ.</p>
            : <ul className="mt-2 rounded-xl border border-line bg-surface">{untimed.map((t) => <TaskRow key={t.id} task={t} onError={setError} />)}</ul>}
          <h3 className="mt-8 text-lg font-bold tracking-tight">Theo giờ</h3>
          <ul className="mt-2 rounded-xl border border-line bg-surface px-1">
            {hours.map((h) => {
              const hh = String(h).padStart(2, "0");
              const list = dayTasks.filter((t) => t.dueTime?.startsWith(hh));
              return (
                <li key={h} className="flex gap-3 border-b border-line py-1 last:border-b-0">
                  <span className={`w-14 shrink-0 pl-2 pt-3 text-sm font-medium tabular-nums ${muted}`}>{hh}:00</span>
                  <div className="min-w-0 flex-1">
                    {list.length > 0 && <ul>{list.map((t) => <TaskRow key={t.id} task={t} onError={setError} />)}</ul>}
                    <button className={`${btnGhost} !min-h-10 text-muted`} onClick={() => setSlot(`${hh}:00`)}>+ Thêm việc lúc {hh}:00</button>
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
