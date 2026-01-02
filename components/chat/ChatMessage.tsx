
import React from 'react';
import { Message } from '../../stores/useChatStore';
import { marked } from 'marked';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex flex-col ${!isAssistant ? 'items-end' : 'items-start'}`}>
      <div className="flex items-center gap-2 mb-2.5">
         {isAssistant && <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center text-[8px] text-white font-black">L</div>}
         <span className="text-[9px] font-black text-[#ADB5BD] uppercase tracking-widest">
           {isAssistant ? 'Director' : 'Creator'}
         </span>
      </div>
      <div className={`text-[13px] leading-relaxed max-w-[92%] transition-all ${
        !isAssistant 
          ? 'bg-[#F8F9FA] px-4 py-2.5 rounded-[1.1rem] rounded-tr-none text-black font-medium' 
          : message.isExecuting 
            ? 'bg-[#E3F2FD]/40 border border-[#BBDEFB]/40 px-4 py-3 rounded-[1rem] text-[#1976D2] italic flex items-center gap-3 w-full shadow-[0_4px_12px_-2px_rgba(25,118,210,0.08)]'
            : 'text-black font-medium'
      }`}>
        {message.isExecuting && <i className="fa-solid fa-circle-notch animate-spin text-[12px]"></i>}
        {message.step === 'thinking' && message.content === '' && (
          <div className="flex gap-1.5 py-1">
            <div className="w-1.5 h-1.5 bg-[#ADB5BD] rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 bg-[#ADB5BD] rounded-full animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-1.5 h-1.5 bg-[#ADB5BD] rounded-full animate-bounce [animation-delay:0.4s]"></div>
          </div>
        )}
        <div className="prose prose-sm prose-slate max-w-none relative">
           <div dangerouslySetInnerHTML={{ __html: marked.parse(message.content) }} />
           {message.isStreaming && <span className="inline-block w-1 h-4 bg-[#0066FF] animate-pulse ml-1 align-middle"></span>}
        </div>
      </div>
    </div>
  );
};
