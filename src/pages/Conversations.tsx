
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowRight, AtSign } from "lucide-react";
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { ChatService } from '@/services/chatService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChatMessage } from '@/types/chat';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { ChatMessage as ChatMessageComponent } from '@/components/chat/ChatMessage';
import { ScrollArea } from '@/components/ui/scroll-area';

const Conversations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "mentions">("all");
  const [mentions, setMentions] = useState<ChatMessage[]>([]);
  
  // Get taskId from URL if present
  const taskIdFromUrl = searchParams.get('taskId');
  const [activeConversation, setActiveConversation] = useState<string | null>(taskIdFromUrl);

  const { data: conversations, isLoading, refetch } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => ChatService.getConversations(),
  });
  
  useEffect(() => {
    // Load mentions when tab changes to mentions
    if (activeTab === "mentions" && user) {
      ChatService.getMentions(user.id).then(data => {
        setMentions(data);
      });
    }
  }, [activeTab, user]);
  
  useEffect(() => {
    // Set active conversation from URL if present
    if (taskIdFromUrl) {
      setActiveConversation(taskIdFromUrl);
    }
  }, [taskIdFromUrl]);

  const activeConversationData = conversations?.find(conv => conv.taskId === activeConversation);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search implementation would go here
  };
  
  const handleConversationClick = (conversationId: string) => {
    setActiveConversation(conversationId);
    
    // Update URL without navigation
    setSearchParams({ taskId: conversationId });
    
    // Mark conversation as read
    if (user) {
      ChatService.markConversationAsRead(conversationId, user.id);
      refetch();
    }
  };
  
  // Handle clicking on a mention
  const handleMentionClick = (message: ChatMessage) => {
    setActiveTab("all");
    setActiveConversation(message.taskId);
    setSearchParams({ taskId: message.taskId });
    
    // Mark as read
    if (user) {
      ChatService.markConversationAsRead(message.taskId, user.id);
      refetch();
    }
  };

  // Filter conversations by search query
  const filteredConversations = conversations?.filter(conv => {
    if (!searchQuery) return true;
    return (
      conv.taskPlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.messages.some(msg => 
        msg.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Conversações</h1>
        <p className="text-muted-foreground">
          Gerenciamento de conversas de tarefas
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-sm">
          <Input
            placeholder="Buscar por placa ou mensagem..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          <Button type="submit" variant="secondary">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "all" | "mentions")}>
        <TabsList>
          <TabsTrigger value="all">Conversas</TabsTrigger>
          <TabsTrigger value="mentions" className="flex items-center gap-1">
            <AtSign className="h-4 w-4" />
            <span>Menções</span>
            {mentions.length > 0 && (
              <Badge className="ml-1 bg-primary h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs">
                {mentions.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Conversation List */}
            <div className="md:col-span-1 border rounded-lg overflow-hidden h-[70vh]">
              <div className="p-4 bg-muted/50 border-b font-medium">
                Conversas
              </div>
              <ScrollArea className="h-[calc(70vh-49px)]">
                {isLoading ? (
                  <div className="p-4 text-center">Carregando conversas...</div>
                ) : filteredConversations && filteredConversations.length > 0 ? (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 border-b cursor-pointer transition-colors hover:bg-muted/30 ${
                        activeConversation === conversation.taskId ? "bg-muted/50" : ""
                      } ${!conversation.lastMessage.read ? "font-semibold" : ""}`}
                      onClick={() => handleConversationClick(conversation.taskId)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{conversation.taskPlate}</span>
                          {!conversation.lastMessage.read && (
                            <Badge className="bg-primary h-2 w-2 p-0 rounded-full" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(conversation.lastMessage.timestamp, "dd/MM HH:mm")}
                        </div>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground truncate">
                        <span className="font-medium">{conversation.lastMessage.userName}:</span>{" "}
                        {conversation.lastMessage.text}
                      </div>
                      
                      <div className="mt-2 flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-6 text-xs px-2 py-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/tasks/${conversation.taskId}`);
                          }}
                        >
                          Ver tarefa
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    Nenhuma conversa encontrada
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Chat Panel */}
            <div className="md:col-span-2 h-[70vh]">
              {activeConversationData ? (
                <ChatPanel 
                  taskId={activeConversationData.taskId} 
                  taskPlate={activeConversationData.taskPlate} 
                  fullScreen={true} 
                />
              ) : (
                <Card className="h-full flex items-center justify-center p-4">
                  <div className="text-center text-muted-foreground">
                    Selecione uma conversa para iniciar o chat
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="mentions" className="mt-4">
          <Card className="p-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Suas menções</h3>
              
              {mentions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Você não tem novas menções
                </div>
              ) : (
                <div className="space-y-4">
                  {mentions.map(message => (
                    <Card key={message.id} className="overflow-hidden">
                      <div className="bg-muted/50 p-3 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {message.taskPlate}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(message.timestamp), "dd/MM/yyyy HH:mm")}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMentionClick(message)}
                        >
                          Ver conversa
                          <ArrowRight className="ml-2 h-3 w-3" />
                        </Button>
                      </div>
                      <CardContent className="p-3">
                        <ChatMessageComponent message={message} showUserInfo={true} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Conversations;
