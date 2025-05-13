
import React, { useState, useEffect, useCallback } from 'react';
import { useQuery as useReactQuery } from '@tanstack/react-query';
import { ChatService } from '@/services/chatService';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { Search, MessageSquare, AtSign, Pin, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage, Conversation } from '@/types/chat';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Helper function to get URL parameters
const useUrlParams = () => {
  return new URLSearchParams(useLocation().search);
};

const Conversations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryParams = useUrlParams();
  const taskIdParam = queryParams.get('taskId');
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(taskIdParam);
  const [selectedTab, setSelectedTab] = useState<string>(taskIdParam ? "all" : "all");
  const [mentionedMessages, setMentionedMessages] = useState<ChatMessage[]>([]);
  const [readFilter, setReadFilter] = useState<"all" | "read" | "unread">("all");
  const [pinnedFilter, setPinnedFilter] = useState(false);
  const [pinnedConversations, setPinnedConversations] = useState<string[]>([]);
  
  // Fetch conversations
  const { data: conversations, isLoading: conversationsLoading } = useReactQuery({
    queryKey: ['conversations'],
    queryFn: () => ChatService.getConversations(),
  });
  
  // Fetch unread conversations
  const { data: unreadConversations, isLoading: unreadLoading } = useReactQuery({
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
  
  // Toggle pinned status of a conversation
  const togglePinConversation = (taskId: string) => {
    setPinnedConversations(prev => {
      if (prev.includes(taskId)) {
        return prev.filter(id => id !== taskId);
      } else {
        return [...prev, taskId];
      }
    });
  };
  
  // Mark conversation as read
  const markAsRead = (taskId: string) => {
    if (user) {
      ChatService.markConversationAsRead(taskId, user.id);
    }
  };
  
  // Sort and filter conversations
  const getSortedAndFilteredConversations = () => {
    if (!conversations) return [];
    
    // First apply text search filter
    let filtered = conversations;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(conv => {
        return (
          conv.taskPlate.toLowerCase().includes(query) || 
          conv.messages.some(msg => 
            msg.text.toLowerCase().includes(query) || 
            msg.userName.toLowerCase().includes(query)
          )
        );
      });
    }
    
    // Then apply read/unread filter
    if (readFilter === "read") {
      filtered = filtered.filter(conv => conv.lastMessage.read);
    } else if (readFilter === "unread") {
      filtered = filtered.filter(conv => !conv.lastMessage.read);
    }
    
    // Then apply pinned filter
    if (pinnedFilter) {
      filtered = filtered.filter(conv => pinnedConversations.includes(conv.taskId));
    }
    
    // Sort by most recent message
    return filtered.sort((a, b) => {
      // Sort pinned conversations first if not filtering by pinned only
      if (!pinnedFilter) {
        const aPinned = pinnedConversations.includes(a.taskId);
        const bPinned = pinnedConversations.includes(b.taskId);
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
      }
      
      // Then sort by timestamp (most recent first)
      return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
    });
  };
  
  // Get the right list of conversations based on selected tab
  const getDisplayedConversations = () => {
    if (selectedTab === "unread" && unreadConversations) {
      return unreadConversations;
    }
    return getSortedAndFilteredConversations();
  };
  
  // Render conversation card
  const renderConversationCard = (conv: Conversation) => {
    const isPinned = pinnedConversations.includes(conv.taskId);
    const isUnread = !conv.lastMessage.read;
    const task = conv.task || { status: "unknown", partnerName: "Desconhecido" };
    
    return (
      <Card 
        key={conv.id}
        className={`cursor-pointer hover:bg-accent transition-colors ${
          selectedTaskId === conv.taskId ? "border-primary" : ""
        } ${isUnread ? "bg-muted/30" : ""}`}
        onClick={() => {
          setSelectedTaskId(conv.taskId);
          // Mark as read when clicked
          if (isUnread) {
            markAsRead(conv.taskId);
          }
        }}
      >
        <CardContent className="p-3 relative">
          <div className="flex justify-between items-center mb-1">
            <div className="font-medium flex items-center gap-1">
              {isPinned && <Pin className="h-3 w-3 text-blue-500" />}
              <span>{conv.taskPlate}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {format(new Date(conv.lastMessage.timestamp), 'dd/MM HH:mm')}
            </div>
          </div>
          
          <div className="flex flex-col gap-1 mb-1">
            <div className="flex flex-wrap gap-1 text-xs">
              <Badge variant="outline" className="px-1 py-0 h-5">
                {task.status}
              </Badge>
              <Badge variant="secondary" className="px-1 py-0 h-5">
                {task.partnerName}
              </Badge>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground truncate">
              <span className="font-medium">{conv.lastMessage.userName}: </span>
              {conv.lastMessage.text}
            </div>
            
            {isUnread && (
              <Badge className="ml-2">Novo</Badge>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-1 top-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              togglePinConversation(conv.taskId);
            }}
            title={isPinned ? "Desafixar conversa" : "Fixar conversa"}
          >
            <Pin className={`h-3 w-3 ${isPinned ? 'fill-blue-500' : ''}`} />
          </Button>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Conversas</h1>
        <p className="text-muted-foreground">
          Conversas das tarefas em andamento
        </p>
      </div>
      
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Left panel: Conversation list */}
        <Card className="w-80 flex-shrink-0 flex flex-col">
          <CardHeader className="p-4 pb-2">
            <div className="flex gap-2 mb-2">
              <form onSubmit={handleSearch} className="flex gap-2 flex-1">
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
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" title="Filtros">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuCheckboxItem
                    checked={readFilter === "all"}
                    onCheckedChange={() => setReadFilter("all")}
                  >
                    Todas
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={readFilter === "read"}
                    onCheckedChange={() => setReadFilter("read")}
                  >
                    Lidas
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={readFilter === "unread"}
                    onCheckedChange={() => setReadFilter("unread")}
                  >
                    Não lidas
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={pinnedFilter}
                    onCheckedChange={() => setPinnedFilter(!pinnedFilter)}
                  >
                    Fixadas
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
            
            <TabsContent value="all" className="flex-1 overflow-hidden mt-0 px-4">
              <ScrollArea className="h-[calc(100vh-205px)] pr-2">
                <div className="space-y-2 pt-2">
                  {conversationsLoading ? (
                    <div className="text-center py-6">
                      Carregando conversas...
                    </div>
                  ) : getDisplayedConversations().length > 0 ? (
                    getDisplayedConversations().map(conv => renderConversationCard(conv))
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
            
            <TabsContent value="mentions" className="flex-1 overflow-hidden mt-0 px-4">
              <ScrollArea className="h-[calc(100vh-205px)] pr-2">
                <div className="space-y-2 pt-2">
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
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedTaskId ? (
            <ChatPanel 
              taskId={selectedTaskId} 
              fullScreen={true} 
            />
          ) : (
            <Card className="flex-1 flex flex-col justify-center items-center">
              <div className="text-center text-muted-foreground p-4">
                <MessageSquare className="mx-auto h-12 w-12 mb-2 opacity-30" />
                <p>Selecione uma conversa para visualizar.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Conversations;
