
import React from 'react';
import { useChatStore } from '../../stores/useChatStore';
import { usePresenter } from '../../PresenterContext';
import { IconButton } from '../ui/IconButton';

export const ChatInput: React.FC = () => {
  const presenter = usePresenter();
  const { input, isTyping } = useChatStore();

  const handleSend = () => presenter.chatManager.sendMessage();

  return (
    <div className="px-5 pb-5 pt-2 space-y-4">
      <div className="bg-[#F8F9FA] rounded-[1.4rem] p-4 border border-transparent focus-within:bg-white focus-within:border-[#E9ECEF] transition-all duration-300">
        <textarea
          value={input}
          onChange={(e) => presenter.chatManager.setInput(e.target.value)}
          onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
          placeholder="输入创作指令，例如：生成一段追逐戏的分镜..."
          className="w-full bg-transparent px-1 text-[13px] focus:outline-none resize-none h-14 placeholder:text-[#ADB5BD] text-black font-medium"
        />
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1">
             <IconButton icon="fa-solid fa-paperclip" title="上传附件" className="!w-7 !h-7" />
             <IconButton icon="fa-solid fa-at" title="提及资产" className="!w-7 !h-7" />
             <button title="灵感增强" className="w-7 h-7 rounded-full bg-[#E3F2FD] text-[#0066FF] flex items-center justify-center transition-all hover:bg-[#0066FF] hover:text-white">
               <i className="fa-solid fa-wand-magic-sparkles text-[11px]"></i>
             </button>
          </div>

          <div className="flex items-center justify-between">
             <button 
               onClick={handleSend}
               disabled={isTyping}
               title="发送指令"
               className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm active:scale-90 ${isTyping ? 'bg-gray-100 text-gray-400' : 'bg-[#C4C4C4] hover:bg-black text-white'}`}
             >
               <i className="fa-solid fa-arrow-up text-[13px]"></i>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
