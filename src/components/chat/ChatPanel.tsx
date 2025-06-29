import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { ChatService } from '@/services/chatService';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Conversation, ChatMessage as ChatMessageType } from '@/types/chat';
import { Badge } from '@/components/ui/badge';
import { TaskService } from '@/services/taskService';
import { getStatusName, getStatusColor } from '@/lib/taskUtils';

interface ChatPanelProps {
  taskId: string;
  taskPlate?: string;
  fullScreen?: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ taskId, taskPlate, fullScreen = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [taskDetails, setTaskDetails] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversation = async () => {
    setIsLoading(true);
    try {
      const data = await ChatService.getConversationByTaskId(taskId);
      setConversation(data);

      if (data && user) {
        ChatService.markConversationAsRead(taskId, user.id);
      }

      try {
        const task = await TaskService.getTaskById(taskId);
        setTaskDetails(task);
      } catch (err) {
        console.error("Error fetching task details:", err);
      }
    } catch (error) {
      console.error("Error fetching chat conversation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) {
      fetchConversation();
    }
  }, [taskId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  const handleSendMessage = async (text: string, attachment?: string, mentions?: string[]) => {
    if (!user) return;

    try {
      await ChatService.sendMessage({
        taskId,
        taskPlate: taskPlate || taskDetails?.plate,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        userCompany: user.company,
        text,
        attachment,
        mentions,
        read: false,
      });

      fetchConversation();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleNavigateBack = () => {
    navigate('/conversations');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p>Carregando conversa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!fullScreen && (
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleNavigateBack}
            title="Voltar para conversas"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Chat - {taskPlate || taskDetails?.plate}
              {taskDetails && (
                <div className="flex gap-2">
                  <Badge className={getStatusColor(taskDetails.status)}>
                    {getStatusName(taskDetails.status)}
                  </Badge>
                  <Badge variant="outline">
                    {taskDetails.partnerName || "Sem parceiro"}
                  </Badge>
                </div>
              )}
            </h1>
            <p className="text-muted-foreground">
              Conversas sobre esta tarefa
            </p>
          </div>
        </div>
      )}

      <Card className={`${fullScreen ? 'h-[calc(100vh-8rem)]' : 'h-[600px]'} flex flex-col`}>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {conversation && conversation.messages.length > 0 ? (
            <>
              {conversation.messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  highlightMentions={true}
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Nenhuma mensagem ainda. Inicie uma conversa!
                </p>
              </div>
            </div>
          )}
        </CardContent>

        {user && (
          <div className="border-t">
            <ChatInput
              taskId={taskId}
              taskPlate={taskPlate || taskDetails?.plate}
              onSendMessage={handleSendMessage}
              currentUser={user}
            />
          </div>
        )}
      </Card>
    </div>
  );
};
