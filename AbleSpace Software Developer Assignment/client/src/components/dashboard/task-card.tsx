import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TaskWithRelations } from "@shared/schema";
import { 
  formatDate, 
  formatPriorityLabel, 
  getPriorityColor,
  isTaskOverdue,
} from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import CreateTaskForm from "@/components/tasks/create-task-form";

interface TaskCardProps {
  task: TaskWithRelations;
}

export default function TaskCard({ task }: TaskCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const isOverdue = isTaskOverdue(task.dueDate, task.status);
  const isCompleted = task.status === 'completed';

  return (
    <>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogTrigger asChild>
          <Card 
            className={`task-card hover:shadow p-4 cursor-pointer ${isCompleted ? 'opacity-80' : ''} 
              ${task.status === 'in_progress' ? 'border-primary-200' : 'border-neutral-200'}`}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className={`text-sm font-medium text-neutral-900 line-clamp-1 ${isCompleted ? 'line-through' : ''}`}>
                {task.title}
              </h4>
              <Badge variant={task.priority as any}>
                {formatPriorityLabel(task.priority)}
              </Badge>
            </div>
            <p className="text-xs text-neutral-500 mb-3 line-clamp-2">
              {task.description}
            </p>
            <div className="flex justify-between items-center text-xs text-neutral-500">
              <div className="flex items-center">
                <CalendarIcon className="h-3 w-3 mr-1" />
                <span className={isOverdue ? 'text-destructive font-medium' : ''}>
                  {formatDate(task.dueDate)}
                  {isOverdue ? ' (Overdue)' : ''}
                </span>
              </div>
              <div className="flex items-center">
                {task.assignee ? (
                  <Avatar className="h-6 w-6">
                    <AvatarFallback name={task.assignee.name} />
                  </Avatar>
                ) : (
                  <div className="text-xs text-neutral-400">Unassigned</div>
                )}
              </div>
            </div>
          </Card>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <CreateTaskForm 
            task={task} 
            isEdit={true} 
            onSuccess={() => setIsEditDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
