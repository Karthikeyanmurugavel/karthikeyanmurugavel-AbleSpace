import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TaskCard from "./task-card";
import { TaskWithRelations } from "@shared/schema";
import { getStatusDotColor, formatStatusLabel } from "@/lib/utils";

interface TaskColumnProps {
  title: string;
  status: string;
  tasks: TaskWithRelations[];
}

export default function TaskColumn({ title, status, tasks = [] }: TaskColumnProps) {
  return (
    <Card>
      <div className="p-4 border-b border-neutral-200">
        <h3 className="text-md font-semibold text-neutral-900 flex items-center">
          <span className={`w-2 h-2 ${getStatusDotColor(status)} rounded-full mr-2`}></span>
          {formatStatusLabel(status)}
          <Badge variant="count" className="ml-2">
            {tasks.length}
          </Badge>
        </h3>
      </div>
      <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))
        ) : (
          <div className="text-center py-6 text-neutral-400 text-sm">
            No tasks
          </div>
        )}
      </div>
    </Card>
  );
}
