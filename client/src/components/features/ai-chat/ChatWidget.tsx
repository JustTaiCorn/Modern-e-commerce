'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Bot, Sparkles, ChevronUp } from 'lucide-react';
import { useAiChat } from '@/hooks/useAiChat';
import { ChatHeader } from './ChatHeader';
import { ChatMessageList } from './ChatMessageList';
import { ChatQuickPrompts } from './ChatQuickPrompts';
import { ChatInput } from './ChatInput';
import { Component as ContactButton } from '@/components/ui/button-rotate';

export const ChatWidget: React.FC = () => {
  const params = useParams();

  // Scroll to top state
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Extract current productId if user is currently on a product detail page
  const currentProductId = useMemo(() => {
    if (!params) return undefined;
    const rawId = params.productId || params.id;
    if (!rawId) return undefined;
    const parsed = typeof rawId === 'string' ? parseInt(rawId, 10) : Number(rawId);
    return !isNaN(parsed) && parsed > 0 ? parsed : undefined;
  }, [params]);

  const {
    messages,
    input,
    setInput,
    isLoading,
    isOpen,
    toggleOpen,
    closeChat,
    sendMessage,
    stopStream,
    clearMessages,
  } = useAiChat(currentProductId);

  return (
    <>
      {/* Floating Action Buttons Stack (ordered in sequence from top to bottom) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3.5">
          {/* 1. Scroll To Top Button (Appears when scrolled down) */}
          {showScrollTop && (
            <button
              type="button"
              onClick={scrollToTop}
              className="flex items-center justify-center w-11 h-11 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 group cursor-pointer"
              aria-label="Cuộn lên đầu trang"
              title="Cuộn lên đầu trang"
            >
              <ChevronUp className="w-5 h-5 transition-transform duration-200 group-hover:-translate-y-0.5" />
            </button>
          )}

          {/* 2. Rotating Contact Button ("LIÊN HỆ NGAY") */}
          <ContactButton />

          {/* 3. AI Chatbot Trigger Button */}
          <button
            type="button"
            onClick={toggleOpen}
            className="relative flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 group cursor-pointer"
            aria-label="Mở trợ lý ảo Modern Shop"
            title="Chat với trợ lý ảo AI"
          >
            {/* Pulse animation ring */}
            <span className="absolute -inset-1 rounded-full bg-primary/35 animate-ping opacity-75 group-hover:opacity-100 pointer-events-none" />

            {/* Bot & Sparkles Icon */}
            <div className="relative flex items-center justify-center pointer-events-none">
              <Bot className="w-7 h-7" />
              <Sparkles className="w-3.5 h-3.5 absolute -top-1 -right-1 text-amber-300 animate-pulse" />
            </div>

            {/* Badge */}
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white shadow-xs border-2 border-background select-none">
              AI
            </span>
          </button>
        </div>
      )}

      {/* Floating Chat Dialog */}
      {isOpen && (
        <div className="w-[380px] h-[580px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)] shadow-2xl rounded-2xl border bg-background flex flex-col overflow-hidden z-50 fixed bottom-6 right-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <ChatHeader onClose={closeChat} onClear={clearMessages} />

          <ChatMessageList messages={messages} isLoading={isLoading} />

          {messages.length <= 1 && (
            <ChatQuickPrompts
              onSelect={(prompt) => sendMessage(prompt)}
              disabled={isLoading}
            />
          )}

          <ChatInput
            input={input}
            setInput={setInput}
            onSend={() => sendMessage()}
            onStop={stopStream}
            isLoading={isLoading}
          />
        </div>
      )}
    </>
  );
};

export default ChatWidget;
