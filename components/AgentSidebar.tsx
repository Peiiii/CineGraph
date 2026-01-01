
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
    { role: 'assistant', content: '您好，导演。准备好开始创作了吗？您可以直接告诉我您的构思，或者让我基于选中的资产进行扩展。' }
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
            content: `正在执行任务...`, 
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
              title: '动态镜头',
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
              content: `已成功生成并添加至工作区。`, 
              type: 'tool_result',
              preview: previewData,
              toolName: call.name
            }]);
          }
        }
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: response.text || '我明白您的意思了。' }]);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `抱歉，处理时遇到了问题：${err.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMarkdown = (content: string) => {
    const html = marked.parse(content, { breaks: true });
    return { __html: html };
  };

  return (
    <div className="w-full sm:w-[380px] md:w-[420px] lg:w-[450px] flex flex-col border-l border-zinc-800 bg-zinc-950 flex-shrink-0 relative h-full">
      {/* Header */}
      <div className="p-4 md:p-5 border-b border-zinc-900 flex items-center justify-between bg-black/40 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)]"></div>
          <h2 className="text-xs md:text-sm font-black uppercase tracking-widest text-zinc-300">Cine Assistant</h2>
        </div>
        <div className="text-[10px] text-zinc-600 font-mono">V2.0-TURBO</div>
      </div>

      {/* Message List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 md:space-y-6 scroll-smooth">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[90%] md:max-w-[85%] rounded-2xl p-3 md:p-4 text-[13px] md:text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-violet-600 text-white rounded-tr-none shadow-lg shadow-violet-500/10' 
                : 'bg-zinc-900 text-zinc-300 rounded-tl-none border border-zinc-800'
            }`}>
              {msg.type === 'tool_call' ? (
                <div className="flex items-center gap-2 text-violet-400 font-mono text-[11px]">
                  <i className="fas fa-terminal animate-pulse"></i>
                  <span>Calling: {msg.toolName}()</span>
                </div>
              ) : (
                <div 
                  className="prose prose-invert prose-sm max-w-none markdown-container"
                  dangerouslySetInnerHTML={renderMarkdown(msg.content)} 
                />
              )}

              {msg.preview && (
                <div className="mt-3 rounded-lg overflow-hidden border border-white/10 shadow-inner bg-black">
                   {msg.toolName === 'animate_scene' ? (
                     <video src={msg.preview} className="w-full" controls muted loop autoPlay />
                   ) : msg.toolName === 'create_visual_shot' ? (
                     <img src={msg.preview} className="w-full" />
                   ) : (
                     <div className="p-3 text-xs italic text-zinc-500 line-clamp-3 leading-snug">{msg.preview}</div>
                   )}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-1.5 p-2">
            <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full animate-bounce [animation-delay:0.4s]"></div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 border-t border-zinc-900 bg-black/20 shrink-0">
        {contextAssets.length > 0 && (
          <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {contextAssets.map(a => (
               <div key={a.id} className="h-7 px-2 rounded-lg bg-violet-900/30 border border-violet-500/30 flex items-center gap-2 flex-shrink-0">
                 <i className="fas fa-paperclip text-[9px] text-violet-400"></i>
                 <span className="text-[9px] text-violet-200 truncate max-w-[70px]">{a.title}</span>
               </div>
            ))}
          </div>
        )}
        <div className="relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
            placeholder="描述构思、提出要求或询问建议..."
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-3 md:py-4 pl-4 pr-12 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all resize-none h-20 md:h-24 placeholder:text-zinc-700"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute bottom-3 md:bottom-4 right-3 md:right-4 w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600 transition-all shadow-lg"
          >
            <i className="fas fa-arrow-up text-xs"></i>
          </button>
        </div>
        <p className="text-[9px] text-zinc-600 mt-3 text-center uppercase tracking-widest font-bold">
          Gemini 3 Pro <span className="text-zinc-800 mx-1">|</span> Kinetic Engine
        </p>
      </div>

      <style>{`
        .markdown-container p {
          margin-bottom: 0.75rem;
        }
        .markdown-container p:last-child {
          margin-bottom: 0;
        }
        .markdown-container ul, .markdown-container ol {
          margin-left: 1.25rem;
          margin-bottom: 0.75rem;
        }
        .markdown-container li {
          margin-bottom: 0.25rem;
        }
        .markdown-container code {
          background-color: rgba(255, 255, 255, 0.1);
          padding: 0.1rem 0.3rem;
          border-radius: 0.25rem;
          font-family: monospace;
        }
        .markdown-container h1, .markdown-container h2, .markdown-container h3 {
          font-weight: bold;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        .markdown-container blockquote {
          border-left: 3px solid #6366f1;
          padding-left: 0.75rem;
          color: #a1a1aa;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default AgentSidebar;
