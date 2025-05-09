
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Calendar, Car, MapPin, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface TaskCardProps {
  task: Task;
}

const getStatusName = (status: string): string => {
  const statusMap: Record<string, string> = {
    allocateDriver: 'Alocar chofer',
    pendingCollection: 'Pendente de recolha',
    returned: 'Devolvida',
    onRouteCollection: 'Em rota recolha',
    unlock: 'Desbloqueio',
    onRouteKovi: 'Em rota Kovi',
    towRequest: 'Solicitação de guincho',
    onRouteTow: 'Em rota guincho',
    underAnalysis: 'Em análise',
    unlawfulAppropriation: 'Apropriação Indébita',
    collected: 'Recolhido',
    canceled: 'Cancelado'
  };
  return statusMap[status] || status;
};

const getStatusColor = (status: string): string => {
  const statusColorMap: Record<string, string> = {
    allocateDriver: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    pendingCollection: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    returned: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    onRouteCollection: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
    unlock: 'bg-pink-100 text-pink-800 hover:bg-pink-200',
    onRouteKovi: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200',
    towRequest: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
    onRouteTow: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
    underAnalysis: 'bg-lime-100 text-lime-800 hover:bg-lime-200',
    unlawfulAppropriation: 'bg-rose-100 text-rose-800 hover:bg-rose-200',
    collected: 'bg-green-100 text-green-800 hover:bg-green-200',
    canceled: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
  };
  return statusColorMap[status] || 'bg-gray-100 text-gray-800';
};

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const navigate = useNavigate();
  
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
            <span className="text-sm truncate max-w-[250px]">{task.currentAddress}</span>
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
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-xs text-gray-500">
              Criado {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true, locale: pt })}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
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
