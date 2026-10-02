import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '@/types/ai-chat';
import { ChatMessageItem } from './ChatMessageItem';

export interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  isLoading = false,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom whenever messages or loading state changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
    >
      {messages.map((message, idx) => {
        const isLatest = idx === messages.length - 1;
        return (
          <ChatMessageItem
            key={message.id || idx}
            message={message}
            isLatest={isLatest}
            isLoading={isLoading}
          />
        );
      })}
      <div ref={bottomRef} className="h-0" />
    </div>
  );
};

export default ChatMessageList;
