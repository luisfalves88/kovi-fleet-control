
import React, { useState } from 'react';
import { Task } from '@/types/task';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Car, MapPin, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TaskService } from '@/services/taskService';
import { useToast } from '@/hooks/use-toast';

interface TaskItemProps {
  task: Task;
  onUpdate: () => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onUpdate }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus: string) => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      await TaskService.updateTaskStatus(task.id, newStatus as any);
      toast({
        title: 'Status atualizado',
        description: `Status da tarefa ${task.plate} atualizado para ${newStatus}`,
      });
      onUpdate();
    } catch (error) {
      toast({
        title: 'Erro ao atualizar status',
        description: 'Ocorreu um erro ao atualizar o status da tarefa.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getAvailableStatusTransitions = () => {
    // Define the allowed status transitions based on current status
    const transitions: Record<string, { value: string; label: string }[]> = {
      allocateDriver: [
        { value: 'pendingCollection', label: 'Pendente de recolha' },
        { value: 'canceled', label: 'Cancelar tarefa' }
      ],
      pendingCollection: [
        { value: 'onRouteCollection', label: 'Em rota de recolha' },
        { value: 'returned', label: 'Devolvida' },
        { value: 'allocateDriver', label: 'Voltar para alocação' },
      ],
      onRouteCollection: [
        { value: 'collected', label: 'Recolhido' },
        { value: 'returned', label: 'Devolvida' },
        { value: 'pendingCollection', label: 'Voltar para pendente' },
      ],
      returned: [
        { value: 'allocateDriver', label: 'Alocar novo chofer' },
        { value: 'canceled', label: 'Cancelar tarefa' }
      ],
      collected: [
        { value: 'onRouteKovi', label: 'Em rota para Kovi' },
      ]
    };
    
    return transitions[task.status] || [];
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-sm cursor-pointer hover:text-primary" onClick={() => navigate(`/tasks/${task.id}`)}>
              {task.plate}
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <span className="sr-only">Abrir menu</span>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(`/tasks/${task.id}`)}>
                  Ver detalhes
                </DropdownMenuItem>
                <DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Alterar status</DropdownMenuLabel>
                  {getAvailableStatusTransitions().map((transition) => (
                    <DropdownMenuItem
                      key={transition.value}
                      onClick={() => handleStatusUpdate(transition.value)}
                      disabled={isUpdating}
                    >
                      {transition.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="text-xs text-muted-foreground">{task.vehicleModel}</div>
          
          <div className="flex items-center gap-1">
            <User className="h-3 w-3 text-gray-500" />
            <span className="text-xs truncate max-w-[200px]">{task.customerName}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-gray-500" />
            <span className="text-xs truncate max-w-[200px]">{task.currentAddress.substring(0, 20)}...</span>
          </div>
          
          {task.assignedDriverName && (
            <div className="flex items-center gap-1">
              <Car className="h-3 w-3 text-gray-500" />
              <span className="text-xs truncate max-w-[200px]">{task.assignedDriverName}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-gray-500" />
            <span className="text-xs">
              {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true, locale: pt })}
            </span>
          </div>
          
          <Button 
            variant="outline"
            size="sm"
            className="w-full text-xs h-8"
            onClick={() => navigate(`/tasks/${task.id}`)}
          >
            Detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
