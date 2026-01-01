
import React, { useState, useEffect } from 'react';
import AssetCard from './components/AssetCard';
import AgentSidebar from './components/AgentSidebar';
import { Asset } from './types';

const App: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'all' | 'characters' | 'scenes' | 'shots'>('all');
  const [isVeoAuthorized, setIsVeoAuthorized] = useState(false);

  useEffect(() => {
    const checkVeoAuth = async () => {
      if (window.aistudio) {
        const authorized = await window.aistudio.hasSelectedApiKey();
        setIsVeoAuthorized(authorized);
      }
    };
    checkVeoAuth();
  }, []);

  const handleOpenKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setIsVeoAuthorized(true);
    }
  };

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const addAsset = (asset: Asset) => {
    setAssets(prev => [asset, ...prev]);
  };

  const removeAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const filteredAssets = assets.filter(a => {
    if (activeTab === 'all') return true;
    if (activeTab === 'characters') return a.type === 'character';
    if (activeTab === 'scenes') return a.type === 'scene';
    if (activeTab === 'shots') return a.type === 'image' || a.type === 'video';
    return true;
  });

  const contextAssets = assets.filter(a => selectedIds.has(a.id));

  return (
    <div className="flex h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans selection:bg-violet-500/30">
      {/* 左侧紧凑导航栏 */}
      <div className="w-16 md:w-20 flex flex-col items-center py-6 md:py-8 border-r border-zinc-900 bg-black/40 flex-shrink-0">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center mb-8 md:mb-12 shadow-2xl shadow-violet-500/30 border border-violet-400/20">
          <i className="fas fa-film text-lg md:text-xl text-white"></i>
        </div>
        
        <nav className="flex flex-col gap-6 md:gap-8 flex-1">
          {[
            { id: 'all', icon: 'fa-layer-group', tip: '全部资产' },
            { id: 'characters', icon: 'fa-id-badge', tip: '角色原型' },
            { id: 'scenes', icon: 'fa-mountain-sun', tip: '场景设定' },
            { id: 'shots', icon: 'fa-clapperboard', tip: '视觉镜头' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`group relative w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-300 ${
                activeTab === tab.id 
                ? 'bg-violet-600/20 text-violet-400' 
                : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900'
              }`}
            >
              <i className={`fas ${tab.icon} text-base md:text-lg`}></i>
              <div className="absolute left-16 opacity-0 group-hover:opacity-100 bg-zinc-800 text-white text-[10px] px-2 py-1 rounded pointer-events-none transition-opacity whitespace-nowrap z-50 hidden md:block">
                {tab.tip}
              </div>
            </button>
          ))}
        </nav>

        <div className="flex flex-col gap-4 md:gap-6">
          {!isVeoAuthorized && (
             <button 
              onClick={handleOpenKey}
              className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-all border border-amber-500/30"
            >
              <i className="fas fa-bolt"></i>
            </button>
          )}
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-zinc-300 cursor-pointer">
             <i className="fas fa-cog text-sm"></i>
          </div>
        </div>
      </div>

      {/* 中央主画布 */}
      <div className="flex-1 flex flex-col relative min-w-0 overflow-hidden">
        {/* 自适应 Header */}
        <header className="h-20 px-4 md:px-10 flex items-center justify-between bg-black/20 backdrop-blur-xl border-b border-zinc-900/50 z-20 shrink-0">
          <div className="flex items-center gap-4 min-w-0 mr-4">
            <div className="flex flex-col min-w-0">
              <h1 className="text-[10px] font-black tracking-[0.3em] text-zinc-600 uppercase truncate">Production Workspace</h1>
              <div className="flex items-center gap-2 mt-0.5 min-w-0">
                <span className="text-base md:text-lg font-bold text-white truncate">霓虹阴影：核心剧本</span>
                <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] text-zinc-500 font-mono shrink-0">V.04</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6 shrink-0">
             <div className="hidden sm:flex items-center gap-3 bg-zinc-900/40 border border-white/5 rounded-2xl px-3 py-2">
                <div className="flex -space-x-1.5 shrink-0">
                   <div className="w-5 h-5 rounded-full bg-violet-600 border border-black text-[8px] flex items-center justify-center font-black">G</div>
                   <div className="w-5 h-5 rounded-full bg-fuchsia-600 border border-black text-[8px] flex items-center justify-center font-black">V</div>
                </div>
                <div className="h-3 w-px bg-zinc-800 hidden md:block"></div>
                <div className="items-center gap-2 hidden md:flex">
                   <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                   <span className="text-[9px] font-bold text-zinc-400 uppercase whitespace-nowrap">Dual Engine Active</span>
                </div>
             </div>
             <button className="h-9 px-4 md:px-6 bg-white text-black text-[10px] font-black uppercase tracking-[0.1em] rounded-xl hover:bg-zinc-200 transition-all shadow-xl shadow-white/5 whitespace-nowrap">
                Export
             </button>
          </div>
        </header>

        {/* 画布主内容 */}
        <main className="flex-1 overflow-y-auto p-4 md:p-10 bg-[radial-gradient(circle_at_20%_20%,_rgba(139,92,246,0.02)_0%,_transparent_50%)] bg-zinc-950">
          {assets.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40 p-6">
              <div className="w-16 h-16 md:w-24 md:h-24 rounded-full border border-zinc-800 flex items-center justify-center text-2xl md:text-3xl mb-6">
                <i className="fas fa-plus"></i>
              </div>
              <p className="text-sm font-light tracking-wide max-w-xs">画布为空。在右侧 Assistant 对话框中输入您的创作灵感。</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-8">
              {filteredAssets.map(asset => (
                <AssetCard 
                  key={asset.id} 
                  asset={asset} 
                  selected={selectedIds.has(asset.id)}
                  onSelect={toggleSelection}
                  onRemove={removeAsset}
                />
              ))}
            </div>
          )}
        </main>
        
        {/* 上下文提示条 */}
        {selectedIds.size > 0 && (
          <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex items-center bg-zinc-900/95 backdrop-blur-2xl border border-violet-500/40 rounded-full px-4 md:px-6 py-2.5 md:py-3 shadow-2xl z-30 animate-in slide-in-from-bottom-10 whitespace-nowrap">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-violet-600 flex items-center justify-center text-[8px] md:text-[10px] font-bold">{selectedIds.size}</div>
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-violet-100">Context Active</span>
            </div>
            <div className="w-px h-3 md:h-4 bg-zinc-800 mx-3 md:mx-4"></div>
            <button onClick={() => setSelectedIds(new Set())} className="text-[9px] md:text-[10px] font-bold text-zinc-500 hover:text-white uppercase transition-colors">Clear</button>
          </div>
        )}
      </div>

      {/* 右侧 Agent 边栏 - 自适应宽度 */}
      <AgentSidebar 
        contextAssets={contextAssets} 
        onAddAsset={addAsset}
      />
    </div>
  );
};

export default App;
