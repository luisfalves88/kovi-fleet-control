
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChatService } from '@/services/chatService';
import { Conversation, ChatMessage } from '@/types/chat';
import { useAuth } from '@/contexts/AuthContext';

export const useChat = (taskId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Get all conversations
  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: ChatService.getConversations,
    refetchInterval: 30000,
  });

  // Get specific conversation
  const { data: conversation, isLoading: conversationLoading } = useQuery({
    queryKey: ["conversation", taskId],
    queryFn: () => taskId ? ChatService.getConversationByTaskId(taskId) : null,
    enabled: !!taskId,
    refetchInterval: 10000,
  });

  // Get unread conversations
  const { data: unreadConversations } = useQuery({
    queryKey: ["unread-conversations"],
    queryFn: ChatService.getUnreadConversations,
    refetchInterval: 30000,
  });

  // Get mentioned conversations
  const { data: mentionedConversations } = useQuery({
    queryKey: ["mentioned-conversations", user?.id],
    queryFn: () => user ? ChatService.getMentionedConversations(user.id) : Promise.resolve([]),
    enabled: !!user,
    refetchInterval: 30000,
  });

  const sendMessage = async (
    taskId: string,
    text: string,
    taskPlate?: string,
    attachment?: string,
    mentions?: string[]
  ) => {
    if (!user) return;

    setIsLoading(true);
    try {
      await ChatService.sendMessage({
        taskId,
        taskPlate: taskPlate || '',
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        userCompany: user.company,
        text,
        attachment,
        mentions,
        read: false,
      });

      // Invalidate and refetch conversations
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["conversation", taskId] });
      queryClient.invalidateQueries({ queryKey: ["unread-conversations"] });
      queryClient.invalidateQueries({ queryKey: ["mentioned-conversations"] });
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (taskId: string) => {
    if (!user) return;

    try {
      await ChatService.markConversationAsRead(taskId, user.id);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["conversation", taskId] });
      queryClient.invalidateQueries({ queryKey: ["unread-conversations"] });
    } catch (error) {
      console.error("Error marking conversation as read:", error);
    }
  };

  const likeMessage = async (messageId: string) => {
    if (!user) return;

    try {
      await ChatService.toggleLikeMessage(messageId, user.id);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      if (taskId) {
        queryClient.invalidateQueries({ queryKey: ["conversation", taskId] });
      }
    } catch (error) {
      console.error("Error liking message:", error);
    }
  };

  const reactToMessage = async (taskId: string, messageId: string, reaction: string) => {
    if (!user) return;

    try {
      await ChatService.reactMessage(taskId, messageId, user.id, reaction);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["conversation", taskId] });
    } catch (error) {
      console.error("Error reacting to message:", error);
    }
  };

  return {
    conversations,
    conversation,
    unreadConversations,
    mentionedConversations,
    isLoading: conversationsLoading || conversationLoading || isLoading,
    sendMessage,
    markAsRead,
    likeMessage,
    reactToMessage,
  };
};
