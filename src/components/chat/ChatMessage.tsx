
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Heart, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ChatService } from '@/services/chatService';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { useAuth } from '@/contexts/AuthContext';

interface ChatMessageProps {
  message: ChatMessageType;
  highlightMentions?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  highlightMentions = false 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(message.likes.includes(user?.id || ''));
  const [likeCount, setLikeCount] = useState(message.likes.length);
  
  const handleLike = async () => {
    if (!user) return;
    
    try {
      await ChatService.toggleLikeMessage(message.id, user.id);
      
      if (isLiked) {
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        setLikeCount(prev => prev + 1);
        if (message.userId !== user.id) {
          toast({
            description: `Você curtiu a mensagem de ${message.userName}`,
          });
        }
      }
      
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error liking message:', error);
    }
  };
  
  // Highlight mentioned users if needed
  const renderMessageText = () => {
    if (!highlightMentions || !message.mentions?.length) {
      return message.text;
    }
    
    // Simple version - just highlight that there are mentions
    const mentionedUsers = message.mentions.map(userId => {
      const mentionedUser = mockUsers.find(u => u.id === userId);
      return mentionedUser ? `@${mentionedUser.name}` : `@usuário`;
    }).join(', ');
    
    if (message.text.includes('@')) {
      return <span>
        {message.text.split('@').map((part, i) => {
          if (i === 0) return part;
          
          const restParts = part.split(' ');
          const mention = restParts.shift();
          const rest = restParts.join(' ');
          
          return (
            <React.Fragment key={i}>
              <span className="text-blue-600 font-medium">@{mention}</span>
              {' ' + rest}
            </React.Fragment>
          );
        })}
      </span>;
    }
    
    return message.text;
  };
  
  const isMentioned = user && message.mentions?.includes(user.id);
  const isCurrentUser = user && message.userId === user.id;
  
  return (
    <div className={`flex gap-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      {!isCurrentUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/10 text-xs">
            {message.userName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`flex flex-col max-w-[75%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        {!isCurrentUser && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{message.userName}</span>
            <span className="text-xs text-muted-foreground">{message.userRole}</span>
          </div>
        )}
        
        <div 
          className={`px-3 py-2 rounded-lg ${
            isCurrentUser 
              ? 'bg-primary text-primary-foreground' 
              : isMentioned
                ? 'bg-amber-100 border border-amber-200'
                : 'bg-muted'
          }`}
        >
          <div className="text-sm">
            {renderMessageText()}
          </div>
          
          {message.attachment && (
            <div className="mt-2">
              <img 
                src={message.attachment} 
                alt="Attachment" 
                className="max-w-full rounded-md" 
                style={{ maxHeight: '200px' }}
              />
            </div>
          )}
          
          <div className="flex justify-between items-center mt-1 gap-2">
            <span className="text-xs opacity-70">
              {format(new Date(message.timestamp), 'HH:mm')}
            </span>
            
            <div className="flex items-center gap-2">
              {message.read && (
                <Check size={12} className="opacity-70" />
              )}
              
              {likeCount > 0 && (
                <span className="text-xs opacity-70">{likeCount}</span>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={handleLike}
              >
                <Heart 
                  size={12}
                  className={isLiked ? 'fill-red-500 text-red-500' : 'opacity-70'}
                />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
