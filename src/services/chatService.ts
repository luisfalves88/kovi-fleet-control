
import { ChatMessage, Conversation, User } from "@/types";

// Mock conversation data from existing Conversations page
let mockConversations = [
  {
    id: "conv-1",
    taskId: "task-1",
    taskPlate: "ABC1234",
    lastMessage: {
      id: "msg-1",
      taskId: "task-1",
      userId: "1",
      userName: "Admin Kovi",
      userRole: "admin",
      userCompany: "Kovi",
      text: "Por favor, verifique a situação do veículo.",
      timestamp: new Date(2024, 4, 7, 14, 35),
      read: false,
      likes: [],
      mentions: []
    },
    messages: [
      {
        id: "msg-0",
        taskId: "task-1",
        userId: "3",
        userName: "Parceiro Exemplo",
        userRole: "partner",
        userCompany: "Empresa Parceira",
        text: "Bom dia, precisamos de mais informações sobre o cliente.",
        timestamp: new Date(2024, 4, 7, 10, 15),
        read: true,
        likes: [],
        mentions: []
      },
      {
        id: "msg-1",
        taskId: "task-1",
        userId: "1",
        userName: "Admin Kovi",
        userRole: "admin",
        userCompany: "Kovi",
        text: "Por favor, verifique a situação do veículo.",
        timestamp: new Date(2024, 4, 7, 14, 35),
        read: false,
        likes: [],
        mentions: []
      }
    ]
  },
  {
    id: "conv-2",
    taskId: "task-2",
    taskPlate: "DEF5678",
    lastMessage: {
      id: "msg-2",
      taskId: "task-2",
      userId: "2",
      userName: "Membro Kovi",
      userRole: "member",
      userCompany: "Kovi",
      text: "Motorista alocado. Favor confirmar.",
      timestamp: new Date(2024, 4, 7, 9, 20),
      read: true,
      likes: [],
      mentions: []
    },
    messages: [
      {
        id: "msg-2",
        taskId: "task-2",
        userId: "2",
        userName: "Membro Kovi",
        userRole: "member",
        userCompany: "Kovi",
        text: "Motorista alocado. Favor confirmar.",
        timestamp: new Date(2024, 4, 7, 9, 20),
        read: true,
        likes: [],
        mentions: []
      }
    ]
  },
  {
    id: "conv-3",
    taskId: "task-3",
    taskPlate: "GHI9012",
    lastMessage: {
      id: "msg-3",
      taskId: "task-3", 
      userId: "3",
      userName: "Parceiro Exemplo",
      userRole: "partner",
      userCompany: "Empresa Parceira",
      text: "Cliente não está atendendo o telefone.",
      timestamp: new Date(2024, 4, 6, 16, 45),
      read: false,
      likes: [],
      mentions: []
    },
    messages: [
      {
        id: "msg-3",
        taskId: "task-3",
        userId: "3",
        userName: "Parceiro Exemplo",
        userRole: "partner",
        userCompany: "Empresa Parceira",
        text: "Cliente não está atendendo o telefone.",
        timestamp: new Date(2024, 4, 6, 16, 45),
        read: false,
        likes: [],
        mentions: []
      }
    ]
  }
];

// Mock users for mentions
const mockUsers = [
  { id: "1", name: "Admin Kovi", role: "admin", company: "Kovi" },
  { id: "2", name: "Membro Kovi", role: "member", company: "Kovi" },
  { id: "3", name: "Parceiro Exemplo", role: "partner", company: "Empresa Parceira" },
  { id: "4", name: "Parceiro B", role: "partner", company: "Empresa B" },
  { id: "5", name: "Parceiro C", role: "partner", company: "Empresa Parceira" },
  { id: "6", name: "Motorista Exemplo", role: "driver", company: "Empresa Parceira" },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const ChatService = {
  getConversations: async () => {
    await delay(500);
    return [...mockConversations];
  },

  getConversationByTaskId: async (taskId: string) => {
    await delay(300);
    const conversation = mockConversations.find(conv => conv.taskId === taskId);
    return conversation;
  },

  sendMessage: async (message: Omit<ChatMessage, 'id' | 'timestamp' | 'likes'>) => {
    await delay(300);

    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: new Date(),
      likes: [],
      read: false
    };

    // Find the conversation for this task
    let conversation = mockConversations.find(conv => conv.taskId === message.taskId);

    if (conversation) {
      // Update existing conversation
      conversation.messages.push(newMessage);
      conversation.lastMessage = newMessage;
    } else {
      // Create new conversation
      const taskInfo = message.taskId ? { id: message.taskId, plate: message.taskPlate || "Unknown" } : null;
      
      if (!taskInfo) return null;
      
      conversation = {
        id: `conv-${Date.now()}`,
        taskId: taskInfo.id,
        taskPlate: taskInfo.plate,
        lastMessage: newMessage,
        messages: [newMessage]
      };
      
      mockConversations.push(conversation);
    }

    return newMessage;
  },

  likeMessage: async (messageId: string, userId: string) => {
    await delay(200);
    
    for (const conversation of mockConversations) {
      const message = conversation.messages.find(m => m.id === messageId);
      if (message) {
        // Toggle like
        const likeIndex = message.likes.indexOf(userId);
        if (likeIndex >= 0) {
          message.likes.splice(likeIndex, 1); // Unlike
        } else {
          message.likes.push(userId); // Like
        }
        return message;
      }
    }
    
    return null;
  },

  markConversationAsRead: async (taskId: string, userId: string) => {
    await delay(200);
    
    const conversation = mockConversations.find(conv => conv.taskId === taskId);
    if (!conversation) return false;
    
    conversation.messages.forEach(message => {
      if (message.userId !== userId) {
        message.read = true;
      }
    });
    
    return true;
  },

  getMentionableUsers: async (currentUser: User): Promise<{ id: string, name: string, role: UserRole, company: string }[]> => {
    await delay(200);
    
    // Admin and member can mention anyone
    if (currentUser.role === 'admin' || currentUser.role === 'member') {
      return mockUsers;
    }
    
    // Partners can only mention Kovi staff and partners from same company
    if (currentUser.role === 'partner') {
      return mockUsers.filter(user => 
        user.role === 'admin' || 
        user.role === 'member' || 
        (user.role === 'partner' && user.company === currentUser.company)
      );
    }
    
    // Default case - can only mention Kovi staff
    return mockUsers.filter(user => user.role === 'admin' || user.role === 'member');
  },

  getMentions: async (userId: string) => {
    await delay(300);
    
    const mentions: ChatMessage[] = [];
    
    for (const conversation of mockConversations) {
      for (const message of conversation.messages) {
        if (message.mentions?.includes(userId) && !message.read) {
          mentions.push({
            ...message,
            taskPlate: conversation.taskPlate
          });
        }
      }
    }
    
    return mentions;
  }
};
