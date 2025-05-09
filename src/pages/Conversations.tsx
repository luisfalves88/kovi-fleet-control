
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Send, Paperclip } from 'lucide-react';

// Mock data for chat messages
const mockChats = [
  {
    id: '1',
    taskId: '101',
    licensePlate: 'ABC1234',
    lastMessage: {
      userId: '1',
      userName: 'Carlos Silva',
      userRole: 'admin',
      message: 'Precisamos de uma atualização sobre esta recolha',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      isRead: false,
    },
  },
  {
    id: '2',
    taskId: '102',
    licensePlate: 'XYZ5678',
    lastMessage: {
      userId: '3',
      userName: 'João Santos',
      userRole: 'partner',
      message: 'O motorista está a caminho, deve chegar em 30 minutos',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      isRead: true,
    },
  },
  {
    id: '3',
    taskId: '103',
    licensePlate: 'DEF9012',
    lastMessage: {
      userId: '2',
      userName: 'Marina Oliveira',
      userRole: 'member',
      message: 'Cliente informou que o carro não está mais no endereço cadastrado',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      isRead: true,
    },
  },
  {
    id: '4',
    taskId: '104',
    licensePlate: 'GHI3456',
    lastMessage: {
      userId: '1',
      userName: 'Carlos Silva',
      userRole: 'admin',
      message: 'Preciso que confirme se o veículo já foi liberado',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      isRead: true,
    },
  },
];

// Mock messages for the selected chat
const mockMessages = [
  {
    id: 'm1',
    taskId: '101',
    userId: '1',
    userName: 'Carlos Silva',
    userRole: 'admin',
    message: 'Olá, precisamos de uma atualização sobre esta recolha',
    timestamp: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
    isRead: true,
  },
  {
    id: 'm2',
    taskId: '101',
    userId: '3',
    userName: 'João Santos',
    userRole: 'partner',
    message: 'Bom dia! O chofer já foi designado e está a caminho do local',
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    isRead: true,
  },
  {
    id: 'm3',
    taskId: '101',
    userId: '2',
    userName: 'Marina Oliveira',
    userRole: 'member',
    message: 'Excelente! Por favor, mantenha-nos informados quando o veículo for localizado',
    timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
    isRead: true,
  },
  {
    id: 'm4',
    taskId: '101',
    userId: '3',
    userName: 'João Santos',
    userRole: 'partner',
    message: 'O chofer acabou de chegar ao local, mas o veículo não está lá. Está tentando contato com o cliente.',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    isRead: false,
  },
];

const Conversations = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState(mockChats[0]);
  const [newMessage, setNewMessage] = useState('');

  // Filter chats based on search
  const filteredChats = mockChats.filter(chat => 
    chat.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format time for display
  const formatMessageTime = (date: Date) => {
    const today = new Date();
    const isToday = today.toDateString() === date.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      console.log('Sending message:', newMessage);
      // In a real app, this would send the message to an API
      setNewMessage('');
    }
  };

  return (
    <div className="space-y-4 h-[calc(100vh-8rem)] animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Conversações</h2>
        <p className="text-muted-foreground">
          Acompanhe e participe das conversas sobre as tarefas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        {/* Chat List */}
        <div className="md:col-span-1 border rounded-lg overflow-hidden flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conversas..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <ScrollArea className="flex-grow">
            {filteredChats.map(chat => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`p-3 cursor-pointer hover:bg-muted transition-colors ${
                  selectedChat?.id === chat.id ? 'bg-muted' : ''
                } ${!chat.lastMessage.isRead ? 'font-semibold' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-md flex items-center gap-2">
                    <span className="bg-kovi-red text-white text-xs px-2 py-1 rounded">
                      {chat.licensePlate}
                    </span>
                    {!chat.lastMessage.isRead && (
                      <span className="w-2 h-2 bg-kovi-red rounded-full"></span>
                    )}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {formatMessageTime(chat.lastMessage.timestamp)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-kovi-purple text-white">
                      {chat.lastMessage.userName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm truncate text-muted-foreground">
                    <span className="font-medium text-foreground">{chat.lastMessage.userName}: </span>
                    {chat.lastMessage.message}
                  </p>
                </div>
                <Separator className="mt-3" />
              </div>
            ))}
          </ScrollArea>
        </div>
        
        {/* Chat Messages */}
        <div className="md:col-span-2 border rounded-lg overflow-hidden flex flex-col">
          {selectedChat ? (
            <>
              <div className="p-4 border-b flex justify-between items-center">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    <span className="bg-kovi-purple text-white px-2 py-1 rounded">
                      {selectedChat.licensePlate}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      Task #{selectedChat.taskId}
                    </span>
                  </h3>
                </div>
                <Button variant="ghost" size="sm">Ver Tarefa</Button>
              </div>
              
              <ScrollArea className="flex-grow p-4">
                <div className="space-y-4">
                  {mockMessages.map(message => {
                    // Determine if message is from the logged in user (simplified for demo)
                    const isCurrentUser = message.userId === '1'; // Assuming logged in user is admin with ID 1
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            isCurrentUser
                              ? 'bg-kovi-purple text-white rounded-tr-none'
                              : 'bg-muted rounded-tl-none'
                          }`}
                        >
                          {!isCurrentUser && (
                            <div className="flex items-center gap-2 mb-1">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-[10px]">
                                  {message.userName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs font-medium">{message.userName}</span>
                            </div>
                          )}
                          <p className="text-sm">{message.message}</p>
                          <div className={`text-xs mt-1 ${isCurrentUser ? 'text-white/70' : 'text-muted-foreground'}`}>
                            {formatMessageTime(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
              
              <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Button type="button" size="icon" variant="ghost">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-grow"
                  />
                  <Button type="submit" size="sm">
                    <Send className="h-4 w-4 mr-1" /> Enviar
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <p>Selecione uma conversa para visualizar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Conversations;
