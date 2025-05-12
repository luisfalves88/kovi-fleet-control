
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getStatusColor, getStatusName, getSlaStatus } from '@/lib/taskUtils';
import { Task } from '@/types/task';
import { Link } from 'react-router-dom';
import { Truck, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TaskItemProps {
  task: Task;
  onUpdate?: () => void;
  compact?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onUpdate, compact = false }) => {
  const createdAt = new Date(task.createdAt);
  const slaStatus = getSlaStatus(task.createdAt.toString());
  
  if (compact) {
    return (
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-2">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <Link 
                to={`/tasks/${task.id}`} 
                className="font-semibold text-xs hover:underline truncate"
              >
                {task.plate}
              </Link>
              <Badge variant="outline" className={`${slaStatus.color} text-xs px-1 py-0`}>
                {slaStatus.text}
              </Badge>
            </div>
            
            <div className="text-xs text-muted-foreground truncate">{task.customerName}</div>
            
            <div className="flex items-center justify-between mt-1">
              {task.assignedDriverName ? (
                <div className="flex items-center gap-1 text-xs">
                  <Truck className="h-3 w-3" /> 
                  <span className="truncate">{task.assignedDriverName}</span>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">Sem chofer</div>
              )}
              
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  {formatDistanceToNow(createdAt, { 
                    addSuffix: true,
                    locale: ptBR
                  })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Original non-compact version
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="p-3 pb-2 border-b border-border/40">
        <div className="flex justify-between items-center">
          <Link 
            to={`/tasks/${task.id}`} 
            className="font-medium hover:underline"
          >
            {task.plate}
          </Link>
          <Badge className={getStatusColor(task.status)}>
            {getStatusName(task.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-3 space-y-2">
        <div>
          <div className="text-sm">{task.customerName}</div>
          <div className="text-sm text-muted-foreground">{task.vehicleModel}</div>
        </div>
        
        <div className="flex justify-between items-center pt-1">
          <Badge variant="outline" className={`${slaStatus.color} text-xs`}>
            {slaStatus.text}
          </Badge>
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {formatDistanceToNow(createdAt, { 
                addSuffix: true,
                locale: ptBR
              })}
            </span>
          </div>
        </div>
        
        {task.assignedDriverName && (
          <div className="flex items-center gap-1 text-sm pt-1">
            <Truck className="h-4 w-4" /> 
            <span>{task.assignedDriverName}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
