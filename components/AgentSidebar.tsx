
import React, { useState, useRef, useEffect } from 'react';
import { Asset } from '../types';
import { GeminiService } from '../services/geminiService';
import { marked } from 'marked';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SuggestionCard = ({ title, desc, images }: { title: string, desc: string, images: string[] }) => (
  <div className="group relative bg-[#F8F9FA] hover:bg-white border border-transparent hover:border-[#E9ECEF] rounded-[1.2rem] p-4 pr-24 transition-all cursor-pointer sharp-shadow overflow-hidden min-h-[90px] flex flex-col justify-center">
    <h4 className="text-[14px] font-bold text-black mb-0.5">{title}</h4>
    <p className="text-[11px] text-[#ADB5BD] line-clamp-1 leading-relaxed">{desc}</p>
    <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 flex items-center h-full">
      {images.map((img, i) => (
        <img 
          key={i} 
          src={img} 
          className="w-12 h-16 object-cover rounded-lg shadow-md border-2 border-white -ml-7 first:ml-0 transform transition-transform group-hover:-translate-y-1"
          style={{ zIndex: images.length - i, transform: `rotate(${(i - 1) * 6}deg) translateY(${i === 1 ? '-4px' : '0'})` }}
        />
      ))}
    </div>
  </div>
);

const AgentSidebar: React.FC<{ contextAssets: Asset[], onAddAsset: (a: Asset) => void }> = ({ contextAssets, onAddAsset }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);
    try {
      // 保持电影创作的逻辑，但 UI 遵循 Lovart
      const response = await GeminiService.chatWithAgent(userMsg, [], contextAssets);
      setMessages(prev => [...prev, { role: 'assistant', content: response.text || '导演已收到指令，正在准备拍摄...' }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  const IconButton = ({ icon, className = "", onClick }: { icon: string, className?: string, onClick?: () => void }) => (
    <button 
      onClick={onClick}
      className={`w-8 h-8 rounded-[8px] flex items-center justify-center text-[#ADB5BD] hover:bg-[#F0F2F5] hover:text-[#1A1C1E] transition-all duration-200 ${className}`}
    >
      <i className={`${icon} text-[14px]`}></i>
    </button>
  );

  return (
    <div className="h-full flex flex-col bg-white border border-[#E9ECEF] rounded-[1.8rem] sharp-shadow overflow-hidden relative">
      {/* 极简 Header */}
      <header className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <IconButton icon="fa-solid fa-plus" className="!w-6 !h-6 !text-[12px]" />
        </div>
        <div className="flex gap-0.5 items-center">
           <IconButton icon="fa-solid fa-sliders" />
           <IconButton icon="fa-solid fa-share-nodes" />
           <IconButton icon="fa-regular fa-clone" />
           <IconButton icon="fa-solid fa-arrow-up-right-from-square" className="!text-[12px]" />
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-2 space-y-4 scroll-smooth custom-scrollbar">
        {messages.length === 0 ? (
          <div className="space-y-6">
            {/* Intro Section - 更加紧凑 */}
            <div className="mt-2">
               <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-[11px] text-white font-black mb-4">L</div>
               <h1 className="text-[24px] font-bold text-black tracking-tight leading-tight">Hi，我是你的AI导演</h1>
               <p className="text-[16px] text-[#ADB5BD] mt-1 font-medium">开启今天的电影创作之旅吧！</p>
            </div>

            {/* Suggestion Cards - Lovart 风格的高利用率 */}
            <div className="grid gap-3">
              <SuggestionCard 
                title="剧本创作 (Script)" 
                desc="编写一段惊心动魄的雨夜追逐戏..." 
                images={[
                  "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&q=80",
                  "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=200&q=80",
                  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&q=80"
                ]}
              />
              <SuggestionCard 
                title="角色设计 (Character)" 
                desc="设计一个生活在2077年的赛博侦探..." 
                images={[
                  "https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?w=200&q=80",
                  "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=200&q=80",
                  "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&q=80"
                ]}
              />
              <SuggestionCard 
                title="分镜生成 (Storyboard)" 
                desc="将剧本转化为一组极具张力的视觉分镜..." 
                images={[
                  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&q=80",
                  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&q=80",
                  "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&q=80"
                ]}
              />
            </div>

            <button className="flex items-center gap-2 text-[11px] text-[#ADB5BD] hover:text-black transition-colors py-1">
              <i className="fa-solid fa-rotate text-[10px]"></i> 换一批
            </button>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 mb-2">
                 {msg.role === 'assistant' && (
                   <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center text-[8px] text-white font-black">L</div>
                 )}
                 <span className="text-[9px] font-black text-[#ADB5BD] uppercase tracking-widest">
                   {msg.role === 'assistant' ? 'Director' : 'Creator'}
                 </span>
              </div>
              <div className={`text-[13px] leading-relaxed max-w-[90%] ${
                msg.role === 'user' 
                  ? 'bg-[#F8F9FA] px-4 py-2.5 rounded-[1rem] rounded-tr-none text-black' 
                  : 'text-black font-medium'
              }`}>
                <div className="prose prose-sm prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) }} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Area - 极致简约 */}
      <div className="px-5 pb-5 pt-2 space-y-3">
        {/* Promo Banner - 更细更轻 */}
        <div className="bg-[#E3F2FD]/60 rounded-xl px-4 py-2 flex items-center justify-between border border-[#BBDEFB]/30">
           <div className="flex items-center gap-2">
              <i className="fa-solid fa-gift text-[#1976D2] text-[12px]"></i>
              <span className="text-[11px] font-semibold text-[#1976D2]">升级会员，开启无限视频生成特权！</span>
           </div>
           <button className="text-[#1976D2] opacity-40 hover:opacity-100 transition-opacity"><i className="fa-solid fa-xmark text-[12px]"></i></button>
        </div>

        {/* Input Box - 整合到单行操作感 */}
        <div className="bg-[#F8F9FA] rounded-[1.5rem] p-4 border border-transparent focus-within:bg-white focus-within:border-[#E9ECEF] transition-all duration-300">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
            placeholder="输入创作指令，如：生成一段森林追逐的分镜"
            className="w-full bg-transparent px-1 text-[13px] focus:outline-none resize-none h-12 placeholder:text-[#ADB5BD] text-black font-medium"
          />
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-0.5">
               <IconButton icon="fa-solid fa-paperclip" className="!w-7 !h-7 !text-[#ADB5BD]" />
               <IconButton icon="fa-solid fa-at" className="!w-7 !h-7 !text-[#ADB5BD]" />
               <button className="w-7 h-7 rounded-[7px] flex items-center justify-center text-[#0066FF] hover:bg-[#F0F2F5] transition-all ml-0.5">
                 <i className="fa-solid fa-wand-magic-sparkles text-[12px]"></i>
               </button>
            </div>

            <div className="flex items-center gap-3">
               <div className="flex items-center gap-0.5 px-1 py-0.5 rounded-full bg-white border border-black/[0.03]">
                 <IconButton icon="fa-regular fa-lightbulb" className="!w-6 !h-6 !text-[12px]" />
                 <IconButton icon="fa-solid fa-bolt" className="!w-6 !h-6 !text-[12px]" />
                 <IconButton icon="fa-solid fa-globe" className="!w-6 !h-6 !text-[12px]" />
                 <IconButton icon="fa-solid fa-cube" className="!w-6 !h-6 !text-[12px]" />
               </div>
               
               <button 
                 onClick={handleSend}
                 className="w-8 h-8 rounded-full bg-[#BDBDBD] text-white flex items-center justify-center hover:bg-black transition-all active:scale-95 shadow-sm"
               >
                 <i className="fa-solid fa-arrow-up text-[12px]"></i>
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentSidebar;
