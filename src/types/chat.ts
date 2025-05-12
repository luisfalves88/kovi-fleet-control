
import { User } from './index';

// Define UserRole here to avoid import cycle issues
export type UserRole = 'admin' | 'member' | 'partner' | 'driver';

export interface ChatMessage {
  id: string;
  taskId: string;
  taskPlate?: string; // Vehicle plate for easy reference
  userId: string;
  userName: string;
  userRole: UserRole;
  userCompany: string;
  text: string;
  timestamp: Date;
  read: boolean;
  attachment?: string; // URL for an image attachment
  mentions?: string[]; // List of user IDs mentioned in the message
  likes: string[]; // List of user IDs who liked the message
  replyToMessageId?: string; // ID of the message this is replying to
}

export interface Conversation {
  id: string;
  taskId: string;
  taskPlate: string;
  lastMessage: ChatMessage;
  messages: ChatMessage[];
}

export type MentionUser = {
  id: string;
  name: string;
  role: UserRole;
  company: string;
}
