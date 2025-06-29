
import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChatService } from '@/services/chatService';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { Search, MessageSquare, AtSign, Pin, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChatMessage, Conversation } from '@/types/chat';

// Hook utilitário para obter parâmetros da URL
const useQueryParams = () => new URLSearchParams(useLocation().search);

const Conversations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryParams = useQueryParams();
  const initialTaskId = queryParams.get('taskId');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(initialTaskId);
  const [selectedTab, setSelectedTab] = useState('all');
  const [mentionedMessages, setMentionedMessages] = useState<ChatMessage[]>([]);
  const [readStatusFilter, setReadStatusFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [showOnlyPinned, setShowOnlyPinned] = useState(false);
  const [pinnedTaskIds, setPinnedTaskIds] = useState<string[]>([]);

  const { data: conversations, isLoading: isLoadingConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => ChatService.getConversations(),
  });

  const { data: unreadConversations } = useQuery({
    queryKey: ['unread-conversations'],
    queryFn: () => ChatService.getUnreadConversations(),
  });

  const fetchMentions = useCallback(async () => {
    if (!user) return;

    try {
      const result = await ChatService.getMentionedConversations(user.id);
      const mentions = result.flatMap(conv =>
        conv.messages.filter(msg => msg.mentions?.includes(user.id) && !msg.read)
      );
      setMentionedMessages(mentions);
    } catch (err) {
      console.error('Erro ao buscar menções:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchMentions();
  }, [fetchMentions]);

  useEffect(() => {
    if (selectedTaskId) {
      const url = new URL(window.location.href);
      url.searchParams.set('taskId', selectedTaskId);
      window.history.replaceState({}, '', url.toString());
    }
  }, [selectedTaskId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica de filtragem será aplicada dinamicamente
  };

  const togglePinStatus = (taskId: string) => {
    setPinnedTaskIds(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const markAsRead = (taskId: string) => {
    if (user) ChatService.markConversationAsRead(taskId, user.id);
  };

  const filterAndSortConversations = (): Conversation[] => {
    if (!conversations) return [];

    let filtered = conversations;

    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(conv =>
        conv.taskPlate.toLowerCase().includes(query) ||
        conv.messages.some(
          msg =>
            msg.text.toLowerCase().includes(query) ||
            msg.userName.toLowerCase().includes(query)
        )
      );
    }

    if (readStatusFilter === 'read') {
      filtered = filtered.filter(conv => conv.lastMessage.read);
    } else if (readStatusFilter === 'unread') {
      filtered = filtered.filter(conv => !conv.lastMessage.read);
    }

    if (showOnlyPinned) {
      filtered = filtered.filter(conv => pinnedTaskIds.includes(conv.taskId));
    }

    return filtered.sort((a, b) => {
      if (!showOnlyPinned) {
        const aPinned = pinnedTaskIds.includes(a.taskId);
        const bPinned = pinnedTaskIds.includes(b.taskId);
        if (aPinned !== bPinned) return aPinned ? -1 : 1;
      }

      return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
    });
  };

  const getDisplayedConversations = (): Conversation[] => {
    return selectedTab === 'unread' && unreadConversations
      ? unreadConversations
      : filterAndSortConversations();
  };

  const renderConversationCard = (conv: Conversation) => {
    const isPinned = pinnedTaskIds.includes(conv.taskId);
    const isUnread = !conv.lastMessage.read;
    const task = conv.task ?? { status: 'Indefinido', partnerName: 'Parceiro desconhecido' };

    return (
      <Card
        key={conv.id}
        className={`cursor-pointer hover:bg-accent transition-colors ${
          selectedTaskId === conv.taskId ? 'border-primary' : ''
        } ${isUnread ? 'bg-muted/30' : ''}`}
        onClick={() => {
          setSelectedTaskId(conv.taskId);
          if (isUnread) markAsRead(conv.taskId);
        }}
      >
        <CardContent className="p-3 relative">
          <div className="flex justify-between items-center mb-1">
            <div className="font-medium flex items-center gap-1">
              {isPinned && <Pin className="h-3 w-3 text-blue-500" />}
              <span>{conv.taskPlate}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {format(new Date(conv.lastMessage.timestamp), 'dd/MM HH:mm', { locale: ptBR })}
            </div>
          </div>

          <div className="flex flex-col gap-1 mb-1">
            <div className="flex flex-wrap gap-1 text-xs">
              <Badge variant="outline" className="px-1 py-0 h-5">{task.status}</Badge>
              <Badge variant="secondary" className="px-1 py-0 h-5">{task.partnerName}</Badge>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground truncate">
              <span className="font-medium">{conv.lastMessage.userName}: </span>
              {conv.lastMessage.text}
            </div>
            {isUnread && <Badge className="ml-2">Novo</Badge>}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              togglePinStatus(conv.taskId);
            }}
            title={isPinned ? 'Desafixar conversa' : 'Fixar conversa'}
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
        <p className="text-muted-foreground">Mensagens relacionadas às tarefas em andamento</p>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Painel lateral com lista de conversas */}
        <Card className="w-80 flex-shrink-0 flex flex-col">
          <CardHeader className="p-4 pb-2">
            <div className="flex gap-2 mb-2">
              <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                <Input
                  placeholder="Buscar conversa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
                <Button type="submit" variant="secondary" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </form>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" title="Aplicar filtros">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuCheckboxItem
                    checked={readStatusFilter === 'all'}
                    onCheckedChange={() => setReadStatusFilter('all')}
                  >
                    Todas
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={readStatusFilter === 'read'}
                    onCheckedChange={() => setReadStatusFilter('read')}
                  >
                    Lidas
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={readStatusFilter === 'unread'}
                    onCheckedChange={() => setReadStatusFilter('unread')}
                  >
                    Não lidas
                  </DropdownMenuCheckboxItem>
                  {/* Continue aqui conforme os demais filtros */}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <ScrollArea className="px-2 pb-2">
            {getDisplayedConversations().map(renderConversationCard)}
          </ScrollArea>
        </Card>

        {/* Painel de conversa principal */}
        <div className="flex-1 overflow-hidden">
          {selectedTaskId ? (
            <ChatPanel taskId={selectedTaskId} />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Selecione uma conversa para visualizar as mensagens.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Conversations;
