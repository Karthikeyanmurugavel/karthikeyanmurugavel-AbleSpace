import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const taskStatusEnum = pgEnum('task_status', ['todo', 'in_progress', 'in_review', 'completed']);
export const taskPriorityEnum = pgEnum('task_priority', ['low', 'medium', 'high', 'urgent']);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  assignedTasks: many(tasks, { relationName: "assignee" }),
  createdTasks: many(tasks, { relationName: "creator" }),
}));

export const insertUserSchema = createInsertSchema(users, {
  username: (schema) => schema.min(3, "Username must be at least 3 characters"),
  password: (schema) => schema.min(6, "Password must be at least 6 characters"),
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
}).omit({ id: true, createdAt: true });

export const loginUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: taskStatusEnum("status").notNull().default('todo'),
  priority: taskPriorityEnum("priority").notNull().default('medium'),
  dueDate: timestamp("due_date"),
  creatorId: integer("creator_id").references(() => users.id).notNull(),
  assigneeId: integer("assignee_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tasksRelations = relations(tasks, ({ one }) => ({
  creator: one(users, {
    fields: [tasks.creatorId],
    references: [users.id],
    relationName: "creator"
  }),
  assignee: one(users, {
    fields: [tasks.assigneeId],
    references: [users.id],
    relationName: "assignee"
  }),
}));

export const insertTaskSchema = createInsertSchema(tasks, {
  title: (schema) => schema.min(3, "Title must be at least 3 characters"),
  description: (schema) => schema.nullable().superRefine((val, ctx) => {
    if (val && val.length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_small,
        minimum: 5,
        type: "string",
        inclusive: true,
        message: "Description must be at least 5 characters",
      });
    }
  }),
  status: (schema) => schema,
  priority: (schema) => schema,
  dueDate: (schema) => schema.nullable(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const updateTaskSchema = createInsertSchema(tasks, {
  title: (schema) => schema.min(3, "Title must be at least 3 characters").optional(),
  description: (schema) => schema.nullable().superRefine((val, ctx) => {
    if (val && val.length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_small,
        minimum: 5,
        type: "string",
        inclusive: true,
        message: "Description must be at least 5 characters",
      });
    }
  }),
  status: (schema) => schema.optional(),
  priority: (schema) => schema.optional(),
  dueDate: (schema) => schema.nullable().optional(),
  assigneeId: (schema) => schema.nullable().optional(),
}).omit({ id: true, creatorId: true, createdAt: true, updatedAt: true }).partial();

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  taskId: integer("task_id").references(() => tasks.id).notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  task: one(tasks, {
    fields: [notifications.taskId],
    references: [tasks.id],
  }),
}));

export const insertNotificationSchema = createInsertSchema(notifications, {
  message: (schema) => schema.min(1, "Message cannot be empty"),
}).omit({ id: true, createdAt: true });

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;

export type Task = typeof tasks.$inferSelect;
export type TaskWithRelations = Task & { 
  creator?: User,
  assignee?: User | null
};
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
