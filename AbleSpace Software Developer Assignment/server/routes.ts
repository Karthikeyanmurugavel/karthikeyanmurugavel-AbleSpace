import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { WebSocket, WebSocketServer } from "ws";
import {
  getAllTasks,
  getTaskById,
  getTasksByUserId,
  getTasksByStatus,
  getOverdueTasks,
  createTask,
  updateTask,
  deleteTask,
  searchTasks,
  filterTasks,
} from "./controllers/tasks.controller";
import {
  getUsers,
  getNotifications,
  markNotificationAsRead,
} from "./controllers/users.controller";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Create HTTP server
  const httpServer = createServer(app);

  // Setup WebSocket server for real-time notifications
  // Use a specific path to avoid conflicts with Vite's WebSocket
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws'
  });
  
  // Store connected clients by userId
  const clients = new Map<number, WebSocket>();

  wss.on("connection", (ws) => {
    console.log('WebSocket client connected');
    
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        // Authenticate and store client connection
        if (data.type === "auth" && data.userId) {
          clients.set(data.userId, ws);
          console.log(`WebSocket client authenticated for user: ${data.userId}`);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    });

    ws.on("close", () => {
      // Remove client on disconnect - use safe iteration
      const entries = Array.from(clients.entries());
      for (const [userId, client] of entries) {
        if (client === ws) {
          clients.delete(userId);
          console.log(`WebSocket client disconnected for user: ${userId}`);
          break;
        }
      }
    });
    
    // Keep connection alive with ping/pong
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
    
    // Send initial message to confirm connection
    ws.send(JSON.stringify({ type: 'connected' }));
  });

  // Task routes
  app.get("/api/tasks", getAllTasks);
  app.get("/api/tasks/:id", getTaskById);
  app.get("/api/tasks/user/me", getTasksByUserId);
  app.get("/api/tasks/status/:status", getTasksByStatus);
  app.get("/api/tasks/overdue", getOverdueTasks);
  app.post("/api/tasks", createTask);
  app.put("/api/tasks/:id", updateTask);
  app.delete("/api/tasks/:id", deleteTask);
  app.get("/api/tasks/search", searchTasks);
  app.get("/api/tasks/filter", filterTasks);

  // User routes
  app.get("/api/users", getUsers);
  app.get("/api/notifications", getNotifications);
  app.put("/api/notifications/:id/read", markNotificationAsRead);

  // Helper function to send notification via WebSocket
  app.post("/api/notifications/send", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { userId, taskId, message } = req.body;
      
      // Create notification in database
      const notification = await storage.createNotification({
        userId,
        taskId,
        message,
      });

      // Send real-time notification if user is connected
      const client = clients.get(userId);
      if (client && client.readyState === WebSocket.OPEN) {
        try {
          client.send(JSON.stringify({
            type: "notification",
            data: notification,
          }));
        } catch (error) {
          console.error('Error sending notification:', error);
        }
      }

      res.status(201).json(notification);
    } catch (error) {
      next(error);
    }
  });

  return httpServer;
}
