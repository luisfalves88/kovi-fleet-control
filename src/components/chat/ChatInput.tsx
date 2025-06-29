
import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Image, AtSign, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatService } from '@/services/chatService';
import { User } from '@/types';
import { MentionUser } from '@/types/chat';

interface ChatInputProps {
  taskId: string;
  taskPlate?: string;
  onSendMessage: (text: string, attachment?: string, mentions?: string[]) => Promise<void>;
  currentUser: User | null;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  taskId,
  taskPlate,
  onSendMessage,
  currentUser,
}) => {
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionableUsers, setMentionableUsers] = useState<MentionUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<MentionUser[]>([]);
  const [mentions, setMentions] = useState<string[]>([]);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser) {
      ChatService.getMentionableUsers(currentUser).then((users) => {
        setMentionableUsers(users);
      });
    }
  }, [currentUser]);

  useEffect(() => {
    if (!showMentions) return;

    const filtered = mentionableUsers.filter((user) =>
      user.name.toLowerCase().includes(mentionSearch.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [mentionSearch, showMentions, mentionableUsers]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const insertMention = (user: MentionUser) => {
    const newMessage = `${message}@${user.name} `;
    setMessage(newMessage);
    setShowMentions(false);

    if (!mentions.includes(user.id)) {
      setMentions([...mentions, user.id]);
    }

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simular upload de arquivo
    setAttachment('/placeholder.svg');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async () => {
    if (message.trim() === '' && !attachment) return;

    try {
      setIsSubmitting(true);
      await onSendMessage(message, attachment, mentions.length > 0 ? mentions : undefined);

      setMessage('');
      setAttachment(undefined);
      setMentions([]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-3">
      {attachment && (
        <div className="relative inline-block">
          <img
            src={attachment}
            alt="Visualização do anexo"
            className="h-20 object-contain rounded-md border"
          />
          <Button
            variant="destructive"
            size="icon"
            className="h-6 w-6 absolute -top-2 -right-2 rounded-full"
            onClick={() => setAttachment(undefined)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAttachmentChange}
          accept="image/*"
          className="hidden"
        />

        <Button
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          title="Anexar imagem"
        >
          <Image className="h-4 w-4" />
        </Button>

        <div className="relative flex-1">
          <Textarea
            ref={inputRef}
            placeholder="Digite sua mensagem... (use @ para mencionar usuários)"
            className="resize-none min-h-[60px]"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
          />

          <Popover open={showMentions} onOpenChange={setShowMentions}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 bottom-2 h-8 w-8"
                onClick={() => setShowMentions(true)}
                title="Mencionar usuário"
              >
                <AtSign className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-3 border-b">
                <Input
                  placeholder="Buscar usuário..."
                  value={mentionSearch}
                  onChange={(e) => setMentionSearch(e.target.value)}
                  autoFocus
                />
              </div>

              <ScrollArea className="h-64">
                {filteredUsers.length > 0 ? (
                  <div className="p-2">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-muted cursor-pointer rounded-md"
                        onClick={() => insertMention(user)}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {user.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {user.role} - {user.company}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 px-4 text-center text-sm text-muted-foreground">
                    {mentionSearch ? 'Nenhum usuário encontrado' : 'Digite para buscar usuários'}
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>

        <Button
          onClick={handleSendMessage}
          disabled={isSubmitting || (message.trim() === '' && !attachment)}
          className="self-end"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
