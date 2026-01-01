
import React, { useState, useRef, useEffect } from 'react';
import { Asset } from '../types';
import { GeminiService } from '../services/geminiService';
import { marked } from 'marked';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'tool_call' | 'tool_result';
  toolName?: string;
  preview?: string;
}

interface AgentSidebarProps {
  contextAssets: Asset[];
  onAddAsset: (asset: Asset) => void;
}

const AgentSidebar: React.FC<AgentSidebarProps> = ({ contextAssets, onAddAsset }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '您好，导演。电影宇宙已就绪，请输入您的构思。' }
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
      
      if (response.functionCalls && response.functionCalls.length > 0) {
        for (const call of response.functionCalls) {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: `正在编织时空...`, 
            type: 'tool_call', 
            toolName: call.name 
          }]);

          let resultAsset: Asset | null = null;
          let previewData = "";

          if (call.name === 'create_visual_shot') {
            previewData = await GeminiService.executeImageGen(call.args.prompt as string, contextAssets);
            resultAsset = {
              id: Math.random().toString(36).substr(2, 9),
              type: 'image',
              content: previewData,
              title: (call.args.prompt as string).substring(0, 15),
              createdAt: Date.now()
            };
          } else if (call.name === 'animate_scene') {
            previewData = await GeminiService.executeVideoGen(call.args.movement_description as string, contextAssets);
            resultAsset = {
              id: Math.random().toString(36).substr(2, 9),
              type: 'video',
              content: previewData,
              title: '动态分镜',
              createdAt: Date.now()
            };
          } else if (call.name === 'write_story_asset') {
            previewData = call.args.details as string;
            resultAsset = {
              id: Math.random().toString(36).substr(2, 9),
              type: call.args.asset_type as any,
              content: previewData,
              title: (call.args.details as string).substring(0, 10),
              createdAt: Date.now()
            };
          }

          if (resultAsset) {
            onAddAsset(resultAsset);
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: `资产已同步至您的创作画布。`, 
              type: 'tool_result',
              preview: previewData,
              toolName: call.name
            }]);
          }
        }
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: response.text || '我已记录。' }]);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `抱歉，波函数塌缩异常：${err.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMarkdown = (content: string) => {
    const html = marked.parse(content, { breaks: true });
    return { __html: html };
  };

  return (
    <div className="w-[420px] flex flex-col bg-[#131118]/80 backdrop-blur-3xl border-l border-white/5 flex-shrink-0 relative">
      {/* 侧边栏顶部胶囊 */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/30">
             <i className="fas fa-sparkles text-purple-400 text-xs"></i>
          </div>
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-purple-200/80">Cine Agent</h2>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-zinc-800/50 border border-white/5">
           <span className="w-1 h-1 rounded-full bg-green-400"></span>
           <span className="text-[9px] text-zinc-500 font-mono">STABLE</span>
        </div>
      </div>

      {/* 消息列表 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[90%] rounded-[1.5rem] px-5 py-4 text-[13px] leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-purple-600/90 text-white rounded-tr-none shadow-purple-500/20' 
                : 'bg-[#211e27] text-zinc-200 rounded-tl-none border border-white/5'
            }`}>
              {msg.type === 'tool_call' ? (
                <div className="flex items-center gap-2 text-purple-300 font-mono text-[10px]">
                  <i className="fas fa-atom animate-spin-slow"></i>
                  <span>PROCESSING: {msg.toolName}</span>
                </div>
              ) : (
                <div 
                  className="prose prose-invert prose-sm max-w-none markdown-container selection:bg-purple-400/40"
                  dangerouslySetInnerHTML={renderMarkdown(msg.content)} 
                />
              )}

              {msg.preview && (
                <div className="mt-4 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                   {msg.toolName === 'animate_scene' ? (
                     <video src={msg.preview} className="w-full" controls muted loop autoPlay />
                   ) : msg.toolName === 'create_visual_shot' ? (
                     <img src={msg.preview} className="w-full" />
                   ) : (
                     <div className="p-4 text-[11px] text-zinc-400 font-light italic bg-zinc-900/50">{msg.preview}</div>
                   )}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-2 p-3 bg-white/5 rounded-full w-fit ml-2">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
            <div className="w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse [animation-delay:0.4s]"></div>
          </div>
        )}
      </div>

      {/* 输入区域胶囊 */}
      <div className="p-6 border-t border-white/5 bg-[#131118]/50 shrink-0">
        {contextAssets.length > 0 && (
          <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {contextAssets.map(a => (
               <div key={a.id} className="h-7 px-3 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center gap-2 flex-shrink-0 animate-in fade-in zoom-in-95">
                 <i className="fas fa-link text-[8px] text-purple-400"></i>
                 <span className="text-[9px] text-purple-100 font-medium truncate max-w-[80px]">{a.title}</span>
               </div>
            ))}
          </div>
        )}
        <div className="relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
            placeholder="描述您的电影构思..."
            className="w-full bg-[#1a181f]/80 border border-white/10 rounded-[1.8rem] py-4 pl-5 pr-14 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/5 transition-all resize-none h-20 placeholder:text-zinc-600"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-[#e9d5ff] text-[#581c87] flex items-center justify-center hover:scale-110 disabled:grayscale disabled:opacity-30 transition-all shadow-lg"
          >
            <i className="fas fa-paper-plane text-xs"></i>
          </button>
        </div>
      </div>

      <style>{`
        .markdown-container p { margin-bottom: 0.8rem; }
        .markdown-container p:last-child { margin-bottom: 0; }
        .markdown-container h3 { font-size: 14px; font-weight: 800; color: #d8b4fe; margin-top: 1rem; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.1em; }
        .markdown-container blockquote { border-left: 2px solid #a855f7; padding-left: 1rem; color: #a1a1aa; font-style: italic; margin: 1rem 0; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .animate-spin-slow { animation: spin 3s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AgentSidebar;
