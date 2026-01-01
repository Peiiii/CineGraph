
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

  const IconButton = ({ icon, className = "", onClick }: { icon: string, className?: string, onClick?: () => void }) => (
    <button 
      onClick={onClick}
      className={`w-10 h-10 rounded-[12px] flex items-center justify-center text-[#D1D1D6] hover:bg-[#F0F2F5] hover:text-[#1A1C1E] transition-all duration-200 ${className}`}
    >
      <i className={`${icon} text-[18px]`}></i>
    </button>
  );

  return (
    <div className="h-full flex flex-col bg-white border border-[#E9ECEF] rounded-[3rem] sharp-shadow overflow-hidden relative">
      <header className="px-10 py-8 flex items-center justify-between border-b border-[#F8F9FA]">
        <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#ADB5BD]">Workspace</h2>
        <div className="flex gap-1 items-center">
           <IconButton icon="fa-regular fa-circle-plus" />
           <IconButton icon="fa-solid fa-sliders" />
           <IconButton icon="fa-solid fa-share-nodes" />
           <IconButton icon="fa-regular fa-clone" />
           <IconButton icon="fa-solid fa-arrow-up-right-from-square" className="!w-8 !h-8 !text-[14px]" />
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-10 py-8 space-y-12 scroll-smooth custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className="flex items-center gap-3 mb-4">
               {msg.role === 'assistant' && (
                 <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-[11px] text-white font-black">L</div>
               )}
               <span className="text-[10px] font-black text-[#ADB5BD] uppercase tracking-widest">
                 {msg.role === 'assistant' ? 'Lovart Assistant' : 'Designer'}
               </span>
            </div>
            
            <div className={`text-[15px] leading-[1.8] w-full ${
              msg.role === 'user' 
                ? 'bg-[#F8F9FA] px-7 py-5 rounded-[2rem] rounded-tr-none text-black font-medium' 
                : 'text-black font-medium'
            }`}>
              <div className="prose prose-slate max-w-none prose-p:my-2" dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) }} />
              
              {i === 0 && (
                <div className="mt-8 rounded-[2rem] overflow-hidden border border-[#E9ECEF] sharp-shadow">
                   <img 
                    src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80" 
                    className="w-full contrast-[1.1] grayscale opacity-90" 
                    alt="Process"
                   />
                </div>
              )}

              {/* 模拟参考图中的提示按钮组 */}
              {msg.role === 'assistant' && i === 0 && (
                <div className="mt-8 space-y-3">
                  {['碎片化信息整理', 'AI复盘与洞察', '头脑风暴与创意', '个人规划与目标', '代办事项与任务'].map((text) => (
                    <button key={text} className="w-full text-left px-6 py-4 rounded-[1.2rem] bg-[#F8F9FA] border border-transparent hover:border-[#E9ECEF] hover:bg-white text-[13px] text-black/60 hover:text-black transition-all">
                      是，请从“{text}”模块开始细化。
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-8">
        <div className="bg-[#F8F9FA] rounded-[2.8rem] p-6 border border-transparent transition-all focus-within:bg-white focus-within:border-[#E9ECEF] focus-within:shadow-xl">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
            placeholder="给出完整的设计..."
            className="w-full bg-transparent px-2 text-[15px] focus:outline-none resize-none h-20 placeholder:text-[#ADB5BD] text-black font-medium"
          />
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-1">
               <IconButton icon="fa-solid fa-paperclip" className="!w-9 !h-9 !text-[#ADB5BD]" />
               <IconButton icon="fa-solid fa-at" className="!w-9 !h-9 !text-[#ADB5BD]" />
               <button className="w-9 h-9 rounded-[12px] bg-white flex items-center justify-center text-[#ADB5BD] hover:bg-[#F0F2F5] hover:text-[#0066FF] transition-all border border-black/[0.03] ml-1">
                 <i className="fa-solid fa-wand-magic-sparkles text-[12px]"></i>
               </button>
            </div>

            <div className="flex items-center gap-4">
               <div className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-white border border-black/[0.03]">
                 <IconButton icon="fa-solid fa-lightbulb" className="!w-8 !h-8 !text-[13px] !text-[#ADB5BD] hover:!text-amber-400" />
                 <IconButton icon="fa-solid fa-bolt" className="!w-8 !h-8 !text-[13px] !text-[#ADB5BD] hover:!text-blue-500" />
                 <IconButton icon="fa-solid fa-globe" className="!w-8 !h-8 !text-[13px] !text-[#ADB5BD] hover:!text-black" />
                 <IconButton icon="fa-solid fa-cube" className="!w-8 !h-8 !text-[13px] !text-[#ADB5BD] hover:!text-black" />
               </div>
               
               <button 
                 onClick={handleSend}
                 className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center hover:scale-105 transition-all shadow-lg"
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
