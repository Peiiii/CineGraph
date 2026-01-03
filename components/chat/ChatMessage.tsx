
import React from 'react';
import { Message } from '../../stores/useChatStore';
import { marked } from 'marked';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAssistant = message.role === 'assistant';

  // 将 Markdown 转换为 HTML
  const getHtmlContent = () => {
    try {
      // marked.parse 在 v15 中默认为同步执行
      return marked.parse(message.content || '') as string;
    } catch (e) {
      return message.content;
    }
  };

  return (
    <div className={`flex flex-col ${!isAssistant ? 'items-end' : 'items-start'}`}>
      <div className="flex items-center gap-2 mb-2">
         {isAssistant && <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center text-[8px] text-white font-black">L</div>}
         <span className="text-[9px] font-black text-[#ADB5BD] uppercase tracking-widest">
           {isAssistant ? 'Director' : 'Creator'}
         </span>
      </div>
      
      <div className={`text-[13px] leading-relaxed max-w-[95%] transition-all ${
        !isAssistant 
          ? 'bg-[#F8F9FA] px-4 py-2.5 rounded-[1.1rem] rounded-tr-none text-black font-medium' 
          : message.isExecuting 
            ? 'bg-[#E3F2FD]/40 border border-[#BBDEFB]/40 px-4 py-3 rounded-[1.2rem] text-[#1976D2] italic flex items-center gap-3 w-full shadow-sm'
            : 'text-black w-full'
      }`}>
        {message.isExecuting && <i className="fa-solid fa-circle-notch animate-spin text-[12px]"></i>}
        
        {message.step === 'thinking' && message.content === '' && (
          <div className="flex gap-1.5 py-2">
            <div className="w-1.5 h-1.5 bg-[#ADB5BD] rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 bg-[#ADB5BD] rounded-full animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-1.5 h-1.5 bg-[#ADB5BD] rounded-full animate-bounce [animation-delay:0.4s]"></div>
          </div>
        )}

        <div className="prose prose-slate max-w-none relative break-words">
           <div dangerouslySetInnerHTML={{ __html: getHtmlContent() }} />
           {message.isStreaming && (
             <span className="inline-block w-[2px] h-[14px] bg-[#0066FF] ml-1 animate-[pulse_0.8s_infinite] align-middle"></span>
           )}
        </div>
      </div>
    </div>
  );
};
