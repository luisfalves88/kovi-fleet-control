
import React, { useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Task, TaskStatus } from '@/types/task';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getStatusName, getStatusColor } from '@/lib/taskUtils';
import { TaskItem } from './TaskItem';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  
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

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    // If there's no destination or the item was dropped back to its original position
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }
    
    // Get the task that was dragged
    const task = tasks.find(t => t.id === draggableId);
    if (!task) return;
    
    // Get the new status from the destination droppableId
    const newStatus = destination.droppableId as TaskStatus;
    
    try {
      // Here you would call your API to update the task status
      // For now, we'll just show a toast and refresh the view
      toast({
        title: "Status atualizado",
        description: `Tarefa ${task.plate} foi movida para ${getStatusName(newStatus)}`,
      });
      
      // Trigger the parent component to refetch tasks
      onTaskUpdate();
    } catch (error) {
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status da tarefa.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="overflow-x-auto pb-4 w-full">
      <DragDropContext onDragEnd={handleDragEnd}>
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
                  <Droppable droppableId={column.id}>
                    {(provided) => (
                      <div 
                        className="space-y-3"
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {tasksByStatus[column.id]?.map((task, index) => (
                          <Draggable
                            key={task.id}
                            draggableId={task.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`transition-all duration-200 ${
                                  snapshot.isDragging ? "opacity-70 scale-105 shadow-lg" : ""
                                }`}
                              >
                                <TaskItem key={task.id} task={task} onUpdate={onTaskUpdate} />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {tasksByStatus[column.id]?.length === 0 && (
                          <div className="text-center p-4 text-sm text-muted-foreground">
                            Sem tarefas neste status
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};
