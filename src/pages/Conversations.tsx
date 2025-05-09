
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Send } from "lucide-react";
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';

// Mock conversation data
const mockConversations = [
  {
    id: "conv-1",
    taskId: "task-1",
    taskPlate: "ABC1234",
    lastMessage: {
      id: "msg-1",
      senderId: "1",
      senderName: "Admin Kovi",
      text: "Por favor, verifique a situação do veículo.",
      timestamp: new Date(2024, 4, 7, 14, 35),
      read: false
    },
    messages: [
      {
        id: "msg-0",
        senderId: "3",
        senderName: "Parceiro Exemplo",
        text: "Bom dia, precisamos de mais informações sobre o cliente.",
        timestamp: new Date(2024, 4, 7, 10, 15),
        read: true
      },
      {
        id: "msg-1",
        senderId: "1",
        senderName: "Admin Kovi",
        text: "Por favor, verifique a situação do veículo.",
        timestamp: new Date(2024, 4, 7, 14, 35),
        read: false
      }
    ]
  },
  {
    id: "conv-2",
    taskId: "task-2",
    taskPlate: "DEF5678",
    lastMessage: {
      id: "msg-2",
      senderId: "2",
      senderName: "Membro Kovi",
      text: "Motorista alocado. Favor confirmar.",
      timestamp: new Date(2024, 4, 7, 9, 20),
      read: true
    },
    messages: [
      {
        id: "msg-2",
        senderId: "2",
        senderName: "Membro Kovi",
        text: "Motorista alocado. Favor confirmar.",
        timestamp: new Date(2024, 4, 7, 9, 20),
        read: true
      }
    ]
  },
  {
    id: "conv-3",
    taskId: "task-3",
    taskPlate: "GHI9012",
    lastMessage: {
      id: "msg-3",
      senderId: "3",
      senderName: "Parceiro Exemplo",
      text: "Cliente não está atendendo o telefone.",
      timestamp: new Date(2024, 4, 6, 16, 45),
      read: false
    },
    messages: [
      {
        id: "msg-3",
        senderId: "3",
        senderName: "Parceiro Exemplo",
        text: "Cliente não está atendendo o telefone.",
        timestamp: new Date(2024, 4, 6, 16, 45),
        read: false
      }
    ]
  }
];

const fetchConversations = async () => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockConversations;
};

const Conversations = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
  });

  const activeConversationData = conversations?.find(conv => conv.id === activeConversation);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search implementation would go here
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === "" || !activeConversation) return;
    
    // In a real app, this would send the message to the API
    console.log("Sending message:", newMessage, "to conversation:", activeConversation);
    
    // Clear the input
    setNewMessage("");
  };

  // Filter conversations based on user role
  const filteredConversations = conversations?.filter(conv => {
    // For admin and member Kovi, show all conversations
    if (user?.role === 'admin' || user?.role === 'member') return true;
    
    // For partners, only show conversations assigned to them
    // In a real app, this would check if the partner is assigned to the task
    return user?.role === 'partner';
  });

  // Filter conversations by search query
  const searchedConversations = filteredConversations?.filter(conv => {
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Conversation List */}
        <div className="md:col-span-1 border rounded-lg overflow-hidden">
          <div className="p-4 bg-muted/50 border-b font-medium">
            Conversas
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">Carregando conversas...</div>
            ) : searchedConversations && searchedConversations.length > 0 ? (
              searchedConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 border-b cursor-pointer transition-colors hover:bg-muted/30 ${
                    activeConversation === conversation.id ? "bg-muted/50" : ""
                  } ${!conversation.lastMessage.read ? "font-semibold" : ""}`}
                  onClick={() => setActiveConversation(conversation.id)}
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
                    <span className="font-medium">{conversation.lastMessage.senderName}:</span>{" "}
                    {conversation.lastMessage.text}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                Nenhuma conversa encontrada
              </div>
            )}
          </div>
        </div>

        {/* Chat Panel */}
        <div className="md:col-span-2 border rounded-lg flex flex-col">
          {activeConversationData ? (
            <>
              <div className="p-4 bg-muted/50 border-b">
                <div className="font-medium">{activeConversationData.taskPlate}</div>
                <div className="text-xs text-muted-foreground">
                  Tarefa #{activeConversationData.taskId}
                </div>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto max-h-[50vh]">
                {activeConversationData.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex mb-4 ${
                      message.senderId === user?.id ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div className="flex gap-2 max-w-[80%]">
                      {message.senderId !== user?.id && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        {message.senderId !== user?.id && (
                          <div className="text-xs font-medium">{message.senderName}</div>
                        )}
                        <div
                          className={`p-3 rounded-lg ${
                            message.senderId === user?.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          {message.text}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {format(message.timestamp, "dd/MM/yyyy HH:mm", { locale: pt })}
                        </div>
                      </div>
                      {message.senderId === user?.id && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Digite sua mensagem..."
                    className="resize-none"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button onClick={handleSendMessage} size="icon" className="self-end">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4 text-muted-foreground">
              Selecione uma conversa para iniciar o chat
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Conversations;
