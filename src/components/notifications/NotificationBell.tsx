
import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

type NotificationType = 
  | 'new_task'
  | 'task_canceled'
  | 'task_completed'
  | 'unlock_request'
  | 'returned_task'
  | 'analysis_task'
  | 'tow_request'
  | 'task_assigned'
  | 'task_reassigned';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  taskId?: string;
  taskPlate?: string;
}

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'new_task',
    title: 'Nova tarefa recebida',
    description: 'Você recebeu uma nova solicitação de recolha para o veículo ABC1234',
    timestamp: new Date(2024, 4, 8, 10, 30),
    read: false,
    taskId: 'task-1',
    taskPlate: 'ABC1234'
  },
  {
    id: 'notif-2',
    type: 'unlock_request',
    title: 'Pedido de desbloqueio',
    description: 'Recebido pedido de desbloqueio para o veículo DEF5678',
    timestamp: new Date(2024, 4, 7, 15, 45),
    read: false,
    taskId: 'task-2',
    taskPlate: 'DEF5678'
  },
  {
    id: 'notif-3',
    type: 'task_canceled',
    title: 'Tarefa cancelada',
    description: 'A tarefa para o veículo GHI9012 foi cancelada',
    timestamp: new Date(2024, 4, 6, 9, 20),
    read: true,
    taskId: 'task-3',
    taskPlate: 'GHI9012'
  },
  {
    id: 'notif-4',
    type: 'task_completed',
    title: 'Tarefa concluída',
    description: 'A tarefa para o veículo JKL3456 foi finalizada com sucesso',
    timestamp: new Date(2024, 4, 5, 16, 10),
    read: true,
    taskId: 'task-4',
    taskPlate: 'JKL3456'
  },
  {
    id: 'notif-5',
    type: 'tow_request',
    title: 'Pedido de guincho',
    description: 'Recebido pedido de guincho para o veículo MNO7890',
    timestamp: new Date(2024, 4, 4, 11, 30),
    read: true,
    taskId: 'task-5',
    taskPlate: 'MNO7890'
  },
  {
    id: 'notif-6',
    type: 'returned_task',
    title: 'Tarefa devolvida',
    description: 'A tarefa para o veículo PQR1234 foi devolvida',
    timestamp: new Date(2024, 4, 3, 14, 15),
    read: false,
    taskId: 'task-6',
    taskPlate: 'PQR1234'
  },
  {
    id: 'notif-7',
    type: 'analysis_task',
    title: 'Tarefa em análise',
    description: 'A tarefa para o veículo STU5678 entrou em fase de análise',
    timestamp: new Date(2024, 4, 2, 9, 45),
    read: false,
    taskId: 'task-7',
    taskPlate: 'STU5678'
  },
  {
    id: 'notif-8',
    type: 'task_assigned',
    title: 'Tarefa alocada',
    description: 'Uma nova tarefa para o veículo VWX9012 foi alocada para você',
    timestamp: new Date(2024, 4, 1, 11, 20),
    read: false,
    taskId: 'task-8',
    taskPlate: 'VWX9012'
  },
  {
    id: 'notif-9',
    type: 'task_reassigned',
    title: 'Tarefa realocada',
    description: 'A tarefa para o veículo YZA3456 foi realocada para outro chofer',
    timestamp: new Date(2024, 3, 30, 16, 45),
    read: true,
    taskId: 'task-9',
    taskPlate: 'YZA3456'
  },
  {
    id: 'notif-10',
    type: 'new_task',
    title: 'Novas tarefas recebidas',
    description: 'Você recebeu 5 novas solicitações de recolha',
    timestamp: new Date(2024, 3, 29, 10, 15),
    read: true
  }
];

export const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Get unread notifications count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Filter notifications based on user role
  const filteredNotifications = notifications.filter(notification => {
    if (!user) return false;
    
    switch (user.role) {
      case 'admin':
      case 'member':
        return ['unlock_request', 'returned_task', 'analysis_task', 'tow_request', 'task_completed'].includes(notification.type);
      case 'partner':
        return ['new_task', 'task_canceled', 'task_completed'].includes(notification.type);
      case 'driver':
        return ['task_assigned', 'task_reassigned', 'task_canceled', 'task_completed'].includes(notification.type);
      default:
        return false;
    }
  });
  
  useEffect(() => {
    // Show toast for new notifications on component mount
    const newNotifications = notifications.filter(n => !n.read).slice(0, 3);
    
    if (newNotifications.length > 0) {
      setTimeout(() => {
        newNotifications.forEach(notification => {
          toast({
            title: notification.title,
            description: notification.description,
            duration: 5000,
          });
        });
      }, 2000);
    }
  }, []);

  // Mark all notifications as read
  const handleMarkAllAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({
        ...notification,
        read: true
      }))
    );
  };

  // Mark a specific notification as read and handle click
  const handleNotificationClick = (notification: Notification) => {
    // Mark the notification as read
    setNotifications(prevNotifications =>
      prevNotifications.map(n =>
        n.id === notification.id
          ? { ...n, read: true }
          : n
      )
    );
    
    // Close the popover
    setOpen(false);
    
    // Navigate to the task if taskId is available
    if (notification.taskId) {
      navigate(`/tasks/${notification.taskId}`);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] min-w-[18px] h-[18px] bg-red-500 text-white">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b flex justify-between items-center">
          <h3 className="font-medium">Notificações</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
              Marcar todas como lidas
            </Button>
          )}
        </div>
        
        <ScrollArea className="max-h-[400px]">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map(notification => (
              <div
                key={notification.id}
                className={`p-3 border-b cursor-pointer hover:bg-muted/20 ${
                  !notification.read ? 'bg-muted/10' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex justify-between">
                  <h4 className={`${!notification.read ? 'font-medium' : ''}`}>
                    {notification.title}
                  </h4>
                  {!notification.read && (
                    <Badge variant="secondary" className="h-2 w-2 p-0 rounded-full bg-blue-500" />
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.description}
                </p>
                
                <p className="text-xs text-muted-foreground mt-2">
                  {format(notification.timestamp, "dd/MM/yyyy HH:mm", { locale: pt })}
                </p>
              </div>
            ))
          ) : (
            <p className="p-4 text-center text-muted-foreground">
              Nenhuma notificação.
            </p>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
