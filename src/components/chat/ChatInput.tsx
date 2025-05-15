import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Image, AtSign } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatService } from '@/services/chatService';
import { User } from '@/types';
import { MentionUser } from '@/types/chat';

import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';

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
  const [atPosition, setAtPosition] = useState<number | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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
    } else if (e.key === '@') {
      const cursorPos = e.currentTarget.selectionStart;
      setAtPosition(cursorPos);
      setShowMentions(true);
      setMentionSearch('');
    } else if (showMentions) {
      if (e.key === 'Escape') {
        setShowMentions(false);
      }

      if (atPosition !== null && e.currentTarget.selectionStart > atPosition) {
        const searchStr = message.substring(atPosition, e.currentTarget.selectionStart);
        setMentionSearch(searchStr);
      }
    }
  };

  const insertMention = (user: MentionUser) => {
    if (atPosition === null || !inputRef.current) return;

    const before = message.substring(0, atPosition);
    const after = message.substring(inputRef.current.selectionStart || atPosition);

    const newMessage = `${before}@${user.name} ${after}`;
    setMessage(newMessage);
    setShowMentions(false);

    if (!mentions.includes(user.id)) {
      setMentions([...mentions, user.id]);
    }

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const newCursorPos = atPosition + user.name.length + 2;
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Inserir emoji no cursor
  const insertEmojiAtCursor = (emoji: any) => {
    if (!inputRef.current) return;

    const el = inputRef.current;
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;

    const newMessage = message.slice(0, start) + emoji.native + message.slice(end);

    setMessage(newMessage);

    setTimeout(() => {
      el.focus();
      const cursorPos = start + emoji.native.length;
      el.setSelectionRange(cursorPos, cursorPos);
    }, 0);
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Placeholder para demo
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 border-t">
      <div className="space-y-2">
        {attachment && (
          <div className="relative inline-block">
            <img
              src={attachment}
              alt="Attachment preview"
              className="h-20 object-contain rounded-md border"
            />
            <Button
              variant="destructive"
              size="icon"
              className="h-6 w-6 absolute top-1 right-1 rounded-full"
              onClick={() => setAttachment(undefined)}
            >
              &times;
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
            className="self-end"
            onClick={() => fileInputRef.current?.click()}
            title="Anexar imagem"
          >
            <Image className="h-4 w-4" />
          </Button>

          <div className="relative flex-1">
            <Textarea
              ref={inputRef}
              placeholder="Digite sua mensagem..."
              className="resize-none pr-20"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
            />

            {/* Emoji Picker Popover */}
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-8 bottom-2 h-6 w-6"
                  aria-label="Escolher emoji"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  😊
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-72 p-0" align="end">
                <Picker
                  onSelect={insertEmojiAtCursor}
                  title="Escolha um emoji"
                  emoji="point_up"
                  theme="light"
                  style={{ width: '100%' }}
                />
              </PopoverContent>
            </Popover>

            {/* Mention Popover */}
            <Popover open={showMentions} onOpenChange={setShowMentions}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 bottom-2 h-6 w-6"
                  onClick={() => setShowMentions(true)}
                  aria-label="Buscar usuários para mencionar"
                >
                  <AtSign className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="end">
                <div className="p-2">
                  <Input
                    placeholder="Buscar usuário..."
                    value={mentionSearch}
                    onChange={(e) => setMentionSearch(e.target.value)}
                    autoFocus
                  />
                </div>

                <ScrollArea className="h-56">
                  {filteredUsers.length > 0 ? (
                    <div className="py-2">
                      {filteredUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-muted cursor-pointer"
                          onClick={() => insertMention(user)}
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{user.company}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-4 px-2 text-center text-sm text-muted-foreground">
                      Nenhum usuário encontrado
                    </div>
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>

          <Button
            onClick={handleSendMessage}
            size="icon"
            className="self-end"
            disabled={isSubmitting || (message.trim() === '' && !attachment)}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
