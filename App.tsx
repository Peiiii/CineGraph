
import React, { useState, useEffect } from 'react';
import AssetCard from './components/AssetCard';
import AgentSidebar from './components/AgentSidebar';
import { Asset } from './types';

const App: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'all' | 'characters' | 'scenes' | 'shots'>('all');

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const filteredAssets = assets.filter(a => {
    if (activeTab === 'all') return true;
    if (activeTab === 'characters') return a.type === 'character';
    if (activeTab === 'scenes') return a.type === 'scene';
    if (activeTab === 'shots') return a.type === 'image' || a.type === 'video';
    return true;
  });

  return (
    <div className="flex h-screen w-screen p-6 gap-6 relative">
      
      {/* 浮动侧边导航 - 参考图左侧 */}
      <div className="w-16 flex flex-col items-center py-8 bg-white soft-shadow rounded-[2rem] z-50">
        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mb-10">
          <div className="w-4 h-4 bg-white rounded-sm rotate-45"></div>
        </div>
        
        <nav className="flex flex-col gap-8 flex-1">
          {[
            { id: 'all', icon: 'fa-play' },
            { id: 'characters', icon: 'fa-plus' },
            { id: 'scenes', icon: 'fa-square' },
            { id: 'shots', icon: 'fa-t' },
            { id: 'drawing', icon: 'fa-pen-nib' },
            { id: 'media', icon: 'fa-image' },
            { id: 'video', icon: 'fa-film' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                activeTab === tab.id ? 'bg-slate-50 text-black' : 'text-slate-300 hover:text-slate-500'
              }`}
            >
              <i className={`fas ${tab.icon} text-sm`}></i>
            </button>
          ))}
        </nav>
        
        <div className="mt-auto flex flex-col gap-4 items-center">
           <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">W</div>
           <div className="flex items-center gap-1 text-[10px] font-black text-slate-400">
             <i className="fas fa-bolt text-[8px]"></i> 88
           </div>
        </div>
      </div>

      {/* 中央主区 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部工具栏 - 参考图顶部 */}
        <div className="h-16 flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-white soft-shadow flex items-center justify-center">
                <i className="fas fa-chevron-down text-[10px]"></i>
              </div>
              <span className="text-sm font-bold text-slate-900">未命名</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white soft-shadow rounded-full px-4 py-2">
            <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-black">
              <i className="fas fa-minus text-[10px]"></i>
            </button>
            <span className="text-[11px] font-black text-slate-800 w-12 text-center">33%</span>
            <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-black">
              <i className="fas fa-plus text-[10px]"></i>
            </button>
          </div>
        </div>

        {/* 画布 */}
        <main className="flex-1 overflow-y-auto rounded-[3rem] bg-white soft-shadow p-12 relative">
          {assets.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-10">
               <i className="fas fa-clapperboard text-8xl mb-6"></i>
               <p className="text-xs font-black tracking-[0.8em] uppercase">Studio Canvas Ready</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAssets.map(asset => (
                <AssetCard 
                  key={asset.id} 
                  asset={asset} 
                  selected={selectedIds.has(asset.id)}
                  onSelect={toggleSelection}
                  onRemove={(id) => setAssets(prev => prev.filter(a => a.id !== id))}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* 右侧 Agent 边栏 */}
      <AgentSidebar 
        contextAssets={assets.filter(a => selectedIds.has(a.id))} 
        onAddAsset={(a) => setAssets(prev => [a, ...prev])}
      />
    </div>
  );
};

export default App;
