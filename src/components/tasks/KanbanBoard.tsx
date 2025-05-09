
import React, { useMemo } from 'react';
import { Task, TaskStatus } from '@/types/task';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getStatusName, getStatusColor } from '@/lib/taskUtils';
import { TaskItem } from './TaskItem';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskUpdate: () => void;
}

// Define the columns to display in the kanban board
const kanbanColumns: { id: TaskStatus; title: string }[] = [
  { id: "allocateDriver", title: "Alocar chofer" },
  { id: "pendingCollection", title: "Pendente de recolha" },
  { id: "onRouteCollection", title: "Em rota recolha" },
  { id: "returned", title: "Devolvida" },
  { id: "collected", title: "Recolhido" }
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onTaskUpdate }) => {
  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    
    // Initialize empty arrays for each status
    kanbanColumns.forEach(column => {
      grouped[column.id] = [];
    });
    
    // Group tasks by their status
    tasks.forEach(task => {
      // Only add to group if it's one of our kanban columns
      if (kanbanColumns.some(col => col.id === task.status)) {
        grouped[task.status].push(task);
      }
    });
    
    return grouped;
  }, [tasks]);

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {kanbanColumns.map((column) => (
          <div key={column.id} className="w-80 flex-shrink-0">
            <Card className="h-full">
              <CardHeader className="pb-2 pt-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-medium">
                    {column.title}
                  </CardTitle>
                  <Badge
                    className={`${getStatusColor(column.id)} px-2 py-1`}
                  >
                    {tasksByStatus[column.id]?.length || 0}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="overflow-y-auto max-h-[calc(100vh-250px)]">
                <div className="space-y-3">
                  {tasksByStatus[column.id]?.map((task) => (
                    <TaskItem key={task.id} task={task} onUpdate={onTaskUpdate} />
                  ))}
                  {tasksByStatus[column.id]?.length === 0 && (
                    <div className="text-center p-4 text-sm text-muted-foreground">
                      Sem tarefas neste status
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};
