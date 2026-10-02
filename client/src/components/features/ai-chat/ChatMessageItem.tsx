import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles } from 'lucide-react';
import { ChatMessage } from '@/types/ai-chat';
import { ChatProductCard } from './ChatProductCard';
import { cn } from '@/lib/utils';

export interface ChatMessageItemProps {
  message: ChatMessage;
  isLatest?: boolean;
  isLoading?: boolean;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  isLatest = false,
  isLoading = false,
}) => {
  const isUser = message.role === 'user';
  const showTypingIndicator = !isUser && isLoading && isLatest && !message.content.trim();
  const showStreamingCursor = !isUser && isLoading && isLatest && message.content.trim().length > 0;

  const formattedTime = (() => {
    try {
      if (!message.createdAt) return '';
      const date = new Date(message.createdAt);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  })();

  if (isUser) {
    return (
      <div className="flex flex-col items-end gap-1 group">
        <div className="max-w-[85%] rounded-2xl rounded-br-xs px-3.5 py-2.5 bg-primary text-primary-foreground text-sm shadow-xs break-words">
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        </div>
        {formattedTime && (
          <span className="text-[10px] text-muted-foreground/70 px-1 select-none">
            {formattedTime}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 group">
      {/* Bot Avatar */}
      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 border border-primary/20 shadow-2xs">
        <Sparkles className="w-3.5 h-3.5" />
      </div>

      <div className="flex-1 max-w-[88%] space-y-2">
        <div className="rounded-2xl rounded-tl-xs px-3.5 py-2.5 bg-muted/60 text-foreground border border-border/50 text-sm shadow-xs break-words">
          {showTypingIndicator ? (
            <div className="flex items-center gap-1.5 py-1 text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 rounded-full bg-primary/70 animate-bounce" />
            </div>
          ) : (
            <div className="text-sm">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => (
                    <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-foreground">{children}</strong>
                  ),
                  em: ({ children }) => <em className="italic">{children}</em>,
                  ul: ({ children }) => (
                    <ul className="list-disc pl-4 my-2 space-y-1">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-4 my-2 space-y-1">{children}</ol>
                  ),
                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                  h1: ({ children }) => (
                    <h1 className="text-base font-bold my-2 text-foreground">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-sm font-bold my-2 text-foreground">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xs font-bold my-1.5 text-foreground">{children}</h3>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-primary/40 pl-2.5 my-2 italic text-muted-foreground">
                      {children}
                    </blockquote>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-muted/80 p-2.5 rounded-lg text-xs font-mono overflow-x-auto my-2 border border-border/50">
                      {children}
                    </pre>
                  ),
                  code: ({ className, children, ...props }) => (
                    <code
                      className={cn(
                        'bg-background/80 px-1 py-0.5 rounded text-xs font-mono border border-border/40',
                        className
                      )}
                      {...props}
                    >
                      {children}
                    </code>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline hover:opacity-80 font-medium inline-flex items-center gap-0.5"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>

              {showStreamingCursor && (
                <span className="inline-block w-1.5 h-3.5 ml-1 bg-primary align-middle animate-pulse" />
              )}
            </div>
          )}
        </div>

        {/* Recommended Products */}
        {message.products && message.products.length > 0 && (
          <div className="mt-2.5 space-y-2 w-full">
            <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5 px-0.5">
              <span>🛍️</span>
              <span>Sản phẩm gợi ý:</span>
            </p>
            <div className="flex flex-col gap-2">
              {message.products.map((product) => (
                <ChatProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {formattedTime && (
          <span className="text-[10px] text-muted-foreground/70 px-1 block select-none">
            {formattedTime}
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatMessageItem;
