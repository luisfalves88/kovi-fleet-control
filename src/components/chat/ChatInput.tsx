
import React, { useState, useRef, useCallback, useEffect } from 'react';
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
  currentUser
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
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    // Load mentionable users based on current user role
    if (currentUser) {
      ChatService.getMentionableUsers(currentUser).then(users => {
        setMentionableUsers(users);
      });
    }
  }, [currentUser]);
  
  useEffect(() => {
    if (!showMentions) return;
    
    // Filter users based on search
    const filtered = mentionableUsers.filter(user => 
      user.name.toLowerCase().includes(mentionSearch.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [mentionSearch, showMentions, mentionableUsers]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === '@') {
      // Get cursor position when @ is pressed
      const cursorPos = e.currentTarget.selectionStart;
      setAtPosition(cursorPos);
      setShowMentions(true);
      setMentionSearch('');
    } else if (showMentions) {
      // If user is in mention selection mode and presses escape
      if (e.key === 'Escape') {
        setShowMentions(false);
      }
      
      // Update search when typing after @
      if (atPosition !== null && e.currentTarget.selectionStart > atPosition) {
        // Calculate the search string (everything after @ until cursor)
        const searchStr = message.substring(atPosition, e.currentTarget.selectionStart);
        setMentionSearch(searchStr);
      }
    }
  };
  
  const insertMention = (user: MentionUser) => {
    if (atPosition === null || !inputRef.current) return;
    
    // Insert @userName at cursor position
    const before = message.substring(0, atPosition);
    const after = message.substring(inputRef.current.selectionStart || atPosition);
    
    const newMessage = `${before}@${user.name} ${after}`;
    setMessage(newMessage);
    setShowMentions(false);
    
    // Add user ID to mentions array
    if (!mentions.includes(user.id)) {
      setMentions([...mentions, user.id]);
    }
    
    // Focus back on textarea and place cursor after the inserted mention
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const newCursorPos = atPosition + user.name.length + 2; // +2 for @ and space
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };
  
  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For demo purposes, we'll just use a placeholder image
    // In a real app, you'd upload to a server and get a URL back
    setAttachment('/placeholder.svg');
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleSendMessage = async () => {
    if (message.trim() === '' && !attachment) return;
    
    try {
      setIsSubmitting(true);
      await onSendMessage(message, attachment, mentions.length > 0 ? mentions : undefined);
      
      // Reset state after sending
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
              className="resize-none pr-8"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
            />
            
            <Popover open={showMentions} onOpenChange={setShowMentions}>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-2 bottom-2 h-6 w-6"
                  onClick={() => setShowMentions(true)}
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
