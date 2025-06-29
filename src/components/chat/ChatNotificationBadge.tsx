
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { ChatService } from '@/services/chatService';
import { useAuth } from '@/contexts/AuthContext';

export const ChatNotificationBadge: React.FC = () => {
  const { user } = useAuth();

  const { data: unreadConversations } = useQuery({
    queryKey: ["unread-conversations"],
    queryFn: ChatService.getUnreadConversations,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: mentionedConversations } = useQuery({
    queryKey: ["mentioned-conversations", user?.id],
    queryFn: () => user ? ChatService.getMentionedConversations(user.id) : Promise.resolve([]),
    enabled: !!user,
    refetchInterval: 30000,
  });

  const unreadCount = unreadConversations?.length || 0;
  const mentionCount = mentionedConversations?.length || 0;
  const totalNotifications = unreadCount + mentionCount;

  if (totalNotifications === 0) return null;

  return (
    <Badge 
      variant="destructive" 
      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
    >
      {totalNotifications > 99 ? '99+' : totalNotifications}
    </Badge>
  );
};
