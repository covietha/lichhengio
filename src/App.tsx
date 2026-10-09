import { useState } from "react";
import { CalendarDays, FolderKanban, ListChecks, Sun, Target } from "lucide-react";
import { DataProvider } from "./hooks/useData";
import { TodayPage } from "./pages/TodayPage";
import { TasksPage } from "./pages/TasksPage";
import { CalendarPage } from "./pages/CalendarPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { GoalsPage } from "./pages/GoalsPage";

const PAGES = [
  { id: "today", label: "Hôm nay", Icon: Sun, View: TodayPage },
  { id: "tasks", label: "Công việc", Icon: ListChecks, View: TasksPage },
  { id: "calendar", label: "Lịch", Icon: CalendarDays, View: CalendarPage },
  { id: "projects", label: "Dự án", Icon: FolderKanban, View: ProjectsPage },
  { id: "goals", label: "Mục tiêu", Icon: Target, View: GoalsPage },
] as const;
type PageId = (typeof PAGES)[number]["id"];

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-2">
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden>
        <rect width="32" height="32" rx="8" className="fill-pen" />
        <rect x="10" y="5" width="2" height="22" className="fill-margin" />
        <path d="M15 11h10M15 16h10M15 21h7" className="stroke-on-pen" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
      <span className="font-display text-xl font-bold tracking-tight">Đăng 360</span>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState<PageId>("today");
  const Current = PAGES.find((p) => p.id === page)!.View;

  return (
    <DataProvider>
      <div className="md:flex">
        <nav aria-label="Điều hướng chính" className="hidden border-line md:sticky md:top-0 md:flex md:h-screen md:w-60 md:shrink-0 md:flex-col md:gap-1 md:border-r md:bg-surface md:p-4">
          <div className="mb-5 mt-2"><Brand /></div>
          {PAGES.map(({ id, label, Icon }) => {
            const active = page === id;
            return (
              <button key={id} onClick={() => setPage(id)} aria-current={active ? "page" : undefined}
                className={`relative flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${active ? "bg-pen-soft font-semibold text-pen" : "text-ink hover:bg-pen-soft/60"}`}>
                {active && <span aria-hidden className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-margin" />}
                <Icon size={19} aria-hidden /> {label}
              </button>
            );
          })}
        </nav>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-28 pt-6 sm:px-8 md:pb-12 md:pt-10"><Current /></main>
      </div>
      <nav aria-label="Điều hướng chính (điện thoại)" className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-5 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
        {PAGES.map(({ id, label, Icon }) => {
          const active = page === id;
          return (
            <button key={id} onClick={() => setPage(id)} aria-current={active ? "page" : undefined}
              className={`relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs ${active ? "font-semibold text-pen" : "text-muted"}`}>
              {active && <span aria-hidden className="absolute inset-x-5 top-0 h-[3px] rounded-b-full bg-margin" />}
              <Icon size={21} aria-hidden /> {label}
            </button>
          );
        })}
      </nav>
    </DataProvider>
  );
}
