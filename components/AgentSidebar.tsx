
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
    { 
      role: 'assistant', 
      content: `你好！我是你的AI 导演。
无论是编写剧本、设计角色，还是生成电影分镜和动态片段，我都能协助你将灵感转化为现实。
今天你想讲一个什么样的故事？我们可以从一个简单的创意或画面开始。` 
    }
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
      className={`w-9 h-9 rounded-[10px] flex items-center justify-center text-[#ADB5BD] hover:bg-[#F0F2F5] hover:text-[#1A1C1E] transition-all duration-200 ${className}`}
    >
      <i className={`${icon} text-[16px]`}></i>
    </button>
  );

  return (
    <div className="h-full flex flex-col bg-white border border-[#E9ECEF] rounded-[2.5rem] sharp-shadow overflow-hidden relative">
      {/* Header: 精准复刻图标组 */}
      <header className="px-10 py-7 flex items-center justify-between">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.4em] text-[#ADB5BD]">Workspace</h2>
        <div className="flex gap-1 items-center">
           <IconButton icon="fa-regular fa-square-plus" />
           <IconButton icon="fa-solid fa-sliders" />
           <IconButton icon="fa-solid fa-share-nodes" />
           <IconButton icon="fa-regular fa-clone" />
           <IconButton icon="fa-solid fa-arrow-up-right-from-square" className="!text-[14px]" />
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-10 py-4 space-y-12 scroll-smooth custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            {/* 头像与角色名 */}
            <div className="flex items-center gap-3 mb-4">
               {msg.role === 'assistant' && (
                 <div className="w-7 h-7 bg-black rounded-full flex items-center justify-center text-[10px] text-white font-black">L</div>
               )}
               <span className="text-[10px] font-black text-[#ADB5BD] uppercase tracking-[0.2em]">
                 {msg.role === 'assistant' ? 'Lovart Assistant' : 'User'}
               </span>
            </div>
            
            {/* 消息正文 */}
            <div className={`text-[15px] leading-[1.8] w-full ${
              msg.role === 'user' 
                ? 'bg-[#F8F9FA] px-7 py-5 rounded-[1.8rem] rounded-tr-none text-black font-medium' 
                : 'text-black font-medium'
            }`}>
              <div className="prose prose-slate max-w-none prose-p:my-2 prose-headings:mb-4" dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) }} />
              
              {/* 图片展示 */}
              {i === 1 && (
                <div className="mt-6 rounded-[1.8rem] overflow-hidden border border-[#E9ECEF] sharp-shadow">
                   <img 
                    src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80" 
                    className="w-full grayscale opacity-80 mix-blend-multiply contrast-[1.1]" 
                    alt="Cinema Scene"
                   />
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex gap-2 items-center px-4 opacity-30">
              <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:0.2s]"></div>
           </div>
        )}
      </div>

      {/* Input Area: 气泡式设计复刻 */}
      <div className="p-8">
        <div className="bg-[#F8F9FA] rounded-[2.5rem] p-6 border border-transparent transition-all focus-within:bg-white focus-within:border-[#E9ECEF] focus-within:shadow-2xl">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
            placeholder="给出完整的设计..."
            className="w-full bg-transparent px-2 text-[15px] focus:outline-none resize-none h-24 placeholder:text-[#ADB5BD] text-black font-medium"
          />
          
          <div className="flex items-center justify-between mt-4">
            {/* 左侧：附件与增强 */}
            <div className="flex items-center gap-1">
               <IconButton icon="fa-solid fa-paperclip" className="!w-9 !h-9 !text-[#ADB5BD]" />
               <IconButton icon="fa-solid fa-at" className="!w-9 !h-9 !text-[#ADB5BD]" />
               <button className="w-9 h-9 rounded-[10px] bg-white flex items-center justify-center text-[#0066FF] hover:bg-[#F0F2F5] transition-all border border-black/[0.03] ml-2">
                 <i className="fa-solid fa-sparkles text-[14px]"></i>
               </button>
            </div>

            {/* 右侧：工具胶囊与发送 */}
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white border border-black/[0.03]">
                 <IconButton icon="fa-solid fa-lightbulb" className="!w-8 !h-8 !text-[14px] !text-[#ADB5BD]" />
                 <IconButton icon="fa-solid fa-bolt" className="!w-8 !h-8 !text-[14px] !text-[#ADB5BD]" />
                 <IconButton icon="fa-solid fa-globe" className="!w-8 !h-8 !text-[14px] !text-[#ADB5BD]" />
                 <IconButton icon="fa-solid fa-cube" className="!w-8 !h-8 !text-[14px] !text-[#ADB5BD]" />
               </div>
               
               <button 
                 onClick={handleSend}
                 className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center hover:scale-105 transition-all shadow-xl active:scale-95"
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
