import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { API_BASE_URL } from '@/lib/api-client';
import { ChatMessage, ChatProductItem } from '@/types/ai-chat';

const STORAGE_KEY = 'ai_chat_messages';

export const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-msg',
  role: 'assistant',
  content:
    'Xin chào! 👋 Tôi là Trợ lý ảo của Modern Shop. Bạn cần tư vấn sản phẩm, tìm kiếm mẫu mã hay giải đáp chính sách mua sắm gì hôm nay?',
  createdAt: new Date().toISOString(),
};

export interface UseAiChatOptions {
  currentProductId?: number;
  initialOpen?: boolean;
}

export function useAiChat(initialProductIdOrOptions?: number | UseAiChatOptions) {
  const options = useMemo<UseAiChatOptions>(() => {
    if (typeof initialProductIdOrOptions === 'number') {
      return { currentProductId: initialProductIdOrOptions };
    }
    return initialProductIdOrOptions || {};
  }, [initialProductIdOrOptions]);

  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(options.initialOpen ?? false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isHydratedRef = useRef(false);
  const messagesRef = useRef<ChatMessage[]>(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Load chat history from sessionStorage on client mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load chat history from sessionStorage:', error);
    } finally {
      isHydratedRef.current = true;
    }
  }, []);

  // Save chat history to sessionStorage whenever messages change
  useEffect(() => {
    if (!isHydratedRef.current || typeof window === 'undefined') return;

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save chat history to sessionStorage:', error);
    }
  }, [messages]);

  // Cleanup active stream on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  }, []);

  const clearMessages = useCallback(() => {
    stopStream();
    setMessages([INITIAL_WELCOME_MESSAGE]);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error('Failed to remove chat history from sessionStorage:', error);
      }
    }
  }, [stopStream]);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const openChat = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const sendMessage = useCallback(
    async (customText?: string, overrideProductId?: number) => {
      const textToSend = (customText !== undefined ? customText : input).trim();
      if (!textToSend || isLoading) return;

      // Reset input text
      setInput('');

      // Abort any ongoing stream
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const userMessageId = `user-${Date.now()}`;
      const userMessage: ChatMessage = {
        id: userMessageId,
        role: 'user',
        content: textToSend,
        createdAt: new Date().toISOString(),
      };

      const assistantMessageId = `assistant-${Date.now() + 1}`;
      const initialAssistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        products: [],
        createdAt: new Date().toISOString(),
      };

      // Append user and initial assistant messages
      setMessages((prev) => [...prev, userMessage, initialAssistantMessage]);
      setIsLoading(true);

      const targetProductId = overrideProductId ?? options.currentProductId;

      // Build message payload history (omit empty content for validation)
      const messageHistory = messagesRef.current
        .filter((msg) => msg.content && msg.content.trim().length > 0)
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      const payload = {
        messages: [...messageHistory, { role: 'user' as const, content: textToSend }],
        currentProductId: targetProductId ? Number(targetProductId) : undefined,
      };

      const baseUrl = API_BASE_URL.replace(/\/+$/, '');
      const endpoint = `${baseUrl}/api/ai/chat`;

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(payload),
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
          throw new Error('ReadableStream not supported or response body is empty');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let currentEventType = 'message';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) {
              currentEventType = 'message';
              continue;
            }

            if (trimmedLine.startsWith('event:')) {
              currentEventType = trimmedLine.slice(6).trim();
            } else if (trimmedLine.startsWith('data:')) {
              const dataStr = trimmedLine.slice(5).trim();
              if (!dataStr) continue;

              try {
                const data = JSON.parse(dataStr);

                if (currentEventType === 'metadata') {
                  if (Array.isArray(data.products)) {
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === assistantMessageId
                          ? { ...msg, products: data.products }
                          : msg
                      )
                    );
                  }
                } else if (currentEventType === 'chunk') {
                  if (typeof data.text === 'string') {
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === assistantMessageId
                          ? { ...msg, content: msg.content + data.text }
                          : msg
                      )
                    );
                  }
                } else if (currentEventType === 'end') {
                  // Stream complete
                } else if (currentEventType === 'error') {
                  const errorMsg =
                    data.message || 'Có lỗi xảy ra, vui lòng thử lại sau.';
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId
                        ? {
                            ...msg,
                            content:
                              msg.content +
                              (msg.content ? '\n\n' : '') +
                              `⚠️ ${errorMsg}`,
                          }
                        : msg
                    )
                  );
                }
              } catch (parseErr) {
                console.error('Error parsing SSE data JSON:', parseErr, dataStr);
              }
            }
          }
        }

        // Flush remaining buffer if any
        if (buffer.trim()) {
          const remainingLines = buffer.split(/\r?\n/);
          for (const line of remainingLines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('event:')) {
              currentEventType = trimmedLine.slice(6).trim();
            } else if (trimmedLine.startsWith('data:')) {
              const dataStr = trimmedLine.slice(5).trim();
              try {
                const data = JSON.parse(dataStr);
                if (currentEventType === 'chunk' && typeof data.text === 'string') {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: msg.content + data.text }
                        : msg
                    )
                  );
                }
              } catch {}
            }
          }
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          // Manually cancelled by user, do not show error message
          return;
        }

        console.error('AI chat streaming failed:', error);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content:
                    msg.content ||
                    'Xin lỗi, hiện tại không thể kết nối đến máy chủ trợ lý AI. Vui lòng thử lại sau ít phút!',
                }
              : msg
          )
        );
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [input, isLoading, options.currentProductId]
  );

  // Latest recommended products from assistant messages
  const recommendedProducts = useMemo<ChatProductItem[]>(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role === 'assistant' && msg.products && msg.products.length > 0) {
        return msg.products;
      }
    }
    return [];
  }, [messages]);

  return {
    messages,
    setMessages,
    input,
    setInput,
    isLoading,
    isOpen,
    setIsOpen,
    toggleOpen,
    openChat,
    closeChat,
    sendMessage,
    stopStream,
    clearMessages,
    recommendedProducts,
  };
}
