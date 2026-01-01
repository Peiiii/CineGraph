
import React, { useState, useRef, useEffect } from 'react';
import { Asset } from '../types';
import { GeminiService } from '../services/geminiService';
import { marked } from 'marked';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'tool_call' | 'tool_result';
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
      setMessages(prev => [...prev, { role: 'assistant', content: response.text || '已记录需求。' }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `错误: ${err.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="w-[420px] flex flex-col bg-white border border-black/[0.03] rounded-[2.5rem] sharp-shadow overflow-hidden z-40 relative">
      <header className="px-8 py-7 flex items-center justify-between">
        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-black/40">Workspace</h2>
        
        {/* 对齐截图的图标组 - 极致简约 */}
        <div className="flex gap-6 items-center">
           <button className="text-[#D1D1D6] hover:text-black transition-colors">
              <i className="fas fa-plus-circle text-[16px]"></i>
           </button>
           <button className="text-[#D1D1D6] hover:text-black transition-colors">
              <i className="fas fa-sliders text-[16px]"></i>
           </button>
           <button className="text-[#D1D1D6] hover:text-black transition-colors">
              <i className="fas fa-share-nodes text-[16px]"></i>
           </button>
           <button className="text-[#D1D1D6] hover:text-black transition-colors">
              <i className="fas fa-clone text-[16px]"></i>
           </button>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-4 space-y-12 scroll-smooth">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className="flex items-center gap-3 mb-4">
               {msg.role === 'assistant' && (
                 <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-[9px] text-white font-black">L</div>
               )}
               <span className="text-[9px] font-black text-black/20 uppercase tracking-widest">
                 {msg.role === 'assistant' ? 'Lovart Assistant' : 'Designer'}
               </span>
            </div>
            
            <div className={`text-[14px] leading-[1.8] max-w-full ${
              msg.role === 'user' 
                ? 'bg-slate-50 px-6 py-3 rounded-[1.5rem] rounded-tr-none text-black/70 font-medium' 
                : 'text-black font-medium'
            }`}>
              <div className="prose prose-sm prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) }} />
              {i === 0 && (
                <div className="mt-8 rounded-[2.2rem] overflow-hidden border border-black/[0.02] sharp-shadow bg-slate-50">
                   <img src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80" className="w-full grayscale opacity-90 contrast-[1.1]" />
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex gap-1.5 items-center px-2 opacity-20">
              <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse"></div>
              <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse [animation-delay:0.4s]"></div>
           </div>
        )}
      </div>

      <div className="p-8">
        <div className="bg-[#F8F8FA] rounded-[2.5rem] p-5 border border-black/[0.02] transition-all focus-within:bg-white focus-within:border-black/5">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
            placeholder="给出完整的设计方案..."
            className="w-full bg-transparent px-2 text-[14px] focus:outline-none resize-none h-24 placeholder:text-black/10 text-black font-medium"
          />
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-5">
               <button className="text-[#D1D1D6] hover:text-black transition-colors"><i className="fas fa-paperclip text-sm"></i></button>
               <button className="text-[#D1D1D6] hover:text-black transition-colors"><i className="fas fa-at text-sm"></i></button>
               <button className="w-8 h-8 rounded-full bg-white text-black/20 border border-black/[0.03] flex items-center justify-center hover:text-blue-600 transition-colors">
                 <i className="fas fa-wand-magic-sparkles text-[10px]"></i>
               </button>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-4 px-4 py-2 rounded-full bg-white border border-black/[0.03] text-[#D1D1D6]">
                 <i className="fas fa-lightbulb text-[11px] hover:text-amber-400"></i>
                 <i className="fas fa-bolt text-[11px] hover:text-blue-500"></i>
                 <i className="fas fa-globe text-[11px] hover:text-black"></i>
                 <i className="fas fa-cube text-[11px] hover:text-black"></i>
               </div>
               <button 
                 onClick={handleSend}
                 className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center hover:scale-105 transition-all"
               >
                 <i className="fas fa-arrow-up text-[12px]"></i>
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentSidebar;
