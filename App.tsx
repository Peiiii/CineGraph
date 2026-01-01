
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
    <div className="flex h-screen w-screen bg-[#09080c] text-zinc-100 overflow-hidden font-sans selection:bg-purple-500/30">
      {/* 左侧极致胶囊导航 */}
      <div className="w-20 flex flex-col items-center py-8 flex-shrink-0 z-50">
        <div className="w-12 h-12 rounded-[1.5rem] bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center mb-10 shadow-lg shadow-purple-500/20 ring-4 ring-purple-500/10">
          <i className="fas fa-magic text-xl text-white"></i>
        </div>
        
        <nav className="flex flex-col gap-6 flex-1">
          {[
            { id: 'all', icon: 'fa-shapes', tip: '全部' },
            { id: 'characters', icon: 'fa-user-circle', tip: '角色' },
            { id: 'scenes', icon: 'fa-compass', tip: '场景' },
            { id: 'shots', icon: 'fa-film', tip: '镜头' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`group relative w-12 h-12 rounded-[1.2rem] flex items-center justify-center transition-all duration-300 ${
                activeTab === tab.id 
                ? 'bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/30 shadow-xl shadow-purple-500/10' 
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
              }`}
            >
              <i className={`fas ${tab.icon} text-lg`}></i>
              <div className="absolute left-16 opacity-0 group-hover:opacity-100 bg-zinc-800 text-white text-[10px] px-2 py-1 rounded-lg pointer-events-none transition-opacity whitespace-nowrap z-50">
                {tab.tip}
              </div>
            </button>
          ))}
        </nav>

        <div className="flex flex-col gap-6">
          {!isVeoAuthorized && (
             <button 
              onClick={handleOpenKey}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-all border border-purple-500/20"
              title="激活高级引擎"
            >
              <i className="fas fa-bolt"></i>
            </button>
          )}
          <div className="w-12 h-12 rounded-full bg-zinc-900/50 flex items-center justify-center text-zinc-500 hover:text-zinc-300 cursor-pointer border border-white/5">
             <i className="fas fa-fingerprint"></i>
          </div>
        </div>
      </div>

      {/* 中央主画布 */}
      <div className="flex-1 flex flex-col relative min-w-0 overflow-hidden">
        {/* 胶囊 Header - 参考图中设计 */}
        <div className="h-24 px-8 flex items-center justify-center shrink-0 z-20">
          <header className="w-full max-w-5xl h-14 px-6 flex items-center justify-between bg-[#1a181f]/60 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl shadow-black/40">
            <div className="flex items-center gap-4 min-w-0">
               <div className="flex items-center gap-2 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                 <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
                 <span className="text-[10px] font-bold text-purple-200 tracking-wider">PROJECT: NEON_SOUL</span>
               </div>
               <div className="h-4 w-px bg-white/10"></div>
               <h1 className="text-sm font-medium text-zinc-300 truncate">Lovart.ai / Canvas / Draft_04</h1>
            </div>

            <div className="flex items-center gap-4">
               <div className="hidden md:flex items-center -space-x-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-500 border-2 border-[#1a181f] flex items-center justify-center text-[10px] font-bold">G</div>
                  <div className="w-7 h-7 rounded-full bg-purple-500 border-2 border-[#1a181f] flex items-center justify-center text-[10px] font-bold">V</div>
               </div>
               <button className="h-8 px-5 bg-[#e9d5ff] text-[#581c87] text-[10px] font-black uppercase tracking-widest rounded-full hover:brightness-110 transition-all shadow-lg shadow-purple-500/20">
                  Export
               </button>
            </div>
          </header>
        </div>

        {/* 画布主内容 */}
        <main className="flex-1 overflow-y-auto p-8 pt-0 bg-transparent">
          {assets.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-20 h-20 rounded-full bg-purple-500/5 border border-purple-500/20 flex items-center justify-center text-2xl text-purple-500/30 mb-6 backdrop-blur-sm">
                <i className="fas fa-plus"></i>
              </div>
              <p className="text-sm text-zinc-500 font-light tracking-widest">AWAITING CINEMATIC INPUT...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
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
        
        {/* 柔和胶囊上下文提示条 */}
        {selectedIds.size > 0 && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center bg-purple-900/40 backdrop-blur-3xl border border-purple-400/30 rounded-full px-6 py-3 shadow-[0_20px_50px_rgba(139,92,246,0.3)] z-30 animate-in slide-in-from-bottom-5">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-purple-400 text-[#2e1065] flex items-center justify-center text-[10px] font-black">{selectedIds.size}</div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-100">Selection Active</span>
            </div>
            <div className="w-px h-4 bg-purple-400/30 mx-6"></div>
            <button onClick={() => setSelectedIds(new Set())} className="text-[10px] font-bold text-purple-300 hover:text-white uppercase transition-colors">Dismiss</button>
          </div>
        )}
      </div>

      {/* 右侧 Agent 边栏 */}
      <AgentSidebar 
        contextAssets={contextAssets} 
        onAddAsset={addAsset}
      />
    </div>
  );
};

export default App;
