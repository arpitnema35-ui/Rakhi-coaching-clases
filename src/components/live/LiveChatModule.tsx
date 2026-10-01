import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  MessageCircle, 
  Sparkles, 
  Pin, 
  ShieldCheck, 
  User, 
  Smile, 
  Lock 
} from 'lucide-react';
import { LiveChatMessage } from '../../types';

interface LiveChatModuleProps {
  messages: LiveChatMessage[];
  isHostMode: boolean;
  isChatEnabled: boolean;
  currentUserName: string;
  onSendMessage: (text: string) => Promise<void> | void;
  onToggleChat?: () => Promise<void> | void;
}

const QUICK_EMOJIS = ['👍', '🔥', '👏', '❤️', '💡', '❓'];

export default function LiveChatModule({
  messages,
  isHostMode,
  isChatEnabled,
  currentUserName,
  onSendMessage,
  onToggleChat
}: LiveChatModuleProps) {
  const [inputText, setInputText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    if (!isHostMode && !isChatEnabled) return;

    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleEmojiClick = (emoji: string) => {
    if (!isHostMode && !isChatEnabled) return;
    onSendMessage(emoji);
  };

  return (
    <div className="flex flex-col h-full bg-white/80 dark:bg-stone-900/80 border border-orange-200/80 dark:border-orange-950/70 rounded-3xl shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="p-3.5 sm:p-4 border-b border-orange-100 dark:border-stone-800 flex items-center justify-between bg-orange-50/50 dark:bg-stone-800/40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              Live Classroom Chat
              <span className={`w-2 h-2 rounded-full ${isChatEnabled ? 'bg-emerald-500' : 'bg-red-500'}`} />
            </h3>
            <span className="text-[10px] text-stone-500 dark:text-stone-400 block">
              {isChatEnabled ? 'Real-time student & faculty discussion' : 'Chat paused by faculty'}
            </span>
          </div>
        </div>

        {/* Host Chat Toggle Button */}
        {isHostMode && onToggleChat && (
          <button
            onClick={onToggleChat}
            className={`px-3 py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
              isChatEnabled 
                ? 'bg-slate-200 dark:bg-stone-700 text-slate-700 dark:text-stone-300 hover:bg-red-500 hover:text-white' 
                : 'bg-emerald-600 text-white shadow-sm'
            }`}
          >
            {isChatEnabled ? 'Turn Chat OFF' : 'Turn Chat ON'}
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3.5 space-y-3 overflow-y-auto max-h-[460px]">
        {messages.map((msg) => {
          const isTeacher = msg.senderRole === 'teacher' || msg.senderRole === 'admin';
          const isCurrentUser = msg.senderName === currentUserName;

          return (
            <div
              key={msg.id}
              className={`p-2.5 rounded-2xl text-xs transition-all ${
                msg.isPinned
                  ? 'bg-orange-50 dark:bg-orange-950/40 border border-orange-300 dark:border-orange-800 shadow-sm'
                  : isTeacher
                  ? 'bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-200 dark:border-stone-700'
                  : 'bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700'
              }`}
            >
              {/* Pinned Indicator */}
              {msg.isPinned && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-orange-600 dark:text-orange-400 mb-1">
                  <Pin className="w-3 h-3 rotate-45" />
                  <span>PINNED BY FACULTY</span>
                </div>
              )}

              {/* Sender Name & Role */}
              <div className="flex items-center justify-between gap-1.5 mb-1">
                <span className="font-extrabold flex items-center gap-1 text-slate-900 dark:text-white">
                  {isTeacher && <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />}
                  {msg.senderName}
                  {isCurrentUser && <span className="text-[9px] text-stone-400 font-normal">(You)</span>}
                </span>
                <span className="text-[9px] text-stone-400">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Message Content */}
              <p className="text-slate-700 dark:text-stone-300 leading-relaxed break-words">
                {msg.text}
              </p>
            </div>
          );
        })}
        <div ref={chatBottomRef} />
      </div>

      {/* Quick Reactions Bar */}
      <div className="px-3 py-2 border-t border-orange-100 dark:border-stone-800 bg-orange-50/30 dark:bg-stone-900/50 flex items-center justify-between">
        <span className="text-[10px] font-bold text-stone-400 flex items-center gap-1">
          <Smile className="w-3 h-3 text-orange-500" />
          Quick Reaction:
        </span>
        <div className="flex items-center gap-1">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleEmojiClick(emoji)}
              disabled={!isChatEnabled && !isHostMode}
              className="w-7 h-7 rounded-lg hover:bg-orange-100 dark:hover:bg-stone-800 flex items-center justify-center text-sm transition-transform hover:scale-125 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-orange-100 dark:border-stone-800 bg-white dark:bg-stone-900">
        {!isChatEnabled && !isHostMode ? (
          <div className="py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-500 text-xs text-center flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>Chat is currently disabled by the faculty.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask doubt or comment..."
              className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-orange-50/50 dark:bg-stone-800 border border-orange-200 dark:border-stone-700 text-slate-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:border-orange-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/25 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

    </div>
  );
}
