import { db } from "./index";
import { users, tasks, notifications } from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  try {
    // Check if users already exist
    const existingUsers = await db.select().from(users);
    if (existingUsers.length > 0) {
      console.log('Database already has users, skipping seed');
      return;
    }

    // Seed users
    const demoUsers = [
      {
        username: 'john.smith',
        password: await hashPassword('password123'),
        name: 'John Smith',
      },
      {
        username: 'alex.king',
        password: await hashPassword('password123'),
        name: 'Alex King',
      },
      {
        username: 'robert.smith',
        password: await hashPassword('password123'),
        name: 'Robert Smith',
      }
    ];

    console.log('Seeding users...');
    const createdUsers = await db.insert(users).values(demoUsers).returning();

    // Seed tasks
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const demoTasks = [
      {
        title: 'Update user documentation',
        description: 'Review and update the user documentation with the latest features and screenshots.',
        status: 'todo' as const,
        priority: 'medium' as const,
        dueDate: nextWeek,
        creatorId: createdUsers[0].id,
        assigneeId: createdUsers[1].id,
      },
      {
        title: 'Create landing page wireframes',
        description: 'Design wireframes for the new landing page based on the requirements.',
        status: 'todo' as const,
        priority: 'high' as const,
        dueDate: nextWeek,
        creatorId: createdUsers[0].id,
        assigneeId: createdUsers[0].id,
      },
      {
        title: 'Research API integration options',
        description: 'Research available API options for payment processing integration.',
        status: 'todo' as const,
        priority: 'low' as const,
        dueDate: nextWeek,
        creatorId: createdUsers[2].id,
        assigneeId: createdUsers[2].id,
      },
      {
        title: 'Prepare quarterly report',
        description: 'Compile data and prepare the quarterly progress report for stakeholders.',
        status: 'todo' as const,
        priority: 'urgent' as const,
        dueDate: yesterday,
        creatorId: createdUsers[2].id,
        assigneeId: createdUsers[0].id,
      },
      {
        title: 'Implement authentication system',
        description: 'Create secure user authentication system with JWT tokens and role-based permissions.',
        status: 'in_progress' as const,
        priority: 'high' as const,
        dueDate: nextWeek,
        creatorId: createdUsers[1].id,
        assigneeId: createdUsers[2].id,
      },
      {
        title: 'Optimize database queries',
        description: 'Review and optimize slow database queries to improve application performance.',
        status: 'in_progress' as const,
        priority: 'medium' as const,
        dueDate: nextWeek,
        creatorId: createdUsers[1].id,
        assigneeId: createdUsers[0].id,
      },
      {
        title: 'Design user interface components',
        description: 'Create reusable UI components following the design system guidelines.',
        status: 'in_progress' as const,
        priority: 'medium' as const,
        dueDate: nextWeek,
        creatorId: createdUsers[0].id,
        assigneeId: createdUsers[1].id,
      },
      {
        title: 'Set up CI/CD pipeline',
        description: 'Configure continuous integration and deployment pipeline for automated testing and deployment.',
        status: 'in_progress' as const,
        priority: 'medium' as const,
        dueDate: nextWeek,
        creatorId: createdUsers[1].id,
        assigneeId: createdUsers[2].id,
      },
      {
        title: 'Conduct user testing',
        description: 'Plan and conduct user testing sessions to gather feedback on the new features.',
        status: 'in_progress' as const,
        priority: 'high' as const,
        dueDate: nextWeek,
        creatorId: createdUsers[0].id,
        assigneeId: createdUsers[1].id,
      },
      {
        title: 'Create project requirements document',
        description: 'Document the project requirements and scope for the task management system.',
        status: 'completed' as const,
        priority: 'medium' as const,
        dueDate: yesterday,
        creatorId: createdUsers[0].id,
        assigneeId: createdUsers[0].id,
      },
      {
        title: 'Set up development environment',
        description: 'Configure development environments with Node.js, MongoDB, and necessary dependencies.',
        status: 'completed' as const,
        priority: 'medium' as const,
        dueDate: yesterday,
        creatorId: createdUsers[1].id,
        assigneeId: createdUsers[2].id,
      },
      {
        title: 'Create database schema',
        description: 'Design and implement database schema for users, tasks, and team relationships.',
        status: 'completed' as const,
        priority: 'medium' as const,
        dueDate: yesterday,
        creatorId: createdUsers[1].id,
        assigneeId: createdUsers[0].id,
      },
    ];

    console.log('Seeding tasks...');
    const createdTasks = await db.insert(tasks).values(demoTasks).returning();

    // Seed notifications
    const demoNotifications = [
      {
        userId: createdUsers[0].id,
        taskId: createdTasks[0].id,
        message: 'You have been assigned a new task: Update user documentation',
        read: false,
      },
      {
        userId: createdUsers[1].id,
        taskId: createdTasks[4].id,
        message: 'Task "Implement authentication system" has been updated',
        read: true,
      },
      {
        userId: createdUsers[2].id,
        taskId: createdTasks[7].id,
        message: 'You have been assigned a task: Set up CI/CD pipeline',
        read: false,
      },
    ];

    console.log('Seeding notifications...');
    await db.insert(notifications).values(demoNotifications);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seed();
