
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Heart, AtSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { ChatService } from '@/services/chatService';
import { User } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ChatMessageProps {
  message: ChatMessageType;
  showUserInfo?: boolean;
  highlightMentions?: boolean;
  onMentionClick?: (userId: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  showUserInfo = true,
  highlightMentions = false,
  onMentionClick
}) => {
  const { user } = useAuth();
  const [likeCount, setLikeCount] = useState(message.likes.length);
  const [isLiked, setIsLiked] = useState(user ? message.likes.includes(user.id) : false);
  
  const isCurrentUser = user?.id === message.userId;
  
  // Format message text to highlight @ mentions
  const formatMessageWithMentions = (text: string) => {
    if (!highlightMentions) return text;
    
    // Simple regex to find @username patterns
    const parts = text.split(/(@\w+)/g);
    
    return parts.map((part, index) => {
      // Check if this part starts with @ (it's a mention)
      if (part.startsWith('@')) {
        const mentionName = part.substring(1);
        // Handle mention click if onMentionClick is provided
        return (
          <span 
            key={index}
            className="text-primary font-medium cursor-pointer hover:underline"
            onClick={() => {
              const mentionedUser = message.mentions?.find(id => {
                // This is a simplification, in a real app you'd have a more robust way to match usernames to IDs
                // For now we'll just assume the mention text matches part of the user name
                const mockUser = user ? mockUsers.find(u => u.id === id) : null;
                return mockUser && mockUser.name.includes(mentionName);
              });
              
              if (mentionedUser && onMentionClick) {
                onMentionClick(mentionedUser);
              }
            }}
          >
            {part}
          </span>
        );
      }
      
      // Regular text
      return <span key={index}>{part}</span>;
    });
  };
  
  const handleLike = async () => {
    if (!user) return;
    
    // Optimistically update UI
    if (isLiked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
    }
    setIsLiked(!isLiked);
    
    // Call API to update like
    await ChatService.likeMessage(message.id, user.id);
  };
  
  return (
    <div
      className={cn(
        "flex mb-4",
        isCurrentUser ? "justify-end" : "justify-start"
      )}
    >
      <div className={cn(
        "flex gap-2 max-w-[80%]",
        isCurrentUser ? "flex-row-reverse" : ""
      )}>
        {(!isCurrentUser || !showUserInfo) && (
          <Avatar className="h-8 w-8">
            <AvatarFallback>{message.userName.charAt(0)}</AvatarFallback>
          </Avatar>
        )}
        
        <div>
          {(!isCurrentUser && showUserInfo) && (
            <div className="text-xs font-medium">{message.userName}</div>
          )}
          
          <div className={cn(
            "p-3 rounded-lg break-words",
            isCurrentUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          )}>
            {message.attachment && (
              <div className="mb-2">
                <img 
                  src={message.attachment} 
                  alt="Attachment" 
                  className="max-w-full rounded-md" 
                />
              </div>
            )}
            
            <div>{formatMessageWithMentions(message.text)}</div>
          </div>
          
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
            <span>{format(new Date(message.timestamp), 'dd/MM/yyyy HH:mm')}</span>
            
            <div className="flex gap-1 items-center">
              {likeCount > 0 && (
                <span className="text-xs">{likeCount}</span>
              )}
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 p-0" 
                      onClick={handleLike}
                    >
                      <Heart 
                        className={cn(
                          "h-3 w-3", 
                          isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"
                        )} 
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isLiked ? 'Remover curtida' : 'Curtir mensagem'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
        
        {(isCurrentUser && showUserInfo) && (
          <Avatar className="h-8 w-8">
            <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
};
