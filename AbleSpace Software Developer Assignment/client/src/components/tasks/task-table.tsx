import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  import { Badge } from "@/components/ui/badge";
  import { Button } from "@/components/ui/button";
  import {
    Dialog,
    DialogContent,
    DialogTrigger,
  } from "@/components/ui/dialog";
  import { useState } from "react";
  import { TaskWithRelations } from "@shared/schema";
  import { Avatar, AvatarFallback } from "@/components/ui/avatar";
  import {
    formatDate,
    getPriorityColor,
    getStatusColor,
    formatStatusLabel,
    formatPriorityLabel,
    getDueDateClass,
    cn,
  } from "@/lib/utils";
  import CreateTaskForm from "./create-task-form";
  import { CheckCircle2, Edit, Clock, AlertCircle, CalendarClock } from "lucide-react";
  import { 
    Tooltip, 
    TooltipContent, 
    TooltipProvider, 
    TooltipTrigger 
  } from "@/components/ui/tooltip";
  import { 
    Card,
    CardContent
  } from "@/components/ui/card";
  
  interface TaskTableProps {
    tasks: TaskWithRelations[];
  }
  
  export default function TaskTable({ tasks }: TaskTableProps) {
    const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  
    const handleEditClick = (task: TaskWithRelations) => {
      setSelectedTask(task);
      setIsEditDialogOpen(true);
    };
  
    const getPriorityIcon = (priority: string) => {
      switch(priority) {
        case 'urgent':
          return <AlertCircle className="h-4 w-4 text-red-500 mr-1" />;
        case 'high':
          return <AlertCircle className="h-4 w-4 text-orange-500 mr-1" />;
        default:
          return null;
      }
    };
  
    const getStatusIcon = (status: string) => {
      switch(status) {
        case 'completed':
          return <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />;
        case 'in_progress':
          return <Clock className="h-4 w-4 text-blue-500 mr-1" />;
        case 'in_review':
          return <CalendarClock className="h-4 w-4 text-purple-500 mr-1" />;
        default:
          return null;
      }
    };
  
    return (
      <>
        <div className="overflow-x-auto rounded-md border border-neutral-200">
          <Table>
            <TableHeader className="bg-neutral-50">
              <TableRow>
                <TableHead className="w-[35%] px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Task
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Priority
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Due Date
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Assigned By
                </TableHead>
                <TableHead className="w-[140px] px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white divide-y divide-neutral-100">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <TableRow 
                    key={task.id}
                    className={cn(
                      "group transition-colors hover:bg-neutral-50",
                      task.status === 'completed' && "bg-neutral-50/50"
                    )}
                  >
                    <TableCell className="px-6 py-4">
                      <div className={cn(
                        "text-sm font-medium", 
                        task.status === 'completed' ? "text-neutral-500 line-through decoration-1" : "text-neutral-900"
                      )}>
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="text-xs text-neutral-500 line-clamp-1 max-w-xs mt-1">
                          {task.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "flex items-center gap-1 font-normal",
                          task.status === 'todo' && "bg-neutral-50 text-neutral-700 border-neutral-200",
                          task.status === 'in_progress' && "bg-blue-50 text-blue-700 border-blue-200",
                          task.status === 'in_review' && "bg-purple-50 text-purple-700 border-purple-200",
                          task.status === 'completed' && "bg-green-50 text-green-700 border-green-200"
                        )}
                      >
                        {getStatusIcon(task.status)}
                        {formatStatusLabel(task.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "flex items-center gap-1 font-normal",
                          task.priority === 'low' && "bg-neutral-50 text-neutral-700 border-neutral-200",
                          task.priority === 'medium' && "bg-yellow-50 text-yellow-700 border-yellow-200",
                          task.priority === 'high' && "bg-orange-50 text-orange-700 border-orange-200",
                          task.priority === 'urgent' && "bg-red-50 text-red-700 border-red-200"
                        )}
                      >
                        {getPriorityIcon(task.priority)}
                        {formatPriorityLabel(task.priority)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className={cn(
                        "flex items-center text-sm",
                        getDueDateClass(task.dueDate, task.status)
                      )}>
                        {getDueDateClass(task.dueDate, task.status).includes('text-red-500') ? (
                          <AlertCircle className="h-4 w-4 mr-1 text-red-500" />
                        ) : (
                          <CalendarClock className="h-4 w-4 mr-1 text-neutral-400" />
                        )}
                        <span>
                          {formatDate(task.dueDate)}
                          {getDueDateClass(task.dueDate, task.status).includes('text-red-500') && (
                            <span className="ml-1 text-xs font-medium px-1 py-0.5 rounded-sm bg-red-100 text-red-800">Overdue</span>
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      {task.creator && (
                        <div className="flex items-center">
                          <Avatar className="h-7 w-7 border border-white shadow-sm">
                            <AvatarFallback className="bg-neutral-100 text-neutral-800 text-xs">
                              {task.creator.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-2 text-sm text-neutral-700">
                            {task.creator.name}
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-right">
                      <TooltipProvider>
                        <div className="flex justify-end items-center space-x-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className={cn(
                                  "text-neutral-600 border-neutral-200",
                                  task.status === 'completed' && "opacity-50"
                                )}
                                disabled={task.status === 'completed'}
                                onClick={() => handleEditClick(task)}
                              >
                                <Edit className="h-3.5 w-3.5 mr-1" />
                                <span className="hidden sm:inline">Edit</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit task details</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          {task.status !== 'completed' && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                                  onClick={() => {
                                    const taskToUpdate = { ...task, status: 'completed' as const };
                                    handleEditClick(taskToUpdate);
                                  }}
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                  <span className="hidden sm:inline">Complete</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Mark as completed</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-neutral-500">
                      <CheckCircle2 className="h-10 w-10 text-neutral-300 mb-2" />
                      <p className="text-sm font-medium mb-1">No tasks found</p>
                      <p className="text-xs text-neutral-400">Tasks you create or are assigned to you will appear here</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
  
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            {selectedTask && (
              <CreateTaskForm
                task={selectedTask}
                isEdit={true}
                onSuccess={() => setIsEditDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  }
  