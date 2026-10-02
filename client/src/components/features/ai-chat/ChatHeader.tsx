import React from 'react';
import { Bot, RotateCcw, X } from 'lucide-react';

export interface ChatHeaderProps {
  onClose: () => void;
  onClear: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onClose, onClear }) => {
  return (
    <div className="px-4 py-3 border-b border-border/80 bg-card/90 backdrop-blur-md flex items-center justify-between shrink-0 select-none">
      {/* Bot Info */}
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-2xs">
            <Bot className="w-4 h-4" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-background" />
          </span>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground leading-tight">
            Trợ lý ảo Modern Shop
          </h3>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            Đang trực tuyến
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onClear}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
          title="Làm mới cuộc trò chuyện"
          aria-label="Làm mới cuộc trò chuyện"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
          title="Đóng cửa sổ chat"
          aria-label="Đóng cửa sổ chat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
