
import React, { useState, useRef, useEffect } from 'react';
import { Asset } from '../types';
import { GeminiService } from '../services/geminiService';
import { marked } from 'marked';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AgentSidebar: React.FC<{ contextAssets: Asset[], onAddAsset: (a: Asset) => void }> = ({ contextAssets, onAddAsset }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '### 全新时代的基于碎片化记录...\n\n为了让设计更完整，我们是否可以先详细拆解这五大核心模块？' }
  ]);
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
      const response = await GeminiService.chatWithAgent(userMsg, [], contextAssets);
      setMessages(prev => [...prev, { role: 'assistant', content: response.text || '已收到指令。' }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  // 统一样式的图标按钮组件，复刻左侧工具栏的 Hover 逻辑
  const IconButton = ({ icon, className = "", onClick }: { icon: string, className?: string, onClick?: () => void }) => (
    <button 
      onClick={onClick}
      className={`w-10 h-10 rounded-[12px] flex items-center justify-center text-[#D1D1D6] hover:bg-[#F0F2F5] hover:text-[#1A1C1E] transition-all duration-200 ${className}`}
    >
      <i className={`${icon} text-[18px]`}></i>
    </button>
  );

  return (
    <div className="w-[440px] flex flex-col bg-white border border-[#E9ECEF] rounded-[3rem] sharp-shadow overflow-hidden z-40 relative">
      {/* 头部：复刻 Workspace 与四图标组 */}
      <header className="px-10 py-8 flex items-center justify-between">
        <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#ADB5BD]">Workspace</h2>
        
        <div className="flex gap-2 items-center">
           <IconButton icon="fa-regular fa-circle-plus" />
           <IconButton icon="fa-solid fa-sliders" />
           <IconButton icon="fa-solid fa-share-nodes" />
           <IconButton icon="fa-regular fa-clone" />
        </div>
      </header>

      {/* 聊天内容区域 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-10 py-2 space-y-12 scroll-smooth">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className="flex items-center gap-3 mb-5">
               {msg.role === 'assistant' && (
                 <div className="w-7 h-7 bg-black rounded-full flex items-center justify-center text-[10px] text-white font-black">L</div>
               )}
               <span className="text-[10px] font-black text-[#ADB5BD] uppercase tracking-widest">
                 {msg.role === 'assistant' ? 'Lovart Assistant' : 'Designer'}
               </span>
            </div>
            
            <div className={`text-[15px] leading-[1.8] w-full ${
              msg.role === 'user' 
                ? 'bg-[#F8F9FA] px-7 py-4 rounded-[1.8rem] rounded-tr-none text-black/80 font-medium' 
                : 'text-black font-medium'
            }`}>
              <div className="prose prose-slate max-w-none prose-p:my-2 prose-headings:mb-4 prose-headings:mt-6" dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) }} />
              
              {i === 0 && (
                <div className="mt-8 rounded-[2.5rem] overflow-hidden border border-[#E9ECEF] sharp-shadow bg-[#F8F9FA]">
                   <img 
                    src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80" 
                    className="w-full grayscale opacity-80 mix-blend-multiply contrast-125" 
                    alt="Process"
                   />
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex gap-2 items-center px-2 opacity-30">
              <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:0.4s]"></div>
           </div>
        )}
      </div>

      {/* 输入区域：完全复刻参考图底部 */}
      <div className="p-8 pb-10">
        <div className="bg-[#F4F5F7] rounded-[2.8rem] p-6 border border-transparent transition-all focus-within:bg-white focus-within:border-[#E9ECEF] focus-within:shadow-xl">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
            placeholder="给出完整的设计方案..."
            className="w-full bg-transparent px-2 text-[15px] focus:outline-none resize-none h-28 placeholder:text-[#ADB5BD] text-black font-medium"
          />
          
          <div className="flex items-center justify-between mt-6">
            {/* 左侧功能组 */}
            <div className="flex items-center gap-1">
               <IconButton icon="fa-solid fa-paperclip" className="!w-9 !h-9 !text-[#ADB5BD]" />
               <IconButton icon="fa-solid fa-at" className="!w-9 !h-9 !text-[#ADB5BD]" />
               <button className="w-9 h-9 rounded-[12px] bg-white flex items-center justify-center text-[#ADB5BD] hover:bg-[#F0F2F5] hover:text-[#0066FF] transition-all border border-black/[0.03] ml-2">
                 <i className="fa-solid fa-wand-magic-sparkles text-[12px]"></i>
               </button>
            </div>

            {/* 右侧功能胶囊 */}
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-white border border-black/[0.03]">
                 <IconButton icon="fa-solid fa-lightbulb" className="!w-8 !h-8 !text-[13px] !text-[#ADB5BD] hover:!text-amber-400" />
                 <IconButton icon="fa-solid fa-bolt" className="!w-8 !h-8 !text-[13px] !text-[#ADB5BD] hover:!text-blue-500" />
                 <IconButton icon="fa-solid fa-globe" className="!w-8 !h-8 !text-[13px] !text-[#ADB5BD] hover:!text-black" />
                 <IconButton icon="fa-solid fa-cube" className="!w-8 !h-8 !text-[13px] !text-[#ADB5BD] hover:!text-black" />
               </div>
               
               <button 
                 onClick={handleSend}
                 className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
               >
                 <i className="fa-solid fa-arrow-up text-[14px]"></i>
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentSidebar;
