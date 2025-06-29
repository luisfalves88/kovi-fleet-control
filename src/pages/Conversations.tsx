
import React, { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { ChatService } from "@/services/chatService";
import { useAuth } from "@/contexts/AuthContext";
import { Conversation } from "@/types/chat";
import { ConversationSearch } from "@/components/chat/ConversationSearch";
import { ConversationFilter } from "@/components/chat/ConversationFilter";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { MessageSquare, Clock, AtSign, ArrowLeft } from "lucide-react";

const Conversations = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: ChatService.getConversations,
  });

  const { data: unreadConversations } = useQuery({
    queryKey: ["unread-conversations"],
    queryFn: ChatService.getUnreadConversations,
  });

  const { data: mentionedConversations } = useQuery({
    queryKey: ["mentioned-conversations", user?.id],
    queryFn: () => user ? ChatService.getMentionedConversations(user.id) : Promise.resolve([]),
    enabled: !!user,
  });

  useEffect(() => {
    if (!conversations) return;

    let filtered = [...conversations];

    // Apply text search
    if (searchQuery) {
      filtered = filtered.filter(conv =>
        conv.taskPlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage.userName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filter
    switch (filter) {
      case 'unread':
        filtered = filtered.filter(conv =>
          conv.messages.some(msg => !msg.read)
        );
        break;
      case 'mentions':
        filtered = filtered.filter(conv =>
          user && conv.messages.some(msg =>
            msg.mentions?.includes(user.id) && !msg.read
          )
        );
        break;
      default:
        break;
    }

    // Sort by last message timestamp
    filtered.sort((a, b) =>
      new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()
    );

    setFilteredConversations(filtered);
  }, [conversations, searchQuery, filter, user]);

  const getUnreadCount = (conversation: Conversation) => {
    return conversation.messages.filter(msg => !msg.read).length;
  };

  const hasMentions = (conversation: Conversation) => {
    return user && conversation.messages.some(msg =>
      msg.mentions?.includes(user.id) && !msg.read
    );
  };

  const handleConversationClick = (conversation: Conversation) => {
    setSelectedConversation(conversation.taskId);
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  // Show chat panel when conversation is selected
  if (selectedConversation) {
    const conversation = conversations?.find(c => c.taskId === selectedConversation);
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBackToList}
            title="Voltar para conversas"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              Chat - {conversation?.taskPlate}
            </h1>
            <p className="text-muted-foreground">
              Conversa sobre esta tarefa
            </p>
          </div>
        </div>
        
        <ChatPanel 
          taskId={selectedConversation} 
          taskPlate={conversation?.taskPlate}
          fullScreen={true}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p>Carregando conversas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Conversas</h1>
        <p className="text-muted-foreground">
          Gerencie suas conversas sobre tarefas
        </p>
      </div>

      <ConversationSearch
        onSearch={setSearchQuery}
        placeholder="Buscar por placa, mensagem ou usuário..."
      />

      <ConversationFilter
        onFilterChange={setFilter}
        currentFilter={filter}
        unreadCount={unreadConversations?.length || 0}
        mentionCount={mentionedConversations?.length || 0}
      />

      <div className="space-y-4">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conversation) => (
            <Card 
              key={conversation.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleConversationClick(conversation)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {conversation.taskPlate}
                    {getUnreadCount(conversation) > 0 && (
                      <Badge variant="secondary">
                        {getUnreadCount(conversation)} não lidas
                      </Badge>
                    )}
                    {hasMentions(conversation) && (
                      <Badge variant="default" className="bg-blue-500">
                        <AtSign className="h-3 w-3 mr-1" />
                        Menção
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {format(new Date(conversation.lastMessage.timestamp), "dd/MM HH:mm", { locale: pt })}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {conversation.lastMessage.userName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {conversation.lastMessage.userName}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {conversation.lastMessage.userCompany}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.lastMessage.text}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Nenhuma conversa encontrada</h3>
            <p className="text-muted-foreground">
              {searchQuery || filter !== 'all'
                ? "Tente ajustar os filtros de busca"
                : "As conversas sobre tarefas aparecerão aqui"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Conversations;
