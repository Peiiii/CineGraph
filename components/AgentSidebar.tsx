
import React, { useState, useRef, useEffect } from 'react';
import { Asset, AssetType } from '../types';
import { GeminiService } from '../services/geminiService';
import { marked } from 'marked';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isExecuting?: boolean;
  toolInfo?: string;
}

const AgentSidebar: React.FC<{ contextAssets: Asset[], onAddAsset: (a: Asset) => void }> = ({ contextAssets, onAddAsset }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '你好，我是你的 AI 导演。你可以让我帮你写剧本、设计角色或直接生成分镜片段。' }
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
      const response = await GeminiService.chatWithAgent(userMsg, contextAssets);
      
      // 1. 处理工具调用 (Cursor-like behavior)
      if (response.functionCalls && response.functionCalls.length > 0) {
        for (const call of response.functionCalls) {
          const { name, args } = call;
          
          // 显示执行状态
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: `正在执行任务: ${name}...`, 
            isExecuting: true,
            toolInfo: JSON.stringify(args)
          }]);

          try {
            let newAsset: Asset | null = null;

            if (name === 'create_visual_shot') {
              const dataUrl = await GeminiService.generateImage(args.prompt as string);
              newAsset = {
                id: Math.random().toString(36).substr(2, 9),
                type: 'image',
                content: dataUrl,
                title: args.title as string || 'AI 生成分镜',
                createdAt: Date.now()
              };
            } else if (name === 'animate_scene') {
              // 寻找参考图
              const ref = contextAssets.find(a => a.id === args.reference_asset_id) || contextAssets.find(a => a.type === 'image');
              const videoUrl = await GeminiService.generateVideo(args.prompt as string, ref?.content);
              newAsset = {
                id: Math.random().toString(36).substr(2, 9),
                type: 'video',
                content: videoUrl,
                title: 'AI 动态片段',
                createdAt: Date.now()
              };
            } else if (name === 'write_creative_asset') {
              newAsset = {
                id: Math.random().toString(36).substr(2, 9),
                type: (args.type as AssetType) || 'text',
                content: args.content as string,
                title: args.title as string,
                createdAt: Date.now()
              };
            }

            if (newAsset) {
              onAddAsset(newAsset);
              // 更新消息，告知已完成
              setMessages(prev => {
                const last = prev[prev.length - 1];
                return [...prev.slice(0, -1), { ...last, isExecuting: false, content: `✨ 已成功创建：${newAsset?.title}` }];
              });
            }
          } catch (err) {
            console.error("Tool execution failed:", err);
            setMessages(prev => [...prev, { role: 'assistant', content: `❌ 执行工具 ${name} 时出错。` }]);
          }
        }
      }

      // 2. 显示模型的文本回复
      if (response.text) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.text! }]);
      }

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
      <header className="px-6 py-4 flex items-center justify-between border-b border-[#F8F9FA]">
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
           <span className="text-[10px] font-bold text-[#ADB5BD] uppercase tracking-widest">Director Mode</span>
        </div>
        <div className="flex gap-0.5 items-center">
           <IconButton icon="fa-solid fa-sliders" />
           <IconButton icon="fa-solid fa-share-nodes" />
           <IconButton icon="fa-solid fa-arrow-up-right-from-square" className="!text-[12px]" />
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scroll-smooth custom-scrollbar">
        {messages.map((msg, i) => (
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
                ? 'bg-[#F8F9FA] px-4 py-3 rounded-[1.2rem] rounded-tr-none text-black' 
                : msg.isExecuting 
                  ? 'bg-blue-50/50 border border-blue-100 px-4 py-3 rounded-[1rem] text-blue-600 italic flex items-center gap-3'
                  : 'text-black font-medium'
            }`}>
              {msg.isExecuting && <i className="fa-solid fa-circle-notch animate-spin text-[10px]"></i>}
              <div className="prose prose-sm prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) }} />
            </div>
          </div>
        ))}
        {isTyping && !messages[messages.length-1]?.isExecuting && (
           <div className="flex gap-1.5 items-center px-4 opacity-30">
              <div className="w-1 h-1 bg-black rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-black rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1 h-1 bg-black rounded-full animate-bounce [animation-delay:0.4s]"></div>
           </div>
        )}
      </div>

      <div className="px-5 pb-5 pt-2">
        <div className="bg-[#F8F9FA] rounded-[1.5rem] p-4 border border-transparent focus-within:bg-white focus-within:border-[#E9ECEF] transition-all duration-300">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
            placeholder="下达创作指令..."
            className="w-full bg-transparent px-1 text-[13px] focus:outline-none resize-none h-12 placeholder:text-[#ADB5BD] text-black font-medium"
          />
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-0.5">
               <IconButton icon="fa-solid fa-paperclip" />
               <IconButton icon="fa-solid fa-at" />
               <button className="w-7 h-7 rounded-[7px] flex items-center justify-center text-[#0066FF] hover:bg-[#F0F2F5] transition-all">
                 <i className="fa-solid fa-wand-magic-sparkles text-[12px]"></i>
               </button>
            </div>
            <button 
              onClick={handleSend}
              disabled={isTyping}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-sm ${isTyping ? 'bg-gray-200 cursor-not-allowed' : 'bg-black text-white hover:bg-zinc-800'}`}
            >
              <i className="fa-solid fa-arrow-up text-[12px]"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentSidebar;
