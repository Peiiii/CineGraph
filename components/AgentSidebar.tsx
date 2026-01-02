
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
  <div className="group relative bg-[#F8F9FA] hover:bg-white border border-transparent hover:border-[#E9ECEF] rounded-[1.5rem] p-6 pr-32 transition-all cursor-pointer sharp-shadow overflow-hidden min-h-[105px] flex flex-col justify-center">
    <h4 className="text-[14px] font-bold text-black mb-1">{title}</h4>
    <p className="text-[11px] text-[#ADB5BD] line-clamp-1 leading-relaxed">{desc}</p>
    <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 flex items-center h-[120%]">
      {images.map((img, i) => (
        <img 
          key={i} 
          src={img} 
          className="w-16 h-24 object-cover rounded-xl shadow-[0_8px_16px_rgba(0,0,0,0.1)] border-2 border-white -ml-10 first:ml-0 transform transition-all duration-500 group-hover:-translate-y-2"
          style={{ 
            zIndex: images.length - i, 
            transform: `rotate(${(i - 1) * 10}deg) translateY(${i === 1 ? '-8px' : '0'})` 
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
            content: `🎬 **Agent 正在执行工具调用:** \`${name}\`...`, 
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
                updated[updated.length - 1] = { ...updated[updated.length - 1], isExecuting: false, content: `✨ **执行成功:** 已将 *${newAsset?.title}* 添加到画布。`, step: 'done' };
                return updated;
              });
            }
          } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: `❌ 执行失败: ${name}` }]);
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

  const IconButton = ({ icon, className = "", active = false }: { icon: string, className?: string, active?: boolean }) => (
    <button className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${active ? 'bg-[#0066FF] text-white' : 'text-[#ADB5BD] hover:bg-[#F0F2F5] hover:text-black'} ${className}`}>
      <i className={`${icon} text-[15px]`}></i>
    </button>
  );

  return (
    <div className="h-full flex flex-col bg-white border border-[#E9ECEF] rounded-[2rem] sharp-shadow overflow-hidden relative">
      {/* Header - 复刻右上角图标组 */}
      <header className="px-8 py-5 flex items-center justify-end gap-1">
        <IconButton icon="fa-regular fa-plus-square" />
        <IconButton icon="fa-solid fa-sliders" />
        <IconButton icon="fa-solid fa-share-nodes" />
        <IconButton icon="fa-regular fa-clone" />
        <IconButton icon="fa-solid fa-arrow-up-right-from-square" className="!text-[13px]" />
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-4 space-y-8 scroll-smooth custom-scrollbar">
        {messages.length === 0 ? (
          <div className="space-y-8">
            <div className="mt-4">
               <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-[12px] text-white font-black mb-6">L</div>
               <h1 className="text-[26px] font-extrabold text-black tracking-tight leading-tight">Hi，我是你的AI导演</h1>
               <p className="text-[16px] text-[#ADB5BD] mt-2 font-medium">让我们开始今天的电影创作吧！</p>
            </div>

            <div className="grid gap-4">
              <SuggestionCard title="剧本创作 (Script)" desc="编写一段惊心动魄的雨夜追逐戏..." images={["https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200", "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=200", "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200"]} />
              <SuggestionCard title="角色设计 (Cast)" desc="设计一个赛博朋克风格的反派角色..." images={["https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?w=200", "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=200", "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200"]} />
              <SuggestionCard title="分镜生成 (Board)" desc="根据剧本生成一组电影分镜图..." images={["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200", "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200", "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200"]} />
            </div>

            <button className="flex items-center gap-2 text-[12px] text-[#ADB5BD] hover:text-black transition-colors font-bold"><i className="fa-solid fa-rotate text-[10px]"></i> 切换</button>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 mb-3">
                 {msg.role === 'assistant' && <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-[9px] text-white font-black">L</div>}
                 <span className="text-[10px] font-black text-[#ADB5BD] uppercase tracking-widest">{msg.role === 'assistant' ? 'AI Director' : 'Creator'}</span>
              </div>
              <div className={`text-[14px] leading-relaxed max-w-[95%] ${
                msg.role === 'user' 
                  ? 'bg-[#F8F9FA] px-5 py-3 rounded-[1.2rem] rounded-tr-none text-black font-medium' 
                  : msg.isExecuting 
                    ? 'bg-[#E3F2FD] border border-[#BBDEFB] px-5 py-4 rounded-[1.2rem] text-[#1976D2] italic flex items-center gap-4 w-full shadow-sm'
                    : 'text-black font-medium'
              }`}>
                {msg.isExecuting && <i className="fa-solid fa-clapperboard animate-bounce text-[14px]"></i>}
                <div className="prose prose-sm prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) }} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Area - 精准复刻输入框与 Promo */}
      <div className="px-6 pb-6 pt-2 space-y-4">
        {/* Promo Banner */}
        <div className="bg-[#E3F2FD] rounded-xl px-4 py-3 flex items-center justify-between border border-[#BBDEFB]/40">
           <div className="flex items-center gap-3">
              <i className="fa-solid fa-gift text-[#1976D2] text-[15px]"></i>
              <span className="text-[12px] font-bold text-[#1976D2]">升级会员，Nano Banana Pro 免费365天！</span>
           </div>
           <button className="text-[#1976D2] opacity-50 hover:opacity-100"><i className="fa-solid fa-xmark"></i></button>
        </div>

        {/* Precise Input UI */}
        <div className="bg-[#F8F9FA] rounded-[2rem] p-5 border border-transparent focus-within:bg-white focus-within:border-[#E9ECEF] transition-all duration-300 shadow-sm focus-within:shadow-xl">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
            placeholder="请输入你的设计需求"
            className="w-full bg-transparent px-2 text-[14px] focus:outline-none resize-none h-16 placeholder:text-[#ADB5BD] text-black font-medium"
          />
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
               <IconButton icon="fa-solid fa-paperclip" />
               <IconButton icon="fa-solid fa-at" />
               <button className="w-8 h-8 rounded-full bg-[#E3F2FD] text-[#0066FF] flex items-center justify-center hover:shadow-md transition-all">
                 <i className="fa-solid fa-wand-magic-sparkles text-[13px]"></i>
               </button>
            </div>

            <div className="flex items-center gap-4">
               <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white border border-black/[0.04] shadow-sm">
                 <IconButton icon="fa-regular fa-lightbulb" className="!w-7 !h-7 !text-[13px]" />
                 <IconButton icon="fa-solid fa-bolt" className="!w-7 !h-7 !text-[13px]" />
                 <IconButton icon="fa-solid fa-globe" className="!w-7 !h-7 !text-[13px]" />
                 <IconButton icon="fa-solid fa-cube" className="!w-7 !h-7 !text-[13px]" />
               </div>
               
               <button 
                 onClick={handleSend}
                 disabled={isTyping}
                 className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md active:scale-90 ${isTyping ? 'bg-gray-100 text-gray-400' : 'bg-[#C4C4C4] hover:bg-black text-white'}`}
               >
                 <i className="fa-solid fa-arrow-up text-[15px]"></i>
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentSidebar;
