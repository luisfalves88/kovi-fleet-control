
import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ScheduleInfoProps {
  scheduledAt?: Date;
  createdAt: Date;
}

export const ScheduleInfo: React.FC<ScheduleInfoProps> = ({ scheduledAt, createdAt }) => {
  const getScheduleStatus = () => {
    if (!scheduledAt) return { status: 'no-schedule', label: 'Não agendado', color: 'bg-gray-200 text-gray-800' };
    
    const now = new Date();
    const scheduled = new Date(scheduledAt);
    const diffHours = (scheduled.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 0) {
      return { status: 'overdue', label: 'Atrasado', color: 'bg-red-200 text-red-800' };
    } else if (diffHours < 2) {
      return { status: 'urgent', label: 'Urgente', color: 'bg-orange-200 text-orange-800' };
    } else if (diffHours < 24) {
      return { status: 'today', label: 'Hoje', color: 'bg-blue-200 text-blue-800' };
    } else {
      return { status: 'scheduled', label: 'Agendado', color: 'bg-green-200 text-green-800' };
    }
  };

  const scheduleStatus = getScheduleStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Informações de Agendamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Status do Agendamento:</span>
          <Badge className={scheduleStatus.color}>
            {scheduleStatus.label}
          </Badge>
        </div>
        
        {scheduledAt && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm">
              <strong>Agendado para:</strong> {format(new Date(scheduledAt), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: pt })}
            </span>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm">
            <strong>Criado em:</strong> {format(new Date(createdAt), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: pt })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
