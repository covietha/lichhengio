import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { getLocalUserId } from "../services/identity";
import type { Goal, Project, Task } from "../types";
import { todayStr } from "../utils/date";

interface Data { tasks: Task[]; projects: Project[]; goals: Goal[]; ready: boolean; today: string }
const Ctx = createContext<Data>({ tasks: [], projects: [], goals: [], ready: false, today: todayStr() });

const live = <T extends { deletedAt?: string }>(rows: T[]) => rows.filter((r) => !r.deletedAt);

/** Ngày hôm nay (giờ Việt Nam), tự cập nhật khi qua nửa đêm mà không cần tải lại trang. */
function useToday() {
  const [t, setT] = useState(todayStr());
  useEffect(() => {
    const id = setInterval(() => setT(todayStr()), 30_000);
    return () => clearInterval(id);
  }, []);
  return t;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const userId = getLocalUserId();
  const tasks = useLiveQuery(async () => live(await db.tasks.where("userId").equals(userId).toArray()), [userId]);
  const projects = useLiveQuery(async () => live(await db.projects.where("userId").equals(userId).toArray()), [userId]);
  const goals = useLiveQuery(async () => live(await db.goals.where("userId").equals(userId).toArray()), [userId]);
  const today = useToday();
  const value = useMemo<Data>(
    () => ({ tasks: tasks ?? [], projects: projects ?? [], goals: goals ?? [], ready: !!tasks && !!projects && !!goals, today }),
    [tasks, projects, goals, today],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useData = () => useContext(Ctx);

export function usePendingCount() {
  return useLiveQuery(() => db.outbox.count(), [], 0);
}
