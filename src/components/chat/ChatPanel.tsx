import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { ChatService } from '@/services/chatService';
import { ChatMessage as ChatMessageComponent } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, ArrowDownCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Conversation, Message } from '@/types/chat';
import { Badge } from '@/components/ui/badge';
import { TaskService } from '@/services/taskService';
import { getStatusName, getStatusColor } from '@/lib/taskUtils';
import { Skeleton } from '@/components/ui/skeleton';

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
  const [isTyping, setIsTyping] = useState(false);
  const [taskDetails, setTaskDetails] = useState<any>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchConversation = async () => {
    setIsLoading(true);
    try {
      const data = await ChatService.getConversationByTaskId(taskId);
      setConversation(data);

      if (data && user) {
        ChatService.markConversationAsRead(taskId, user.id);
      }

      const task = await TaskService.getTaskById(taskId);
      setTaskDetails(task);
    } catch (error) {
      console.error('Erro ao buscar conversa ou tarefa:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) fetchConversation();
  }, [taskId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  const handleSendMessage = async (text: string, attachment?: string, mentions?: string[]) => {
    if (!user) return;

    setIsTyping(false);
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
        read: false
      });

      fetchConversation();
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  };

  const handleNavigate = () => {
    navigate(fullScreen ? `/tasks/${taskId}` : `/conversations?taskId=${taskId}`);
  };

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (el) {
      const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
      setShowScrollButton(!isNearBottom);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollButton(false);
  };

  const renderMessagesGroupedByDate = (messages: Message[]) => {
    const grouped: { [date: string]: Message[] } = {};

    messages.forEach((msg) => {
      const date = new Date(msg.timestamp).toLocaleDateString();
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(msg);
    });

    return Object.entries(grouped).map(([date, msgs]) => (
      <div key={date} className="space-y-2">
        <div className="text-center text-xs text-muted-foreground mt-2 mb-4">
          {date}
        </div>
        {msgs.map((msg) => (
          <ChatMessageComponent key={msg.id} message={msg} highlightMentions={true} />
        ))}
      </div>
    ));
  };

  return (
    <Card className={`${fullScreen ? "h-full" : "h-[500px]"} flex flex-col overflow-hidden border shadow-sm`}>
      <CardHeader className="pb-2 pt-4 border-b flex-shrink-0 bg-muted/50">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span>Chat</span>
              {(taskPlate || taskDetails?.plate) && (
                <span className="text-sm text-muted-foreground">
                  ({taskPlate || taskDetails?.plate})
                </span>
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
            <CardDescription>Mensagens trocadas sobre essa tarefa</CardDescription>
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

      <div className="flex flex-col flex-1 overflow-hidden relative">
        <CardContent
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 pt-4 pb-2 space-y-2"
        >
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="w-full h-6 rounded" />
              ))}
            </div>
          ) : conversation && conversation.messages.length > 0 ? (
            renderMessagesGroupedByDate(conversation.messages)
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Nenhuma mensagem. Comece a conversa!
            </div>
          )}
          {isTyping && (
            <div className="text-sm text-muted-foreground italic px-2">Digitando...</div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {showScrollButton && (
          <Button
            onClick={scrollToBottom}
            variant="secondary"
            size="icon"
            className="absolute bottom-20 right-4 shadow-md animate-in fade-in"
          >
            <ArrowDownCircle className="h-5 w-5" />
          </Button>
        )}

        {user && (
          <ChatInput
            taskId={taskId}
            taskPlate={taskPlate || taskDetails?.plate}
            onSendMessage={handleSendMessage}
            currentUser={user}
            onTypingStart={() => setIsTyping(true)}
            onTypingStop={() => setIsTyping(false)}
          />
        )}
      </div>
    </Card>
  );
};
