import { useCallback, useEffect, useState, type MouseEvent } from "react";
import { CalendarDays, FolderKanban, ListChecks, Sun, Target } from "lucide-react";
import { DataProvider } from "./hooks/useData";
import { TodayPage } from "./pages/TodayPage";
import { TasksPage } from "./pages/TasksPage";
import { CalendarPage } from "./pages/CalendarPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { GoalsPage } from "./pages/GoalsPage";

const PAGES = [
  { id: "today", path: "/", label: "Hôm nay", Icon: Sun, View: TodayPage },
  { id: "tasks", path: "/cong-viec", label: "Công việc", Icon: ListChecks, View: TasksPage },
  { id: "calendar", path: "/lich", label: "Lịch", Icon: CalendarDays, View: CalendarPage },
  { id: "projects", path: "/du-an", label: "Dự án", Icon: FolderKanban, View: ProjectsPage },
  { id: "goals", path: "/muc-tieu", label: "Mục tiêu", Icon: Target, View: GoalsPage },
] as const;
type PageId = (typeof PAGES)[number]["id"];

/** Địa chỉ trên thanh trình duyệt → trang. Địa chỉ lạ thì về trang Hôm nay. */
function pageFromPath(pathname: string): PageId {
  const clean = pathname.replace(/\/+$/, "") || "/";
  return PAGES.find((p) => p.path === clean)?.id ?? "today";
}

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
  const [page, setPage] = useState<PageId>(() => pageFromPath(window.location.pathname));
  const current = PAGES.find((p) => p.id === page)!;
  const Current = current.View;

  // Nút Back/Forward của trình duyệt.
  useEffect(() => {
    const onPop = () => setPage(pageFromPath(window.location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Tiêu đề tab trình duyệt đi theo trang đang mở.
  useEffect(() => {
    document.title = page === "today" ? "Đăng 360 | Trợ lý cá nhân" : `${current.label} | Đăng 360`;
  }, [page, current.label]);

  // Địa chỉ lạ (ví dụ /abc) được đưa về địa chỉ chuẩn của trang Hôm nay.
  useEffect(() => {
    const target = PAGES.find((p) => p.id === page)!.path;
    if ((window.location.pathname.replace(/\/+$/, "") || "/") !== target) window.history.replaceState(null, "", target);
  }, [page]);

  const go = useCallback((e: MouseEvent<HTMLAnchorElement>, id: PageId) => {
    // Giữ nguyên hành vi mở tab mới (Ctrl/Cmd/Shift + bấm, chuột giữa).
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const path = PAGES.find((p) => p.id === id)!.path;
    if (window.location.pathname !== path) window.history.pushState(null, "", path);
    setPage(id);
    window.scrollTo(0, 0);
  }, []);

  return (
    <DataProvider>
      <div className="md:flex">
        <nav aria-label="Điều hướng chính" className="hidden border-line md:sticky md:top-0 md:flex md:h-screen md:w-60 md:shrink-0 md:flex-col md:gap-1 md:border-r md:bg-surface md:p-4">
          <div className="mb-5 mt-2"><Brand /></div>
          {PAGES.map(({ id, path, label, Icon }) => {
            const active = page === id;
            return (
              <a key={id} href={path} onClick={(e) => go(e, id)} aria-current={active ? "page" : undefined}
                className={`relative flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${active ? "bg-pen-soft font-semibold text-pen" : "text-ink hover:bg-pen-soft/60"}`}>
                {active && <span aria-hidden className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-margin" />}
                <Icon size={19} aria-hidden /> {label}
              </a>
            );
          })}
        </nav>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-28 pt-6 sm:px-8 md:pb-12 md:pt-10"><Current /></main>
      </div>
      <nav aria-label="Điều hướng chính (điện thoại)" className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-5 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
        {PAGES.map(({ id, path, label, Icon }) => {
          const active = page === id;
          return (
            <a key={id} href={path} onClick={(e) => go(e, id)} aria-current={active ? "page" : undefined}
              className={`relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs ${active ? "font-semibold text-pen" : "text-muted"}`}>
              {active && <span aria-hidden className="absolute inset-x-5 top-0 h-[3px] rounded-b-full bg-margin" />}
              <Icon size={21} aria-hidden /> {label}
            </a>
          );
        })}
      </nav>
    </DataProvider>
  );
}
