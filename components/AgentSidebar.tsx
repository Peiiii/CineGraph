
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
    <div className="no-canvas-interaction h-full flex flex-col bg-white border border-[#E9ECEF] rounded-[1.4rem] overflow-hidden relative shadow-sm">
      <header className="px-5 py-3.5 flex items-center justify-end gap-1 border-b border-[#F8F9FA]">
        <ActionButton icon="fa-regular fa-plus-square" title="新建会话" tooltipPosition="bottom" />
        <ActionButton icon="fa-solid fa-sliders" title="参数设置" tooltipPosition="bottom" />
        <ActionButton icon="fa-solid fa-share-nodes" title="分享项目" tooltipPosition="bottom" />
        <ActionButton icon="fa-regular fa-clone" title="复制资产" tooltipPosition="bottom" />
        <ActionButton icon="fa-solid fa-arrow-up-right-from-square" title="导出" tooltipPosition="bottom" />
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-7 py-5 space-y-7 scroll-smooth custom-scrollbar">
        {messages.length === 0 ? (
          <div className="space-y-7">
            <div className="mt-2">
               <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-[12px] text-white font-black mb-5 shadow-lg">L</div>
               <h1 className="text-[24px] font-extrabold text-black tracking-tight leading-tight">AI 导演助手已就绪</h1>
               <p className="text-[15px] text-[#868E96] mt-1 font-medium">描述你的电影创意，我将协助你完成分镜与剧本</p>
            </div>

            <div className="grid gap-4">
              <SuggestionCard 
                title="剧本创作 (Script)" 
                desc="编写一段充满张力的追逐戏..." 
                images={["https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200", "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=200", "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200"]} 
              />
              <SuggestionCard 
                title="角色设定 (Cast)" 
                desc="设计一个未来世界的反叛者..." 
                images={["https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?w=200", "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=200", "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200"]} 
              />
              <SuggestionCard 
                title="分镜转换 (Board)" 
                desc="将文字剧本视觉化..." 
                images={["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200", "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200", "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200"]} 
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
