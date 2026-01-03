
import React, { useRef, useEffect } from 'react';
import { useChatStore } from '../stores/useChatStore';
import { ActionButton } from './ui/ActionButton';
import { SuggestionCard } from './ui/SuggestionCard';
import { ChatMessage } from './chat/ChatMessage';
import { ChatInput } from './chat/ChatInput';

const AgentSidebar: React.FC = () => {
  const { messages } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="no-canvas-interaction h-full flex flex-col bg-white border border-[#E9ECEF] rounded-[1rem] overflow-hidden relative shadow-sm">
      <header className="px-3 py-2 flex items-center justify-end gap-0.5 border-b border-[#F8F9FA]">
        <ActionButton icon="fa-regular fa-plus-square" title="新建会话" tooltipPosition="bottom" className="!w-8 !h-8" />
        <ActionButton icon="fa-solid fa-sliders" title="参数设置" tooltipPosition="bottom" className="!w-8 !h-8" />
        <ActionButton icon="fa-solid fa-share-nodes" title="分享项目" tooltipPosition="bottom" className="!w-8 !h-8" />
        <ActionButton icon="fa-solid fa-arrow-up-right-from-square" title="导出" tooltipPosition="bottom" className="!w-8 !h-8" />
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-5 scroll-smooth custom-scrollbar">
        {messages.length === 0 ? (
          <div className="space-y-5">
            <div className="mt-1">
               <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-[10px] text-white font-black mb-3 shadow-md">L</div>
               <h1 className="text-[18px] font-extrabold text-black tracking-tight leading-tight">AI 导演助手</h1>
               <p className="text-[12px] text-[#868E96] mt-1 font-medium">协助你完成电影分镜与剧本</p>
            </div>

            <div className="grid gap-2.5">
              <SuggestionCard 
                title="剧本创作" 
                desc="编写一段充满张力的追逐戏..." 
                images={["https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200", "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=200", "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200"]} 
              />
              <SuggestionCard 
                title="角色设定" 
                desc="设计一个未来世界的反叛者..." 
                images={["https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?w=200", "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=200", "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200"]} 
              />
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <ChatMessage key={i} message={msg} />
          ))
        )}
      </div>

      <ChatInput />
    </div>
  );
};

export default AgentSidebar;
