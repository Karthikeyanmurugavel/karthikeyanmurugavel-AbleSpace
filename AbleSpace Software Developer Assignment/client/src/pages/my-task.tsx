import { useQuery } from "@tanstack/react-query";
import { TaskWithRelations } from "@shared/schema";
import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import TaskTable from "@/components/tasks/task-table";
import { Card } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function MyTasks() {
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch tasks
  const { data: allTasks = [] } = useQuery<TaskWithRelations[]>({
    queryKey: ["/api/tasks/user/me"],
  });

  // Split tasks into categories
  const assignedToMe = allTasks.filter((task) => task.assigneeId === (allTasks[0]?.assigneeId || 0));
  const createdByMe = allTasks.filter((task) => task.creatorId === (allTasks[0]?.creatorId || 0));
  
  // Filter for overdue tasks
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const overdueTasks = allTasks.filter((task) => {
    if (task.status === "completed") return false;
    if (!task.dueDate) return false;
    
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < now;
  });

  // Apply search filter
  const filterTasks = (tasks: TaskWithRelations[]) => {
    if (!searchQuery) return tasks;
    
    return tasks.filter((task) => {
      const query = searchQuery.toLowerCase();
      return task.title.toLowerCase().includes(query) || 
             (task.description && task.description.toLowerCase().includes(query));
    });
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      
      <div className="flex-1 md:pl-64">
        <Header title="My Tasks" onSearch={handleSearch} />
        
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <Card className="shadow rounded-lg">
            <Tabs defaultValue="assigned" className="w-full">
              <div className="border-b border-neutral-200">
                <TabsList className="px-4 py-2">
                  <TabsTrigger value="assigned">Assigned to Me</TabsTrigger>
                  <TabsTrigger value="created">Created by Me</TabsTrigger>
                  <TabsTrigger value="overdue">Overdue</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="assigned" className="mt-0">
                <TaskTable tasks={filterTasks(assignedToMe)} />
              </TabsContent>
              
              <TabsContent value="created" className="mt-0">
                <TaskTable tasks={filterTasks(createdByMe)} />
              </TabsContent>
              
              <TabsContent value="overdue" className="mt-0">
                <TaskTable tasks={filterTasks(overdueTasks)} />
              </TabsContent>
            </Tabs>
          </Card>
        </main>
      </div>
    </div>
  );
}
