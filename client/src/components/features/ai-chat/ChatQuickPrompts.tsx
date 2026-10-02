import React from 'react';

export interface ChatQuickPromptsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

const QUICK_PROMPTS = [
  '🔥 Sản phẩm bán chạy nhất?',
  '👕 Áo thun/polo nam công sở',
  '📦 Chính sách đổi trả hàng thế nào?',
  '🚚 Phí vận chuyển & Freeship',
];

export const ChatQuickPrompts: React.FC<ChatQuickPromptsProps> = ({
  onSelect,
  disabled = false,
}) => {
  return (
    <div className="p-3 border-t border-border/50 bg-muted/20">
      <p className="text-[11px] font-medium text-muted-foreground mb-2">
        Gợi ý câu hỏi nhanh:
      </p>
      <div className="flex flex-wrap gap-1.5">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(prompt)}
            className="text-xs px-2.5 py-1.5 rounded-full bg-background border border-border/80 text-foreground/80 hover:text-primary hover:border-primary/50 hover:bg-primary/5 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none text-left shadow-2xs cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatQuickPrompts;
