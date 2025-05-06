import { User, Task, TaskWithRelations, Notification } from "@shared/schema";

export type StatusType = 'todo' | 'in_progress' | 'in_review' | 'completed';
export type PriorityType = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskStats {
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
}
