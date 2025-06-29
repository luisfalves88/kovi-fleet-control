
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Send, AtSign, Paperclip } from 'lucide-react';
import { ChatService, mockUsers } from '@/services/chatService';
import { MentionUser } from '@/types/chat';
import { Badge } from '@/components/ui/badge';

interface ChatInputProps {
  taskId: string;
  taskPlate?: string;
  onSendMessage: (text: string, attachment?: string, mentions?: string[]) => void;
  currentUser: {
    id: string;
    name: string;
    role: string;
    company: string;
  };
}

export const ChatInput: React.FC<ChatInputProps> = ({
  taskId,
  taskPlate,
  onSendMessage,
  currentUser
}) => {
  const [message, setMessage] = useState('');
  const [mentions, setMentions] = useState<string[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionableUsers, setMentionableUsers] = useState<MentionUser[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim(), undefined, mentions);
      setMessage('');
      setMentions([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const loadMentionableUsers = async () => {
    try {
      const users = await ChatService.getMentionableUsers(currentUser);
      setMentionableUsers(users);
      setShowMentions(true);
    } catch (error) {
      console.error('Error loading mentionable users:', error);
    }
  };

  const addMention = (user: MentionUser) => {
    const mentionText = `@${user.name}`;
    setMessage(prev => prev + mentionText + ' ');
    setMentions(prev => [...prev, user.id]);
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  const removeMention = (userId: string) => {
    setMentions(prev => prev.filter(id => id !== userId));
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-3">
      {mentions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {mentions.map(mentionId => {
            const user = mockUsers.find(u => u.id === mentionId);
            return user ? (
              <Badge
                key={mentionId}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => removeMention(mentionId)}
              >
                <AtSign className="h-3 w-3 mr-1" />
                {user.name}
                <span className="ml-1 text-xs">×</span>
              </Badge>
            ) : null;
          })}
        </div>
      )}

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="min-h-[60px] max-h-[120px] resize-none pr-20"
            rows={2}
          />
          
          <div className="absolute right-2 top-2 flex gap-1">
            <Popover open={showMentions} onOpenChange={setShowMentions}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={loadMentionableUsers}
                >
                  <AtSign className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium mb-2">Mencionar usuário:</p>
                  {mentionableUsers.map((user) => (
                    <Button
                      key={user.id}
                      variant="ghost"
                      className="w-full justify-start h-auto p-2"
                      onClick={() => addMention(user)}
                    >
                      <div className="text-left">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {user.role} • {user.company}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={!message.trim()}
          className="self-end"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};
