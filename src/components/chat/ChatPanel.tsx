
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { ChatService } from '@/services/chatService';
import { ChatMessage as ChatMessageComponent } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Conversation } from '@/types/chat';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const fetchConversation = async () => {
    setIsLoading(true);
    try {
      const data = await ChatService.getConversationByTaskId(taskId);
      setConversation(data);
      
      // Mark as read if we have a conversation and logged in user
      if (data && user) {
        ChatService.markConversationAsRead(taskId, user.id);
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
  }, [taskId]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);
  
  const handleSendMessage = async (text: string, attachment?: string, mentions?: string[]) => {
    if (!user) return;
    
    try {
      await ChatService.sendMessage({
        taskId,
        taskPlate,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        userCompany: user.company,
        text,
        attachment,
        mentions,
        read: false
      });
      
      // Refresh conversation
      fetchConversation();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  
  const handleNavigate = () => {
    if (fullScreen) {
      // If we're on conversations page, navigate to task detail
      navigate(`/tasks/${taskId}`);
    } else {
      // If we're on task detail page, navigate to conversations
      navigate(`/conversations?taskId=${taskId}`);
    }
  };
  
  return (
    <Card className={fullScreen ? "h-full" : "h-[500px]"}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span>Chat</span>
              {taskPlate && <span className="text-sm">({taskPlate})</span>}
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
      
      <div className="flex flex-col h-full">
        <CardContent className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <span>Carregando mensagens...</span>
            </div>
          ) : conversation && conversation.messages.length > 0 ? (
            <div className="space-y-4">
              {conversation.messages.map((message) => (
                <ChatMessageComponent 
                  key={message.id} 
                  message={message} 
                  highlightMentions={true}
                />
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
            taskPlate={taskPlate}
            onSendMessage={handleSendMessage}
            currentUser={user}
          />
        )}
      </div>
    </Card>
  );
};
