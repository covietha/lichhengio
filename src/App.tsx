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

export default function App() {
  const [page, setPage] = useState<PageId>("today");
  const Current = PAGES.find((p) => p.id === page)!.View;

  return (
    <DataProvider>
      <div className="md:flex">
        <nav aria-label="Điều hướng chính" className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-56 md:flex-col md:gap-1 md:border-r md:border-ink/10 md:p-4 dark:md:border-ink-dark/15">
          <p className="mb-4 px-2 font-semibold">Đăng 360</p>
          {PAGES.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setPage(id)} aria-current={page === id ? "page" : undefined}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm ${page === id ? "bg-brand/10 font-medium text-brand dark:bg-brand-dark/15 dark:text-brand-dark" : "hover:bg-ink/5 dark:hover:bg-ink-dark/10"}`}>
              <Icon size={18} aria-hidden /> {label}
            </button>
          ))}
        </nav>
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-24 pt-6 md:pb-10"><Current /></main>
      </div>
      <nav aria-label="Điều hướng chính (điện thoại)" className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-5 border-t border-ink/10 bg-paper pb-[env(safe-area-inset-bottom)] md:hidden dark:border-ink-dark/15 dark:bg-paper-dark">
        {PAGES.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setPage(id)} aria-current={page === id ? "page" : undefined}
            className={`flex flex-col items-center gap-0.5 py-2 text-[11px] ${page === id ? "font-medium text-brand dark:text-brand-dark" : ""}`}>
            <Icon size={20} aria-hidden /> {label}
          </button>
        ))}
      </nav>
    </DataProvider>
  );
}
