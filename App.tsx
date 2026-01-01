
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
    <div className="flex h-screen w-screen p-5 gap-5 bg-[#F4F4F7]">
      
      {/* 极简左侧悬浮导航 */}
      <div className="w-16 flex flex-col items-center py-8 bg-white border border-black/[0.02] rounded-[2rem] z-50">
        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mb-12 hover:scale-105 transition-transform cursor-pointer">
          <div className="w-4 h-4 bg-white rounded-sm rotate-45"></div>
        </div>
        
        <nav className="flex flex-col gap-9 flex-1">
          {[
            { id: 'all', icon: 'fa-location-arrow' },
            { id: 'drawing', icon: 'fa-plus' },
            { id: 'scenes', icon: 'fa-square' },
            { id: 'text', icon: 'fa-t' },
            { id: 'pen', icon: 'fa-pen-nib' },
            { id: 'media', icon: 'fa-image' },
            { id: 'video', icon: 'fa-clapperboard' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                activeTab === tab.id ? 'bg-black text-white shadow-lg' : 'text-[#D1D1D6] hover:text-black'
              }`}
            >
              <i className={`fas ${tab.icon} text-[14px]`}></i>
            </button>
          ))}
        </nav>
        
        <div className="flex flex-col gap-5 items-center">
           <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-black/30 font-black">W</div>
           <div className="flex items-center gap-1.5 text-[10px] font-black text-black/10">
             <i className="fas fa-bolt"></i> 88
           </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-4 mb-2">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
              <i className="fas fa-chevron-down text-[8px] text-white"></i>
            </div>
            <span className="text-[13px] font-black uppercase tracking-widest text-black">CineGraph / Project</span>
          </div>

          <div className="flex items-center bg-white border border-black/[0.02] rounded-full px-2 py-1.5 sharp-shadow">
            <button className="w-8 h-8 text-[#D1D1D6] hover:text-black transition-colors"><i className="fas fa-minus text-[10px]"></i></button>
            <span className="text-[11px] font-black text-black px-5 tracking-tighter">33%</span>
            <button className="w-8 h-8 text-[#D1D1D6] hover:text-black transition-colors"><i className="fas fa-plus text-[10px]"></i></button>
          </div>
        </header>

        <main className="flex-1 bg-white border border-black/[0.02] rounded-[3rem] sharp-shadow overflow-y-auto p-16 custom-scrollbar">
          {assets.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-[0.03]">
               <i className="fas fa-clapperboard text-[120px] mb-8"></i>
               <p className="text-[12px] font-black tracking-[1.2em] uppercase">Lovart Studio</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-16">
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

      <AgentSidebar 
        contextAssets={assets.filter(a => selectedIds.has(a.id))} 
        onAddAsset={(a) => setAssets(prev => [a, ...prev])}
      />
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
      `}</style>
    </div>
  );
};

export default App;
