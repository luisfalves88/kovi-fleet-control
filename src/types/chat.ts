
import { User } from './index';
import { Task } from './task';

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
  userAvatarUrl?: string; // Added avatar URL
  text: string;
  timestamp: Date;
  createdAt: Date; // Added createdAt
  read: boolean;
  attachment?: string; // URL for an image attachment
  mentions?: string[]; // List of user IDs mentioned in the message
  likes: string[]; // List of user IDs who liked the message
  reactions?: Record<string, string[]>; // Added reactions object
  replyToMessageId?: string; // ID of the message this is replying to
}

export interface Conversation {
  id: string;
  taskId: string;
  taskPlate: string;
  lastMessage: ChatMessage;
  messages: ChatMessage[];
  task?: Task; // Associated task details
}

export type MentionUser = {
  id: string;
  name: string;
  role: UserRole;
  company: string;
}
