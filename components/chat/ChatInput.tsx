
import React from 'react';
import { useChatStore } from '../../stores/useChatStore';
import { usePresenter } from '../../PresenterContext';
import { ActionButton } from '../ui/ActionButton';
import { Tooltip } from '../ui/Tooltip';

export const ChatInput: React.FC = () => {
  const presenter = usePresenter();
  const { input, isTyping } = useChatStore();

  const handleSend = () => {
    if (isTyping) {
      presenter.chatManager.stopResponse();
    } else {
      presenter.chatManager.sendMessage();
    }
  };

  return (
    <div className="px-4 pb-4 pt-1">
      <div className="bg-[#F8F9FA] rounded-[1rem] p-3 border border-[#E9ECEF] focus-within:bg-white focus-within:border-[#0066FF]/20 focus-within:shadow-sm transition-all duration-300">
        <textarea
          value={input}
          onChange={(e) => presenter.chatManager.setInput(e.target.value)}
          onKeyDown={(e) => { 
            if(e.key === 'Enter' && !e.shiftKey) { 
              e.preventDefault(); 
              if (!isTyping) handleSend(); 
            }
          }}
          placeholder="在此输入指令..."
          className="w-full bg-transparent px-1 text-[13px] focus:outline-none resize-none h-14 placeholder:text-[#ADB5BD] text-black font-medium leading-normal"
        />
        
        <div className="flex items-center justify-between mt-1.5 px-0.5">
          <div className="flex items-center gap-0.5">
             <ActionButton icon="fa-solid fa-paperclip" title="上传" className="!w-7 !h-7" />
             <ActionButton icon="fa-solid fa-at" title="引用" className="!w-7 !h-7" />
             <Tooltip content="AI 润色" position="top">
               <button 
                 className="w-7 h-7 rounded-lg bg-[#E3F2FD] text-[#0066FF] flex items-center justify-center transition-all hover:bg-[#0066FF] hover:text-white active:scale-90"
               >
                 <i className="fa-solid fa-wand-magic-sparkles text-[10px]"></i>
               </button>
             </Tooltip>
          </div>

          <div className="flex items-center">
             <Tooltip content={isTyping ? "停止响应" : "发送 (Enter)"} position="top">
               <button 
                 onClick={handleSend}
                 disabled={!isTyping && !input.trim()}
                 className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90 ${
                   !isTyping && !input.trim() 
                     ? 'bg-[#F1F3F5] text-[#CED4DA]' 
                     : isTyping 
                       ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' 
                       : 'bg-[#1A1C1E] text-white hover:bg-black shadow-sm'
                 }`}
               >
                 {isTyping ? (
                   <i className="fa-solid fa-square text-[10px]"></i>
                 ) : (
                   <i className="fa-solid fa-arrow-up text-[12px]"></i>
                 )}
               </button>
             </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};
