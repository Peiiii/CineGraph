
import React, { useState, useRef, useEffect } from 'react';
import { Asset } from '../types';
import { GeminiService } from '../services/geminiService';
import { marked } from 'marked';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'tool_call' | 'tool_result';
  preview?: string;
}

const AgentSidebar: React.FC<{ contextAssets: Asset[], onAddAsset: (a: Asset) => void }> = ({ contextAssets, onAddAsset }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '### 全新时代的基于碎片化记录...\n碎片化笔记产品概念图' }
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
      if (response.functionCalls) {
        // ... 工具执行逻辑 ...
        setMessages(prev => [...prev, { role: 'assistant', content: '已为您同步新生成的资产。' }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: response.text || '已记录需求。' }]);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `错误: ${err.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="w-[440px] flex flex-col bg-white soft-shadow rounded-[2rem] overflow-hidden z-40 relative">
      {/* 侧边栏头部 */}
      <div className="p-8 pb-4 flex items-center justify-between border-b border-slate-50">
        <h2 className="text-[13px] font-black uppercase tracking-widest text-slate-900">Project Workspace</h2>
        <div className="flex gap-4 text-slate-300">
           <i className="fas fa-plus-circle hover:text-black cursor-pointer"></i>
           <i className="fas fa-sliders hover:text-black cursor-pointer"></i>
           <i className="fas fa-share-nodes hover:text-black cursor-pointer"></i>
           <i className="fas fa-clone hover:text-black cursor-pointer"></i>
        </div>
      </div>

      {/* 消息历史 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6 space-y-10 scroll-smooth">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className="flex items-center gap-3 mb-2">
               {msg.role === 'assistant' && (
                 <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-[10px] text-white font-bold">L</div>
               )}
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 {msg.role === 'assistant' ? 'Lovart Assistant' : 'You'}
               </span>
            </div>
            
            <div className={`text-[14px] leading-relaxed max-w-full ${
              msg.role === 'user' 
                ? 'bg-slate-50 px-6 py-3 rounded-[1.5rem] rounded-tr-none text-slate-700' 
                : 'text-slate-800'
            }`}>
              <div dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) }} />
              {i === 0 && (
                <div className="mt-4 rounded-2xl overflow-hidden soft-shadow">
                   <img src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80" className="w-full grayscale-[0.5] contrast-[1.1]" />
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex gap-1 items-center px-2">
              <span className="w-1 h-1 bg-black rounded-full animate-bounce"></span>
              <span className="w-1 h-1 bg-black rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1 h-1 bg-black rounded-full animate-bounce [animation-delay:0.4s]"></span>
           </div>
        )}
      </div>

      {/* 浮动胶囊输入框 - 参考图底部 */}
      <div className="p-8">
        <div className="bg-[#F2F2F7] rounded-[2rem] p-4 soft-shadow focus-within:ring-1 ring-slate-200 transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
            placeholder="给出完整的设计..."
            className="w-full bg-transparent px-2 text-[14px] focus:outline-none resize-none h-20 placeholder:text-slate-400 text-slate-700 font-medium"
          />
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/40">
            <div className="flex items-center gap-3 text-slate-400">
               <button className="hover:text-black transition-colors"><i className="fas fa-paperclip text-sm"></i></button>
               <button className="hover:text-black transition-colors"><i className="fas fa-at text-sm"></i></button>
               <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                 <i className="fas fa-wand-magic-sparkles text-[10px]"></i>
               </div>
            </div>
            <div className="flex items-center gap-2">
               <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-slate-400 text-[10px] font-bold">
                 <i className="fas fa-lightbulb"></i>
                 <i className="fas fa-bolt"></i>
                 <i className="fas fa-globe"></i>
               </div>
               <button 
                 onClick={handleSend}
                 className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-black transition-all shadow-lg"
               >
                 <i className="fas fa-arrow-up text-[10px]"></i>
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentSidebar;
