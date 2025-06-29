import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { ChatService } from '@/services/chatService';
import { ChatInput } from './ChatInput';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, ThumbsUp, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Conversation, ChatMessage } from '@/types/chat';
import { Badge } from '@/components/ui/badge';
import { TaskService } from '@/services/taskService';
import { getStatusName, getStatusColor } from '@/lib/taskUtils';

// Avatar personalizado
const Avatar = ({ user }: { user: { name: string; avatarUrl?: string } }) => {
  if (user.avatarUrl) {
    return <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />;
  }
  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
      {initials}
    </div>
  );
};

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

  // WebSocket ref
  const ws = useRef<WebSocket | null>(null);

  // Fetch conversation + task details
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

      // Mock WebSocket simulation
      // ws.current = new WebSocket(`wss://your-websocket-server.com/chat/${taskId}`);

      return () => {
        ws.current?.close();
      };
    }
  }, [taskId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  // Enviar mensagem
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

      // Refetch conversation to update UI
      fetchConversation();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Reagir a uma mensagem
  const handleReact = async (messageId: string, reaction: string) => {
    try {
      await ChatService.reactMessage(taskId, messageId, user!.id, reaction);

      // Atualiza localmente (melhora UX)
      setConversation((prev) => {
        if (!prev) return prev;
        const messages = prev.messages.map(m => {
          if (m.id === messageId) {
            const newReactions = {...m.reactions};
            if (newReactions[reaction]?.includes(user!.id)) {
              // Se já tem, remove reação
              newReactions[reaction] = newReactions[reaction].filter(uid => uid !== user!.id);
            } else {
              // Adiciona reação
              newReactions[reaction] = newReactions[reaction] ? [...newReactions[reaction], user!.id] : [user!.id];
            }
            return {...m, reactions: newReactions};
          }
          return m;
        });
        return {...prev, messages};
      });
    } catch (error) {
      console.error("Error reacting to message:", error);
    }
  };

  const handleNavigate = () => {
    if (fullScreen) {
      navigate(`/tasks/${taskId}`);
    } else {
      navigate(`/conversations?taskId=${taskId}`);
    }
  };

  return (
    <Card className={`${fullScreen ? "h-full" : "h-[500px]"} flex flex-col overflow-hidden border`}>
      <CardHeader className="pb-2 pt-4 border-b flex-shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span>Chat</span>
              {(taskPlate || taskDetails?.plate) && (
                <span className="text-sm">({taskPlate || taskDetails?.plate})</span>
              )}
              {taskDetails && (
                <div className="flex ml-2 gap-2">
                  <Badge className={getStatusColor(taskDetails.status)}>
                    {getStatusName(taskDetails.status)}
                  </Badge>
                  <Badge variant="outline">
                    {taskDetails.partnerName || "Sem parceiro"}
                  </Badge>
                </div>
              )}
            </CardTitle>
            <CardDescription>Conversas da tarefa</CardDescription>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNavigate}
            title={fullScreen ? "Ver detalhes da tarefa" : "Ver na página de conversas"}
          >
            {fullScreen ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      <div className="flex flex-col flex-1 overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <span>Carregando mensagens...</span>
            </div>
          ) : conversation && conversation.messages.length > 0 ? (
            <div className="space-y-4">
              {conversation.messages.map((message) => (
                <div key={message.id} className="flex gap-3">
                  <Avatar user={{ name: message.userName, avatarUrl: message.userAvatarUrl }} />
                  <div className="flex flex-col flex-1">
                    <div className="flex justify-between items-center">
                      <strong>{message.userName}</strong>
                      <small className="text-xs text-gray-500">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </small>
                    </div>
                    <p>{message.text}</p>

                    {/* Reações */}
                    <div className="flex gap-2 mt-1 text-sm text-gray-600">
                      {['👍', '❤️'].map((emoji) => {
                        const reacted = message.reactions?.[emoji]?.includes(user?.id ?? '') ?? false;
                        return (
                          <button
                            key={emoji}
                            className={`px-1 rounded ${reacted ? 'bg-blue-100' : 'hover:bg-gray-200'}`}
                            onClick={() => handleReact(message.id, emoji)}
                            title={reacted ? 'Remover reação' : 'Adicionar reação'}
                            type="button"
                          >
                            {emoji} {message.reactions?.[emoji]?.length || 0}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-muted-foreground">
                Sem mensagens. Inicie uma conversa!
              </span>
            </div>
          )}
        </CardContent>

        {user && (
          <ChatInput
            taskId={taskId}
            taskPlate={taskPlate || taskDetails?.plate}
            onSendMessage={handleSendMessage}
            currentUser={user}
          />
        )}
      </div>
    </Card>
  );
};
