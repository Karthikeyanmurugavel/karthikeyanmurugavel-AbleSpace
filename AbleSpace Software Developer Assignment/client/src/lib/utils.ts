import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isThisWeek, isThisMonth, isPast } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'MMM d, yyyy');
  } catch {
    return '';
  }
};

export const getInitials = (name: string): string => {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'low':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'urgent':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-neutral-100 text-neutral-800';
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'todo':
      return 'bg-neutral-100 text-neutral-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case 'in_review':
      return 'bg-orange-100 text-orange-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-neutral-100 text-neutral-800';
  }
};

export const getStatusDotColor = (status: string): string => {
  switch (status) {
    case 'todo':
      return 'bg-neutral-400';
    case 'in_progress':
      return 'bg-blue-500';
    case 'in_review':
      return 'bg-orange-500';
    case 'completed':
      return 'bg-green-500';
    default:
      return 'bg-neutral-400';
  }
};

export const formatStatusLabel = (status: string): string => {
  switch (status) {
    case 'todo':
      return 'To Do';
    case 'in_progress':
      return 'In Progress';
    case 'in_review':
      return 'In Review';
    case 'completed':
      return 'Completed';
    default:
      return status;
  }
};

export const formatPriorityLabel = (priority: string): string => {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
};

export const isTaskOverdue = (dueDate: Date | string | null, status: string): boolean => {
  if (!dueDate) return false;
  if (status === 'completed') return false;
  
  const date = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  return isPast(date) && date.getDate() !== new Date().getDate();
};

export const getDateFilterValue = (date: Date | string | null): string => {
  if (!date) return 'all_time';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isToday(dateObj)) return 'today';
  if (isThisWeek(dateObj)) return 'this_week';
  if (isThisMonth(dateObj)) return 'this_month';
  if (isPast(dateObj)) return 'overdue';
  
  return 'all_time';
};

export const getDueDateClass = (dueDate: Date | string | null, status: string): string => {
  if (!dueDate) return 'text-neutral-500';
  if (status === 'completed') return 'text-neutral-500';
  
  const date = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  return isPast(date) && date.getDate() !== new Date().getDate() ? 'text-red-500 font-medium' : 'text-neutral-500';
};
