
import React, { useRef, useEffect } from 'react';
import { useChatStore } from '../stores/useChatStore';
import { IconButton } from './ui/IconButton';
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
    <div className="h-full flex flex-col bg-white border border-[#E9ECEF] rounded-[1.4rem] overflow-hidden relative shadow-sm">
      <header className="px-6 py-4 flex items-center justify-end gap-0.5 border-b border-[#F8F9FA]">
        <IconButton icon="fa-regular fa-plus-square" title="新建会话" className="!w-7 !h-7" />
        <IconButton icon="fa-solid fa-sliders" title="参数设置" className="!w-7 !h-7" />
        <IconButton icon="fa-solid fa-share-nodes" title="分享项目" className="!w-7 !h-7" />
        <IconButton icon="fa-regular fa-clone" title="复制资产" className="!w-7 !h-7" />
        <IconButton icon="fa-solid fa-arrow-up-right-from-square" title="导出" className="!text-[12px] !w-7 !h-7" />
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-7 py-5 space-y-7 scroll-smooth custom-scrollbar">
        {messages.length === 0 ? (
          <div className="space-y-7">
            <div className="mt-2">
               <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-[11px] text-white font-black mb-5">L</div>
               <h1 className="text-[22px] font-extrabold text-black tracking-tight leading-tight">AI 导演助手已就绪</h1>
               <p className="text-[14px] text-[#ADB5BD] mt-1 font-medium">描述你的电影创意，我将协助你完成分镜与剧本</p>
            </div>

            <div className="grid gap-3">
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
