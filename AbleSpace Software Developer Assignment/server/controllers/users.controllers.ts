import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

export async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Get all users to be able to assign tasks
    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      name: users.name,
    }).from(users);

    res.json(allUsers);
  } catch (error) {
    next(error);
  }
}

export async function getNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userNotifications = await storage.getNotifications(req.user!.id);
    res.json(userNotifications);
  } catch (error) {
    next(error);
  }
}

export async function markNotificationAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const notificationId = parseInt(req.params.id);
    await storage.markNotificationAsRead(notificationId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
