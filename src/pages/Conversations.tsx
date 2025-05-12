
import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChatService } from '@/services/chatService';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { Search, MessageSquare, AtSign } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/types/chat';

// Helper function to get URL parameters
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const Conversations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryParams = useQuery();
  const taskIdParam = queryParams.get('taskId');
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(taskIdParam);
  const [selectedTab, setSelectedTab] = useState<string>(taskIdParam ? "all" : "all");
  const [mentionedMessages, setMentionedMessages] = useState<ChatMessage[]>([]);
  
  // Fetch conversations
  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => ChatService.getConversations(),
  });
  
  // Fetch unread conversations
  const { data: unreadConversations, isLoading: unreadLoading } = useQuery({
    queryKey: ['unread-conversations'],
    queryFn: () => ChatService.getUnreadConversations(),
  });
  
  // Fetch mentioned conversations
  const fetchMentions = useCallback(async () => {
    if (user) {
      try {
        const mentionedConversations = await ChatService.getMentionedConversations(user.id);
        
        // Extract all messages with mentions to the current user
        const mentioned: ChatMessage[] = [];
        mentionedConversations.forEach(conv => {
          conv.messages.forEach(msg => {
            if (msg.mentions?.includes(user.id) && !msg.read) {
              mentioned.push(msg);
            }
          });
        });
        
        setMentionedMessages(mentioned);
      } catch (error) {
        console.error("Error fetching mentions:", error);
      }
    }
  }, [user]);
  
  useEffect(() => {
    fetchMentions();
  }, [fetchMentions]);
  
  // Update URL when conversation changes
  useEffect(() => {
    if (selectedTaskId) {
      const url = new URL(window.location.href);
      url.searchParams.set('taskId', selectedTaskId);
      window.history.replaceState({}, '', url.toString());
    }
  }, [selectedTaskId]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter functionality would happen here
  };
  
  // Filter conversations based on search query
  const filteredConversations = conversations?.filter(conv => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      conv.taskPlate.toLowerCase().includes(query) || 
      conv.messages.some(msg => 
        msg.text.toLowerCase().includes(query) || 
        msg.userName.toLowerCase().includes(query)
      )
    );
  });
  
  // Get the right list of conversations based on selected tab
  const getDisplayedConversations = () => {
    if (selectedTab === "unread" && unreadConversations) {
      return unreadConversations;
    }
    return filteredConversations || [];
  };
  
  return (
    <div className="h-[calc(100vh-80px)] flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Conversas</h1>
        <p className="text-muted-foreground">
          Conversas das tarefas em andamento
        </p>
      </div>
      
      <div className="flex gap-4 h-full mt-6 overflow-hidden">
        {/* Left panel: Conversation list */}
        <Card className="w-80 flex-shrink-0 h-full flex flex-col">
          <CardHeader className="p-4 pb-2">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Buscar conversa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
              <Button type="submit" variant="secondary" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </CardHeader>
          
          <Tabs 
            value={selectedTab} 
            onValueChange={setSelectedTab}
            className="flex-1 flex flex-col"
          >
            <div className="px-4">
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Todas
                </TabsTrigger>
                <TabsTrigger value="mentions" className="flex-1">
                  <AtSign className="h-4 w-4 mr-2" />
                  Menções
                  {mentionedMessages.length > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {mentionedMessages.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="flex-1 overflow-hidden mt-0">
              <ScrollArea className="h-[calc(100vh-248px)]">
                <div className="px-4 space-y-2 pt-2">
                  {conversationsLoading ? (
                    <div className="text-center py-6">
                      Carregando conversas...
                    </div>
                  ) : getDisplayedConversations().length > 0 ? (
                    getDisplayedConversations().map(conv => (
                      <Card 
                        key={conv.id}
                        className={`cursor-pointer hover:bg-accent transition-colors ${
                          selectedTaskId === conv.taskId ? "border-primary" : ""
                        }`}
                        onClick={() => setSelectedTaskId(conv.taskId)}
                      >
                        <CardContent className="p-3">
                          <div className="flex justify-between items-center mb-1">
                            <div className="font-medium">{conv.taskPlate}</div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(conv.lastMessage.timestamp), 'dd/MM HH:mm')}
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-muted-foreground truncate">
                              <span className="font-medium">{conv.lastMessage.userName}: </span>
                              {conv.lastMessage.text}
                            </div>
                            
                            {!conv.lastMessage.read && (
                              <Badge className="ml-2">Novo</Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      {searchQuery 
                        ? "Nenhuma conversa corresponde à sua busca." 
                        : "Nenhuma conversa disponível."}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="mentions" className="flex-1 overflow-hidden mt-0">
              <ScrollArea className="h-[calc(100vh-248px)]">
                <div className="px-4 space-y-2 pt-2">
                  {mentionedMessages.length > 0 ? (
                    mentionedMessages.map(msg => (
                      <Card 
                        key={msg.id}
                        className="cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => setSelectedTaskId(msg.taskId)}
                      >
                        <CardContent className="p-3">
                          <div className="flex justify-between items-center mb-1">
                            <div className="font-medium">{msg.taskPlate}</div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(msg.timestamp), 'dd/MM HH:mm', { locale: ptBR })}
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="text-sm truncate">
                              <span className="font-medium">{msg.userName} </span>
                              <span className="text-blue-600">@mencionou</span> você
                            </div>
                            
                            <Badge className="ml-2">Menção</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      Nenhuma menção não lida.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </Card>
        
        {/* Right panel: Selected conversation */}
        <Card className="flex-1 h-full">
          {selectedTaskId ? (
            <ChatPanel 
              taskId={selectedTaskId} 
              fullScreen={true} 
            />
          ) : (
            <CardContent className="flex h-full items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="mx-auto h-12 w-12 mb-2 opacity-30" />
                <p>Selecione uma conversa para visualizar.</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Conversations;
