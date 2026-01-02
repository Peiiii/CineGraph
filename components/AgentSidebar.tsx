
import React, { useState, useRef, useEffect } from 'react';
import { Asset, AssetType } from '../types';
import { GeminiService } from '../services/geminiService';
import { marked } from 'marked';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isExecuting?: boolean;
  toolInfo?: string;
  step?: 'thinking' | 'writing' | 'generating' | 'done';
}

const SuggestionCard = ({ title, desc, images }: { title: string, desc: string, images: string[] }) => (
  <div className="group relative bg-[#F8F9FA] hover:bg-white border border-transparent hover:border-[#E9ECEF] rounded-[1.2rem] p-5 pr-28 transition-all cursor-pointer overflow-hidden min-h-[95px] flex flex-col justify-center">
    <h4 className="text-[14px] font-bold text-black mb-0.5">{title}</h4>
    <p className="text-[11px] text-[#ADB5BD] line-clamp-1 leading-relaxed font-medium">{desc}</p>
    <div className="absolute right-[-8px] top-1/2 -translate-y-1/2 flex items-center h-full">
      {images.map((img, i) => (
        <img 
          key={i} 
          src={img} 
          className="w-14 h-22 object-cover rounded-xl shadow-[0_6px_12px_rgba(0,0,0,0.06)] border-2 border-white -ml-9 first:ml-0 transform transition-all duration-500 group-hover:-translate-y-1.5"
          style={{ 
            zIndex: images.length - i, 
            transform: `rotate(${(i - 1) * 8}deg) translateY(${i === 1 ? '-6px' : '0'})` 
          }}
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
      const response = await GeminiService.chatWithAgent(userMsg, contextAssets);
      
      if (response.functionCalls && response.functionCalls.length > 0) {
        for (const call of response.functionCalls) {
          const { name, args } = call;
          
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: `🎬 **正在创作:** \`${name}\`...`, 
            isExecuting: true,
            step: 'generating'
          }]);

          try {
            let newAsset: Asset | null = null;
            if (name === 'create_visual_shot') {
              const dataUrl = await GeminiService.generateImage(args.prompt as string);
              newAsset = { id: Math.random().toString(36).substr(2, 9), type: 'image', content: dataUrl, title: args.title as string || 'AI 视觉分镜', createdAt: Date.now() };
            } else if (name === 'animate_scene') {
              const ref = contextAssets.find(a => a.id === args.reference_asset_id) || contextAssets.find(a => a.type === 'image');
              const videoUrl = await GeminiService.generateVideo(args.prompt as string, ref?.content);
              newAsset = { id: Math.random().toString(36).substr(2, 9), type: 'video', content: videoUrl, title: 'AI 动态片段', createdAt: Date.now() };
            } else if (name === 'write_creative_asset') {
              newAsset = { id: Math.random().toString(36).substr(2, 9), type: (args.type as AssetType) || 'text', content: args.content as string, title: args.title as string, createdAt: Date.now() };
            }

            if (newAsset) {
              onAddAsset(newAsset);
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { ...updated[updated.length - 1], isExecuting: false, content: `✨ **已完成:** ${newAsset?.title}`, step: 'done' };
                return updated;
              });
            }
          } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: `❌ 任务中断: ${name}` }]);
          }
        }
      }

      if (response.text) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.text! }]);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ 系统错误: ${err.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  const IconButton = ({ icon, className = "" }: { icon: string, className?: string }) => (
    <button className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all text-[#ADB5BD] hover:bg-[#F0F2F5] hover:text-black ${className}`}>
      <i className={`${icon} text-[14px]`}></i>
    </button>
  );

  return (
    <div className="h-full flex flex-col bg-white border border-[#E9ECEF] rounded-[1.4rem] overflow-hidden relative">
      {/* Header - 更加紧凑的顶部区域 */}
      <header className="px-6 py-4 flex items-center justify-end gap-0.5 border-b border-[#F8F9FA]">
        <IconButton icon="fa-regular fa-plus-square" className="!w-7 !h-7" />
        <IconButton icon="fa-solid fa-sliders" className="!w-7 !h-7" />
        <IconButton icon="fa-solid fa-share-nodes" className="!w-7 !h-7" />
        <IconButton icon="fa-regular fa-clone" className="!w-7 !h-7" />
        <IconButton icon="fa-solid fa-arrow-up-right-from-square" className="!text-[12px] !w-7 !h-7" />
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-7 py-5 space-y-7 scroll-smooth custom-scrollbar">
        {messages.length === 0 ? (
          <div className="space-y-7">
            <div className="mt-2">
               <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-[11px] text-white font-black mb-5">L</div>
               <h1 className="text-[24px] font-extrabold text-black tracking-tight leading-tight">Hi，我是你的AI导演</h1>
               <p className="text-[15px] text-[#ADB5BD] mt-1 font-medium font-['Plus_Jakarta_Sans']">开启你的电影创作之旅</p>
            </div>

            <div className="grid gap-3">
              <SuggestionCard title="剧本创作 (Script)" desc="编写一段充满张力的追逐戏..." images={["https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200", "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=200", "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200"]} />
              <SuggestionCard title="角色设定 (Cast)" desc="设计一个未来世界的反叛者..." images={["https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?w=200", "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=200", "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200"]} />
              <SuggestionCard title="分镜转换 (Board)" desc="将文字剧本视觉化..." images={["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200", "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200", "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200"]} />
            </div>

            <button className="flex items-center gap-2 text-[11px] text-[#ADB5BD] hover:text-black transition-colors font-bold"><i className="fa-solid fa-rotate text-[10px]"></i> 切换</button>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 mb-2.5">
                 {msg.role === 'assistant' && <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center text-[8px] text-white font-black">L</div>}
                 <span className="text-[9px] font-black text-[#ADB5BD] uppercase tracking-widest">{msg.role === 'assistant' ? 'Director' : 'Creator'}</span>
              </div>
              <div className={`text-[13px] leading-relaxed max-w-[92%] ${
                msg.role === 'user' 
                  ? 'bg-[#F8F9FA] px-4 py-2.5 rounded-[1.1rem] rounded-tr-none text-black font-medium' 
                  : msg.isExecuting 
                    ? 'bg-[#E3F2FD]/40 border border-[#BBDEFB]/40 px-4 py-3 rounded-[1rem] text-[#1976D2] italic flex items-center gap-3 w-full'
                    : 'text-black font-medium'
              }`}>
                {msg.isExecuting && <i className="fa-solid fa-circle-notch animate-spin text-[12px]"></i>}
                <div className="prose prose-sm prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) }} />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="px-5 pb-5 pt-2 space-y-4">
        {/* Promo Banner */}
        <div className="bg-[#E3F2FD]/60 rounded-xl px-4 py-2.5 flex items-center justify-between border border-[#BBDEFB]/30">
           <div className="flex items-center gap-2.5">
              <i className="fa-solid fa-gift text-[#1976D2] text-[13px]"></i>
              <span className="text-[11px] font-bold text-[#1976D2]">升级会员，Nano Banana Pro 免费365天！</span>
           </div>
           <button className="text-[#1976D2] opacity-40 hover:opacity-100"><i className="fa-solid fa-xmark text-[12px]"></i></button>
        </div>

        {/* Input UI - 保持扁平化风格 */}
        <div className="bg-[#F8F9FA] rounded-[1.4rem] p-4 border border-transparent focus-within:bg-white focus-within:border-[#E9ECEF] transition-all duration-300">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
            placeholder="输入创作指令..."
            className="w-full bg-transparent px-1 text-[13px] focus:outline-none resize-none h-14 placeholder:text-[#ADB5BD] text-black font-medium"
          />
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1">
               <IconButton icon="fa-solid fa-paperclip" className="!w-7 !h-7" />
               <IconButton icon="fa-solid fa-at" className="!w-7 !h-7" />
               <button className="w-7 h-7 rounded-full bg-[#E3F2FD] text-[#0066FF] flex items-center justify-center transition-all">
                 <i className="fa-solid fa-wand-magic-sparkles text-[11px]"></i>
               </button>
            </div>

            <div className="flex items-center gap-3">
               <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-white border border-black/[0.04]">
                 <IconButton icon="fa-regular fa-lightbulb" className="!w-6 !h-6 !text-[12px]" />
                 <IconButton icon="fa-solid fa-bolt" className="!w-6 !h-6 !text-[12px]" />
                 <IconButton icon="fa-solid fa-globe" className="!w-6 !h-6 !text-[12px]" />
                 <IconButton icon="fa-solid fa-cube" className="!w-6 !h-6 !text-[12px]" />
               </div>
               
               <button 
                 onClick={handleSend}
                 disabled={isTyping}
                 className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm active:scale-90 ${isTyping ? 'bg-gray-100 text-gray-400' : 'bg-[#C4C4C4] hover:bg-black text-white'}`}
               >
                 <i className="fa-solid fa-arrow-up text-[13px]"></i>
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentSidebar;
