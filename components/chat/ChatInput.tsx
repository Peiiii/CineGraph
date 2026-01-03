
import React from 'react';
import { useChatStore } from '../../stores/useChatStore';
import { usePresenter } from '../../PresenterContext';
import { IconButton } from '../ui/IconButton';
import { Tooltip } from '../ui/Tooltip';

export const ChatInput: React.FC = () => {
  const presenter = usePresenter();
  const { input, isTyping } = useChatStore();

  const handleSend = () => presenter.chatManager.sendMessage();

  return (
    <div className="px-6 pb-6 pt-2 space-y-4">
      <div className="bg-[#F8F9FA] rounded-[1.6rem] p-4 border border-[#E9ECEF] focus-within:bg-white focus-within:border-[#0066FF]/30 focus-within:shadow-[0_0_0_1px_rgba(0,102,255,0.05)] transition-all duration-300">
        <textarea
          value={input}
          onChange={(e) => presenter.chatManager.setInput(e.target.value)}
          onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
          placeholder="输入创作指令，如：‘生成一个赛博朋克风格的分镜图’"
          className="w-full bg-transparent px-2 text-[14px] focus:outline-none resize-none h-16 placeholder:text-[#ADB5BD] text-black font-medium leading-relaxed"
        />
        
        <div className="flex items-center justify-between mt-3 px-1">
          <div className="flex items-center gap-1.5">
             <IconButton icon="fa-solid fa-paperclip" title="上传剧本/参考图" className="!w-8 !h-8" />
             <IconButton icon="fa-solid fa-at" title="引用画布资产" className="!w-8 !h-8" />
             <Tooltip content="AI 创意润色" position="top">
               <button 
                 className="w-8 h-8 rounded-full bg-[#E3F2FD] text-[#0066FF] flex items-center justify-center transition-all hover:bg-[#0066FF] hover:text-white active:scale-90"
               >
                 <i className="fa-solid fa-wand-magic-sparkles text-[12px]"></i>
               </button>
             </Tooltip>
          </div>

          <div className="flex items-center">
             <Tooltip content="发送指令 (Enter)" position="top">
               <button 
                 onClick={handleSend}
                 disabled={isTyping || !input.trim()}
                 className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm active:scale-90 ${
                   isTyping || !input.trim() 
                     ? 'bg-gray-100 text-gray-300' 
                     : 'bg-[#1A1C1E] text-white hover:bg-black hover:shadow-md'
                 }`}
               >
                 {isTyping ? (
                   <i className="fa-solid fa-circle-notch animate-spin text-[14px]"></i>
                 ) : (
                   <i className="fa-solid fa-arrow-up text-[15px]"></i>
                 )}
               </button>
             </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};
