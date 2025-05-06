import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { insertTaskSchema, updateTaskSchema, InsertTask, UpdateTask } from "@shared/schema";

export async function getAllTasks(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const tasks = await storage.getTasks();
    res.json(tasks);
  } catch (error) {
    next(error);
  }
}

export async function getTaskById(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const task = await storage.getTaskById(parseInt(req.params.id));
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(task);
  } catch (error) {
    next(error);
  }
}

export async function getTasksByUserId(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const type = req.query.type as 'assigned' | 'created' | 'all' || 'all';
    const tasks = await storage.getTasksByUserId(req.user!.id, type);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
}

export async function getTasksByStatus(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const status = req.params.status;
    const tasks = await storage.getTasksByStatus(status);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
}

export async function getOverdueTasks(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const tasks = await storage.getOverdueTasks(req.user!.id);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
}

export async function createTask(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const result = insertTaskSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }

    const taskData: InsertTask = {
      ...result.data,
      creatorId: req.user!.id,
    };

    const task = await storage.createTask(taskData);
    
    // Create notification if the task is assigned to someone
    if (task.assigneeId && task.assigneeId !== req.user!.id) {
      await storage.createNotification({
        userId: task.assigneeId,
        taskId: task.id,
        message: `You have been assigned a new task: ${task.title}`,
      });
    }

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
}

export async function updateTask(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const result = updateTaskSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }

    const taskId = parseInt(req.params.id);
    
    // Check if task exists
    const existingTask = await storage.getTaskById(taskId);
    if (!existingTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if user has permission to update the task
    if (existingTask.creatorId !== req.user!.id && existingTask.assigneeId !== req.user!.id) {
      return res.status(403).json({ message: "You don't have permission to update this task" });
    }

    const taskData: UpdateTask = result.data;
    const updatedTask = await storage.updateTask(taskId, taskData);

    // Create notification if the task is reassigned
    if (
      taskData.assigneeId && 
      taskData.assigneeId !== existingTask.assigneeId && 
      taskData.assigneeId !== req.user!.id
    ) {
      await storage.createNotification({
        userId: taskData.assigneeId,
        taskId: taskId,
        message: `You have been assigned a task: ${existingTask.title}`,
      });
    }

    // Create notification if status changes to completed
    if (taskData.status === 'completed' && existingTask.status !== 'completed' && existingTask.creatorId !== req.user!.id) {
      await storage.createNotification({
        userId: existingTask.creatorId,
        taskId: taskId,
        message: `Task "${existingTask.title}" has been marked as completed`,
      });
    }

    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const taskId = parseInt(req.params.id);
    
    // Check if task exists
    const existingTask = await storage.getTaskById(taskId);
    if (!existingTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if user has permission to delete the task
    if (existingTask.creatorId !== req.user!.id) {
      return res.status(403).json({ message: "You don't have permission to delete this task" });
    }

    await storage.deleteTask(taskId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function searchTasks(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const tasks = await storage.searchTasks(query, req.user!.id);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
}

export async function filterTasks(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const status = req.query.status as string;
    const priority = req.query.priority as string;
    const dueDate = req.query.dueDate as string;
    const assigneeId = req.query.assigneeId ? parseInt(req.query.assigneeId as string) : undefined;

    const filters = {
      status,
      priority,
      dueDate,
      assigneeId,
    };

    const tasks = await storage.filterTasks(filters, req.user!.id);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
}
