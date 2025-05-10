
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Calendar, Car, Clock, MapPin, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { getStatusName, getStatusColor, getSlaStatus } from '@/lib/taskUtils';

interface TaskCardProps {
  task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const navigate = useNavigate();
  
  const slaStatus = getSlaStatus(task.createdAt.toString());
  
  return (
    <Card className="w-full h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">
            {task.plate} - {task.vehicleModel}
          </CardTitle>
          <Badge className={getStatusColor(task.status)}>
            {getStatusName(task.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{task.customerName}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-sm truncate max-w-full" title={task.currentAddress}>
              {task.currentAddress}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Car className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{task.partnerName}</span>
            {task.assignedDriverName && (
              <span className="text-sm text-gray-500">
                • {task.assignedDriverName}
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-xs text-gray-500">
                Criado {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true, locale: pt })}
              </span>
            </div>
            <Badge className={slaStatus.color}>
              <Clock className="h-3 w-3 mr-1" />
              {slaStatus.text}
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button 
          variant="default" 
          className="w-full"
          onClick={() => navigate(`/tasks/${task.id}`)}
        >
          Ver Detalhes
        </Button>
      </CardFooter>
    </Card>
  );
};
