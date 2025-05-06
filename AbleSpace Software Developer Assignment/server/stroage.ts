import { db } from "@db";
import { 
  users, tasks, notifications, 
  InsertUser, InsertTask, UpdateTask, InsertNotification,
  User, Task, Notification, TaskWithRelations
} from "@shared/schema";
import { eq, and, or, desc, isNull, gte, lte, like } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { pool } from "@db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Task operations
  getTasks(): Promise<TaskWithRelations[]>;
  getTaskById(id: number): Promise<TaskWithRelations | undefined>;
  getTasksByUserId(userId: number, type?: 'assigned' | 'created' | 'all'): Promise<TaskWithRelations[]>;
  getTasksByStatus(status: string): Promise<TaskWithRelations[]>;
  getOverdueTasks(userId: number): Promise<TaskWithRelations[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: UpdateTask): Promise<Task | undefined>;
  deleteTask(id: number): Promise<void>;
  searchTasks(query: string, userId: number): Promise<TaskWithRelations[]>;
  filterTasks(filters: {
    status?: string;
    priority?: string;
    dueDate?: string;
    assigneeId?: number;
  }, userId: number): Promise<TaskWithRelations[]>;

  // Notification operations
  getNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<void>;

  // Session store
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  // Task operations
  async getTasks(): Promise<TaskWithRelations[]> {
    return db.query.tasks.findMany({
      with: {
        creator: true,
        assignee: true,
      },
      orderBy: desc(tasks.createdAt),
    });
  }

  async getTaskById(id: number): Promise<TaskWithRelations | undefined> {
    return db.query.tasks.findFirst({
      where: eq(tasks.id, id),
      with: {
        creator: true,
        assignee: true,
      },
    });
  }

  async getTasksByUserId(userId: number, type: 'assigned' | 'created' | 'all' = 'all'): Promise<TaskWithRelations[]> {
    let query;
    
    if (type === 'assigned') {
      query = eq(tasks.assigneeId, userId);
    } else if (type === 'created') {
      query = eq(tasks.creatorId, userId);
    } else {
      query = or(eq(tasks.assigneeId, userId), eq(tasks.creatorId, userId));
    }

    return db.query.tasks.findMany({
      where: query,
      with: {
        creator: true,
        assignee: true,
      },
      orderBy: desc(tasks.createdAt),
    });
  }

  async getTasksByStatus(status: string): Promise<TaskWithRelations[]> {
    return db.query.tasks.findMany({
      where: eq(tasks.status, status),
      with: {
        creator: true,
        assignee: true,
      },
      orderBy: desc(tasks.createdAt),
    });
  }

  async getOverdueTasks(userId: number): Promise<TaskWithRelations[]> {
    const now = new Date();
    
    return db.query.tasks.findMany({
      where: and(
        or(eq(tasks.assigneeId, userId), eq(tasks.creatorId, userId)),
        lte(tasks.dueDate, now),
        or(
          eq(tasks.status, 'todo'),
          eq(tasks.status, 'in_progress'),
          eq(tasks.status, 'in_review')
        )
      ),
      with: {
        creator: true,
        assignee: true,
      },
      orderBy: desc(tasks.createdAt),
    });
  }

  async createTask(task: InsertTask): Promise<Task> {
    const result = await db.insert(tasks).values(task).returning();
    return result[0];
  }

  async updateTask(id: number, task: UpdateTask): Promise<Task | undefined> {
    const result = await db.update(tasks)
      .set({ ...task, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return result[0];
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async searchTasks(query: string, userId: number): Promise<TaskWithRelations[]> {
    return db.query.tasks.findMany({
      where: and(
        or(eq(tasks.assigneeId, userId), eq(tasks.creatorId, userId)),
        or(
          like(tasks.title, `%${query}%`),
          like(tasks.description || '', `%${query}%`)
        )
      ),
      with: {
        creator: true,
        assignee: true,
      },
      orderBy: desc(tasks.createdAt),
    });
  }

  async filterTasks(filters: {
    status?: string;
    priority?: string;
    dueDate?: string;
    assigneeId?: number;
  }, userId: number): Promise<TaskWithRelations[]> {
    let conditions = [];
    
    // Base condition: tasks for this user (either as creator or assignee)
    conditions.push(or(eq(tasks.assigneeId, userId), eq(tasks.creatorId, userId)));
    
    // Add filter conditions
    if (filters.status && filters.status !== 'all') {
      conditions.push(eq(tasks.status, filters.status));
    }
    
    if (filters.priority && filters.priority !== 'all') {
      conditions.push(eq(tasks.priority, filters.priority));
    }
    
    if (filters.dueDate) {
      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0));
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      const monthEnd = new Date(today);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      
      if (filters.dueDate === 'today') {
        conditions.push(and(gte(tasks.dueDate, today), lte(tasks.dueDate, tomorrow)));
      } else if (filters.dueDate === 'this_week') {
        conditions.push(and(gte(tasks.dueDate, today), lte(tasks.dueDate, weekEnd)));
      } else if (filters.dueDate === 'this_month') {
        conditions.push(and(gte(tasks.dueDate, today), lte(tasks.dueDate, monthEnd)));
      } else if (filters.dueDate === 'overdue') {
        conditions.push(lte(tasks.dueDate, today));
      }
    }
    
    if (filters.assigneeId) {
      conditions.push(eq(tasks.assigneeId, filters.assigneeId));
    }
    
    return db.query.tasks.findMany({
      where: and(...conditions),
      with: {
        creator: true,
        assignee: true,
      },
      orderBy: desc(tasks.createdAt),
    });
  }

  // Notification operations
  async getNotifications(userId: number): Promise<Notification[]> {
    return db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const result = await db.insert(notifications).values(notification).returning();
    return result[0];
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id));
  }
}

export const storage = new DatabaseStorage();
