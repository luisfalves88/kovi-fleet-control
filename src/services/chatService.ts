import { ChatMessage, Conversation, MentionUser, UserRole } from '@/types/chat';

// Mock users for mentions
export const mockUsers: MentionUser[] = [
  { id: "u1", name: "Admin Kovi", role: "admin", company: "Kovi" },
  { id: "u2", name: "João Silva", role: "member", company: "Kovi" },
  { id: "u3", name: "Maria Costa", role: "member", company: "Kovi" },
  { id: "u4", name: "Pedro Almeida", role: "partner", company: "Parceiro A" },
  { id: "u5", name: "Ana Santos", role: "partner", company: "Parceiro A" },
  { id: "u6", name: "Carlos Ferreira", role: "partner", company: "Parceiro B" },
  { id: "u7", name: "Roberto Mendes", role: "partner", company: "Parceiro B" },
  { id: "u8", name: "José Motorista", role: "driver", company: "Kovi" },
  { id: "u9", name: "Eduardo Motorista", role: "driver", company: "Kovi" },
  { id: "u10", name: "Marcos Motorista", role: "driver", company: "Kovi" },
];

// Generate mock conversations
const generateMockConversations = (): Conversation[] => {
  // Create sample messages
  const messages: ChatMessage[] = [];
  
  // For each task, create 1-5 messages
  for (let i = 1000; i < 1020; i++) {
    const taskId = `TASK-${i}`;
    const taskPlate = `ABC${i}`;
    
    const messageCount = Math.floor(Math.random() * 5) + 1;
    
    for (let j = 0; j < messageCount; j++) {
      // Select a random user
      const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      
      // Create a message
      const timestamp = new Date(Date.now() - Math.floor(Math.random() * 10 * 24 * 60 * 60 * 1000));
      const message: ChatMessage = {
        id: `msg-${i}-${j}`,
        taskId,
        taskPlate,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        userCompany: user.company,
        text: [
          "Olá! Preciso de informações sobre este veículo.",
          "Por favor, atualize o status desta tarefa.",
          "Confirmo que o veículo foi recolhido.",
          "Encontrei problemas para acessar este endereço.",
          "Cliente não atende ao telefone.",
          "Veículo não está no endereço informado."
        ][Math.floor(Math.random() * 6)],
        timestamp,
        createdAt: timestamp,
        read: Math.random() > 0.3,
        likes: [],
        mentions: [],
        reactions: {}
      };
      
      // Randomly add mentions
      if (Math.random() > 0.7) {
        const mentionUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
        message.mentions = [mentionUser.id];
      }
      
      // Randomly add likes
      if (Math.random() > 0.7) {
        const likeUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
        message.likes = [likeUser.id];
      }
      
      messages.push(message);
    }
  }
  
  // Group messages by taskId to create conversations
  const conversationMap: Record<string, Conversation> = {};
  
  messages.forEach(message => {
    if (!conversationMap[message.taskId]) {
      conversationMap[message.taskId] = {
        id: `conv-${message.taskId}`,
        taskId: message.taskId,
        taskPlate: message.taskPlate || "",
        lastMessage: message,
        messages: []
      };
    }
    
    conversationMap[message.taskId].messages.push(message);
    
    // Update last message if this one is newer
    if (new Date(message.timestamp) > new Date(conversationMap[message.taskId].lastMessage.timestamp)) {
      conversationMap[message.taskId].lastMessage = message;
    }
  });
  
  // Sort messages by timestamp within each conversation
  Object.values(conversationMap).forEach(conversation => {
    conversation.messages.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  });
  
  return Object.values(conversationMap);
};

// Create mock conversations
let mockConversations: Conversation[] = generateMockConversations();

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const ChatService = {
  // Get all conversations
  getConversations: async () => {
    await delay(800);
    return mockConversations;
  },
  
  // Get conversations with unread messages
  getUnreadConversations: async () => {
    await delay(500);
    return mockConversations.filter(conv => 
      conv.messages.some(msg => !msg.read)
    );
  },
  
  // Get conversations where the user is mentioned
  getMentionedConversations: async (userId: string) => {
    await delay(500);
    return mockConversations.filter(conv => 
      conv.messages.some(msg => 
        msg.mentions?.includes(userId) && !msg.read
      )
    );
  },
  
  // Get a specific conversation by taskId
  getConversationByTaskId: async (taskId: string) => {
    await delay(500);
    return mockConversations.find(conv => conv.taskId === taskId) || null;
  },
  
  // Send a new message
  sendMessage: async (messageData: Omit<ChatMessage, "id" | "timestamp" | "likes" | "createdAt" | "reactions">) => {
    await delay(300);
    
    const timestamp = new Date();
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      timestamp,
      createdAt: timestamp,
      likes: [],
      reactions: {},
      ...messageData
    };
    
    // Find the conversation or create a new one
    const conversationIndex = mockConversations.findIndex(c => c.taskId === newMessage.taskId);
    
    if (conversationIndex >= 0) {
      // Add message to existing conversation
      mockConversations[conversationIndex].messages.push(newMessage);
      mockConversations[conversationIndex].lastMessage = newMessage;
    } else {
      // Create a new conversation
      mockConversations.push({
        id: `conv-${newMessage.taskId}`,
        taskId: newMessage.taskId,
        taskPlate: newMessage.taskPlate || "",
        lastMessage: newMessage,
        messages: [newMessage]
      });
    }
    
    return newMessage;
  },
  
  // Mark all messages in a conversation as read
  markConversationAsRead: async (taskId: string, userId: string) => {
    await delay(200);
    
    const conversationIndex = mockConversations.findIndex(c => c.taskId === taskId);
    if (conversationIndex < 0) return false;
    
    mockConversations[conversationIndex].messages = 
      mockConversations[conversationIndex].messages.map(msg => ({
        ...msg,
        read: true
      }));
    
    return true;
  },
  
  // Like or unlike a message
  toggleLikeMessage: async (messageId: string, userId: string) => {
    await delay(200);
    
    let found = false;
    
    mockConversations = mockConversations.map(conv => {
      const updatedMessages = conv.messages.map(msg => {
        if (msg.id === messageId) {
          found = true;
          // Toggle like
          const hasLiked = msg.likes.includes(userId);
          
          return {
            ...msg,
            likes: hasLiked 
              ? msg.likes.filter(id => id !== userId) 
              : [...msg.likes, userId]
          };
        }
        return msg;
      });
      
      return {
        ...conv,
        messages: updatedMessages,
        lastMessage: updatedMessages.slice(-1)[0] || conv.lastMessage
      };
    });
    
    return found;
  },
  
  // React to a message
  reactMessage: async (taskId: string, messageId: string, userId: string, reaction: string) => {
    await delay(200);
    
    let found = false;
    
    mockConversations = mockConversations.map(conv => {
      if (conv.taskId !== taskId) return conv;
      
      const updatedMessages = conv.messages.map(msg => {
        if (msg.id === messageId) {
          found = true;
          const reactions = msg.reactions ? { ...msg.reactions } : {};
          
          if (!reactions[reaction]) {
            reactions[reaction] = [];
          }
          
          // Toggle reaction
          const hasReacted = reactions[reaction].includes(userId);
          
          if (hasReacted) {
            reactions[reaction] = reactions[reaction].filter(id => id !== userId);
          } else {
            reactions[reaction] = [...reactions[reaction], userId];
          }
          
          return {
            ...msg,
            reactions
          };
        }
        return msg;
      });
      
      return {
        ...conv,
        messages: updatedMessages,
        lastMessage: updatedMessages.slice(-1)[0] || conv.lastMessage
      };
    });
    
    return found;
  },
  
  // Get available users for mentions based on the current user's role and company
  getMentionableUsers: async (currentUser: { id: string, role: UserRole, company: string }) => {
    await delay(300);
    
    // Admin and Kovi members can mention anyone
    if (currentUser.role === "admin" || (currentUser.role === "member" && currentUser.company === "Kovi")) {
      return mockUsers;
    }
    
    // Partners can only mention admins, Kovi members, and partners from same company
    if (currentUser.role === "partner") {
      return mockUsers.filter(user => 
        user.role === "admin" || 
        (user.role === "member" && user.company === "Kovi") ||
        (user.role === "partner" && user.company === currentUser.company)
      );
    }
    
    // Drivers can mention admins and Kovi members
    if (currentUser.role === "driver") {
      return mockUsers.filter(user => 
        user.role === "admin" || 
        (user.role === "member" && user.company === "Kovi")
      );
    }
    
    return [];
  }
};
