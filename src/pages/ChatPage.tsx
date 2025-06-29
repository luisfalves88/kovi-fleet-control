
import React from 'react';
import { useParams } from 'react-router-dom';
import { ChatPanel } from '@/components/chat/ChatPanel';

const ChatPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();

  if (!taskId) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500">ID da tarefa não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <ChatPanel taskId={taskId} fullScreen={true} />
    </div>
  );
};

export default ChatPage;
