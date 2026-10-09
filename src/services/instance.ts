import { db } from "../db/db";
import { DexieGoalRepository, DexieProjectRepository, DexieTaskRepository } from "../repositories/TaskRepository";
import { TaskService } from "./taskService";
import { GoalService, ProjectService } from "./entityServices";
import { getDeviceId, getLocalUserId } from "./identity";

const ctx = { userId: getLocalUserId(), deviceId: getDeviceId() };
export const taskService = new TaskService(new DexieTaskRepository(db), ctx);
export const projectService = new ProjectService(new DexieProjectRepository(db), ctx);
export const goalService = new GoalService(new DexieGoalRepository(db), ctx);
