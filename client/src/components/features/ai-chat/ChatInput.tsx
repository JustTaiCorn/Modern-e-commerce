import React, { useRef, useEffect } from 'react';
import { SendHorizontal, Square } from 'lucide-react';

export interface ChatInputProps {
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  onStop: () => void;
  isLoading: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSend,
  onStop,
  isLoading,
  placeholder = 'Nhập tin nhắn... (Nhấn Enter để gửi)',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height up to 100px
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        onSend();
      }
    }
  };

  return (
    <div className="p-3 border-t border-border/60 bg-card/80 backdrop-blur">
      <div className="flex items-end gap-2 p-1.5 rounded-2xl border border-border bg-background focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all duration-200">
        <textarea
          ref={textareaRef}
          value={input}
          rows={1}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 max-h-[100px] resize-none bg-transparent px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden leading-relaxed"
        />

        {isLoading ? (
          <button
            type="button"
            onClick={onStop}
            className="p-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 shrink-0 cursor-pointer"
            title="Dừng phản hồi"
            aria-label="Dừng phản hồi"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>
        ) : (
          <button
            type="button"
            disabled={!input.trim()}
            onClick={() => {
              if (input.trim()) onSend();
            }}
            className="p-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:hover:bg-primary transition-all duration-200 shrink-0 cursor-pointer disabled:cursor-not-allowed shadow-2xs"
            title="Gửi tin nhắn"
            aria-label="Gửi tin nhắn"
          >
            <SendHorizontal className="w-4 h-4" />
          </button>
        )}
      </div>
      <p className="text-[10px] text-muted-foreground/60 text-center mt-1.5 select-none">
        Modern AI có thể mắc lỗi. Vui lòng kiểm tra lại thông tin quan trọng.
      </p>
    </div>
  );
};

export default ChatInput;
