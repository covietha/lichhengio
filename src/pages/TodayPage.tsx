import { useMemo, useState, type ReactNode } from "react";
import { useData } from "../hooks/useData";
import { summarize } from "../services/overdue";
import { addDays, formatDateVi } from "../utils/date";
import { QuickAdd } from "../components/QuickAdd";
import { TaskRow } from "../components/TaskRow";
import { SyncBadge } from "../components/SyncBadge";
import { errText, muted } from "../ui";

function Section({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  return (
    <section className="mt-8" aria-labelledby={title}>
      <h2 id={title} className="text-lg font-semibold">{title} <span className={`font-normal ${muted}`}>({count})</span></h2>
      {children}
    </section>
  );
}

export function TodayPage() {
  const { tasks, ready, today } = useData();
  const [error, setError] = useState<string | null>(null);
  const s = useMemo(() => summarize(tasks, today, addDays(today, 7)), [tasks, today]);
  const total = s.dueToday.length + s.doneToday.length;

  return (
    <div>
      <header>
        <h1 className="text-2xl font-semibold">Hôm nay</h1>
        <p className="mt-1 capitalize">{formatDateVi(today)}</p>
        <SyncBadge />
      </header>
      <div className="mt-6"><QuickAdd /></div>
      {error && <p role="alert" className={`mt-3 ${errText}`}>{error}</p>}
      {!ready ? <p className="mt-8">Đang tải dữ liệu từ máy...</p> : (
        <>
          <p className="mt-6">
            {total === 0 ? "Hôm nay chưa có việc nào." : `Đã xong ${s.doneToday.length}/${total} việc hôm nay.`}
            {s.overdue.length > 0 ? ` Có ${s.overdue.length} việc quá hạn.` : ""}
          </p>
          {s.overdue.length > 0 && (
            <Section title="Quá hạn" count={s.overdue.length}>
              <ul>{s.overdue.map((t) => <TaskRow key={t.id} task={t} overdue showDate onError={setError} />)}</ul>
            </Section>
          )}
          <Section title="Việc hôm nay" count={s.dueToday.length}>
            {s.dueToday.length === 0
              ? <p className={`mt-2 ${muted}`}>Không còn việc nào đến hạn hôm nay. Thêm việc ở phía trên.</p>
              : <ul>{s.dueToday.map((t) => <TaskRow key={t.id} task={t} onError={setError} />)}</ul>}
            {s.doneToday.length > 0 && <ul className="mt-2">{s.doneToday.map((t) => <TaskRow key={t.id} task={t} onError={setError} />)}</ul>}
          </Section>
          <Section title="Sắp đến hạn (7 ngày)" count={s.upcoming.length}>
            {s.upcoming.length === 0
              ? <p className={`mt-2 ${muted}`}>Không có deadline nào trong 7 ngày tới.</p>
              : <ul>{s.upcoming.map((t) => <TaskRow key={t.id} task={t} showDate onError={setError} />)}</ul>}
          </Section>
        </>
      )}
    </div>
  );
}
