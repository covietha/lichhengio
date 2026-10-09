import { useMemo, useState, type ReactNode } from "react";
import { useData } from "../hooks/useData";
import { summarize } from "../services/overdue";
import { addDays } from "../utils/date";
import { QuickAdd } from "../components/QuickAdd";
import { TaskRow } from "../components/TaskRow";
import { SyncBadge } from "../components/SyncBadge";
import { ProgressBar } from "../components/ProgressBar";
import { errText, muted } from "../ui";

const fmtPart = (d: string, o: Intl.DateTimeFormatOptions) => {
  const [y, m, day] = d.split("-").map(Number);
  return new Intl.DateTimeFormat("vi-VN", { timeZone: "UTC", ...o }).format(new Date(Date.UTC(y, m - 1, day)));
};

function Section({ title, count, tone, children }: { title: string; count: number; tone?: "alert"; children: ReactNode }) {
  return (
    <section className="mt-10" aria-labelledby={title}>
      <h2 id={title} className={`flex items-center gap-2 text-xl font-bold tracking-tight ${tone === "alert" ? "text-margin" : ""}`}>
        {title}
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${tone === "alert" ? "bg-margin-soft text-margin" : "bg-pen-soft text-pen"}`}>{count}</span>
      </h2>
      <div className="mt-2 rounded-xl border border-line bg-surface">{children}</div>
    </section>
  );
}

const Empty = ({ children }: { children: ReactNode }) => <p className={`px-4 py-5 text-sm ${muted}`}>{children}</p>;

export function TodayPage() {
  const { tasks, ready, today } = useData();
  const [error, setError] = useState<string | null>(null);
  const s = useMemo(() => summarize(tasks, today, addDays(today, 7)), [tasks, today]);
  const total = s.dueToday.length + s.doneToday.length;
  const progress = { done: s.doneToday.length, total, percent: total === 0 ? null : Math.round((s.doneToday.length / total) * 100) };

  return (
    <div>
      <header>
        <div className="flex items-center gap-4 border-l-4 border-margin pl-4">
          <p className="font-display text-7xl font-bold leading-none tracking-tighter tabular-nums">{fmtPart(today, { day: "numeric" })}</p>
          <div>
            <h1 className="text-2xl font-bold capitalize leading-tight tracking-tight">{fmtPart(today, { weekday: "long" })}</h1>
            <p className={`mt-0.5 ${muted}`}>{fmtPart(today, { month: "long", year: "numeric" })}</p>
          </div>
        </div>
        <div className="mt-5"><SyncBadge /></div>
      </header>
      <div className="mt-6"><QuickAdd /></div>
      {error && <p role="alert" className={`mt-3 ${errText}`}>{error}</p>}
      {!ready ? <p className="mt-8">Đang tải dữ liệu từ máy...</p> : (
        <>
          <div className="mt-8">
            {total === 0
              ? <p className="font-medium">Hôm nay chưa có việc nào.</p>
              : <><p className="mb-2 font-medium">Đã xong {s.doneToday.length}/{total} việc hôm nay</p><ProgressBar progress={progress} label="Tiến độ việc hôm nay" /></>}
            {s.overdue.length > 0 && <p className="mt-3 text-sm font-semibold text-margin">Có {s.overdue.length} việc quá hạn.</p>}
          </div>
          {s.overdue.length > 0 && (
            <Section title="Quá hạn" count={s.overdue.length} tone="alert">
              <ul>{s.overdue.map((t) => <TaskRow key={t.id} task={t} overdue showDate onError={setError} />)}</ul>
            </Section>
          )}
          <Section title="Việc hôm nay" count={s.dueToday.length}>
            {s.dueToday.length === 0
              ? <Empty>Không còn việc nào đến hạn hôm nay. Thêm việc ở phía trên.</Empty>
              : <ul>{s.dueToday.map((t) => <TaskRow key={t.id} task={t} onError={setError} />)}</ul>}
            {s.doneToday.length > 0 && <ul className="border-t border-line">{s.doneToday.map((t) => <TaskRow key={t.id} task={t} onError={setError} />)}</ul>}
          </Section>
          <Section title="Sắp đến hạn (7 ngày)" count={s.upcoming.length}>
            {s.upcoming.length === 0
              ? <Empty>Không có deadline nào trong 7 ngày tới.</Empty>
              : <ul>{s.upcoming.map((t) => <TaskRow key={t.id} task={t} showDate onError={setError} />)}</ul>}
          </Section>
        </>
      )}
    </div>
  );
}
