import { useQuery } from "@tanstack/react-query";
import { TaskWithRelations } from "@shared/schema";
import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import TaskColumn from "@/components/dashboard/task-column";
import StatCard from "@/components/dashboard/stat-card";
import TaskTable from "@/components/tasks/task-table";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { ClipboardList, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const [statusFilter, setStatusFilter] = useState<string>("all_statuses");
  const [priorityFilter, setPriorityFilter] = useState<string>("all_priorities");
  const [dueDateFilter, setDueDateFilter] = useState<string>("all_time");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch tasks
  const { data: tasks = [], isLoading } = useQuery<TaskWithRelations[]>({
    queryKey: ["/api/tasks/user/me"],
  });

  // Filter tasks
  const filteredTasks = tasks
    .filter((task) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return task.title.toLowerCase().includes(query) || 
               (task.description && task.description.toLowerCase().includes(query));
      }
      return true;
    })
    .filter((task) => {
      // Status filter
      if (statusFilter !== "all_statuses") {
        return task.status === statusFilter;
      }
      return true;
    })
    .filter((task) => {
      // Priority filter
      if (priorityFilter !== "all_priorities") {
        return task.priority === priorityFilter;
      }
      return true;
    })
    .filter((task) => {
      // Due date filter
      if (dueDateFilter === "all_time") {
        return true;
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;
      if (!dueDate) return dueDateFilter === "all_time";
      
      // Format dates to compare only the date part
      const dueDateFormatted = new Date(dueDate);
      dueDateFormatted.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
      const weekEnd = new Date(today);
      weekEnd.setDate(today.getDate() + 7);
      
      const monthEnd = new Date(today);
      monthEnd.setMonth(today.getMonth() + 1);
      
      if (dueDateFilter === "today") {
        return dueDateFormatted.getTime() === today.getTime();
      } else if (dueDateFilter === "this_week") {
        return dueDateFormatted >= today && dueDateFormatted < weekEnd;
      } else if (dueDateFilter === "this_month") {
        return dueDateFormatted >= today && dueDateFormatted < monthEnd;
      } else if (dueDateFilter === "overdue") {
        return dueDateFormatted < today && task.status !== "completed";
      }
      
      return true;
    });

  // Calculate stats
  const todoTasks = tasks.filter((task) => task.status === "todo");
  const inProgressTasks = tasks.filter((task) => task.status === "in_progress");
  const completedTasks = tasks.filter((task) => task.status === "completed");
  
  // Calculate overdue tasks
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const overdueTasks = tasks.filter((task) => {
    if (task.status === "completed") return false;
    if (!task.dueDate) return false;
    
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < now;
  });

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // My Tasks - assigned to current user
  const myTasks = tasks.filter((task) => task.assigneeId === (tasks[0]?.assigneeId || 0));

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      
      <div className="flex-1 md:pl-64">
        <Header title="Dashboard" onSearch={handleSearch} />
        
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <StatCard
              title="Total Tasks"
              value={tasks.length}
              icon={<ClipboardList />}
              iconBgColor="bg-primary-100"
              iconColor="text-primary-600"
            />
            <StatCard
              title="Completed"
              value={completedTasks.length}
              icon={<CheckCircle />}
              iconBgColor="bg-green-100"
              iconColor="text-green-500"
              trend={{ value: 14, direction: "up" }}
            />
            <StatCard
              title="In Progress"
              value={inProgressTasks.length}
              icon={<Clock />}
              iconBgColor="bg-yellow-100"
              iconColor="text-yellow-500"
            />
            <StatCard
              title="Overdue"
              value={overdueTasks.length}
              icon={<AlertCircle />}
              iconBgColor="bg-red-100"
              iconColor="text-red-500"
              trend={
                overdueTasks.length > 0
                  ? { value: 5, direction: "up" }
                  : undefined
              }
            />
          </div>

          {/* Filters */}
          <Card className="p-4 shadow rounded-lg mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
              <div className="text-lg font-medium">Task Overview</div>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_statuses">All Statuses</SelectItem>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_priorities">All Priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={dueDateFilter}
                  onValueChange={setDueDateFilter}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_time">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="this_week">This Week</SelectItem>
                    <SelectItem value="this_month">This Month</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Tasks Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <TaskColumn
              title="To Do"
              status="todo"
              tasks={todoTasks}
            />
            <TaskColumn
              title="In Progress"
              status="in_progress"
              tasks={inProgressTasks}
            />
            <TaskColumn
              title="Completed"
              status="completed"
              tasks={completedTasks}
            />
          </div>

          {/* My Tasks Section */}
          <Card className="shadow rounded-lg mb-6">
            <div className="p-4 border-b border-neutral-200">
              <h3 className="text-lg font-medium text-neutral-900">My Tasks</h3>
            </div>
            <TaskTable tasks={myTasks} />
          </Card>
        </main>
      </div>
    </div>
  );
}
