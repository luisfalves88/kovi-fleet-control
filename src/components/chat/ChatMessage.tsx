
import React, { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Heart, Check, AtSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  
  const renderMessageText = () => {
    if (!highlightMentions || !message.mentions?.length) {
      return message.text;
    }
    
    if (message.text.includes('@')) {
      return <span>
        {message.text.split('@').map((part, i) => {
          if (i === 0) return part;
          
          const restParts = part.split(' ');
          const mention = restParts.shift();
          const rest = restParts.join(' ');
          
          return (
            <React.Fragment key={i}>
              <span className="text-blue-600 font-medium bg-blue-50 px-1 rounded">
                @{mention}
              </span>
              {rest && ' ' + rest}
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
    <div className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className="bg-primary/10 text-xs">
          {message.userName.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className={`flex flex-col max-w-[75%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">{message.userName}</span>
          <Badge variant="outline" className="text-xs">
            {message.userCompany}
          </Badge>
          {isMentioned && (
            <Badge variant="default" className="text-xs bg-blue-500">
              <AtSign className="h-3 w-3 mr-1" />
              Mencionado
            </Badge>
          )}
        </div>
        
        <div 
          className={`px-3 py-2 rounded-lg max-w-full ${
            isCurrentUser 
              ? 'bg-primary text-primary-foreground' 
              : isMentioned
                ? 'bg-amber-100 border border-amber-200'
                : 'bg-muted'
          }`}
        >
          <div className="text-sm break-words">
            {renderMessageText()}
          </div>
          
          {message.attachment && (
            <div className="mt-2">
              <img 
                src={message.attachment} 
                alt="Anexo" 
                className="max-w-full rounded-md border" 
                style={{ maxHeight: '200px' }}
              />
            </div>
          )}
          
          <div className="flex justify-between items-center mt-2 gap-2">
            <span className="text-xs opacity-70">
              {format(new Date(message.timestamp), 'dd/MM HH:mm', { locale: pt })}
            </span>
            
            <div className="flex items-center gap-2">
              {message.read && (
                <Check size={12} className="opacity-70" />
              )}
              
              <div className="flex items-center gap-1">
                {likeCount > 0 && (
                  <span className="text-xs opacity-70">{likeCount}</span>
                )}
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
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
    </div>
  );
};
