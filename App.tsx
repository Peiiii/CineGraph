
import React, { useState } from 'react';
import AssetCard from './components/AssetCard';
import AgentSidebar from './components/AgentSidebar';
import { Asset } from './types';

const App: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'all' | 'media' | 'video' | 'text' | 'scenes'>('all');

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const filteredAssets = assets.filter(a => {
    if (activeTab === 'all') return true;
    if (activeTab === 'media') return a.type === 'image';
    if (activeTab === 'video') return a.type === 'video';
    if (activeTab === 'text') return a.type === 'text';
    if (activeTab === 'scenes') return a.type === 'scene';
    return true;
  });

  return (
    <div className="relative h-screen w-screen bg-[#F8F9FA] overflow-hidden font-['Plus_Jakarta_Sans']">
      
      {/* 极细网格背景 */}
      <div className="absolute inset-0 canvas-dot-grid opacity-[0.2] pointer-events-none"></div>

      {/* Top Left: Logo & Project Name */}
      <div className="absolute top-6 left-8 z-50 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shadow-xl">
          <i className="fa-solid fa-clapperboard text-[14px] text-white"></i>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-bold text-black tracking-tight">未命名项目</span>
          <i className="fas fa-chevron-down text-[10px] text-[#ADB5BD]"></i>
        </div>
      </div>

      {/* Top Right: Zoom Control - 与 Lovart 一致的半透明胶囊 */}
      <div className="absolute top-6 right-[510px] z-50 flex items-center bg-white/80 backdrop-blur-md border border-[#E9ECEF] rounded-full px-1 py-1 sharp-shadow">
        <button className="w-8 h-8 text-[#ADB5BD] hover:bg-black/5 rounded-full transition-all flex items-center justify-center">
          <i className="fas fa-minus text-[10px]"></i>
        </button>
        <span className="text-[11px] font-bold text-black px-4">25%</span>
        <button className="w-8 h-8 text-[#ADB5BD] hover:bg-black/5 rounded-full transition-all flex items-center justify-center">
          <i className="fas fa-plus text-[10px]"></i>
        </button>
      </div>

      {/* Left Sidebar: 悬浮工具栏 */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 w-[62px] flex flex-col items-center py-6 bg-white border border-[#E9ECEF] rounded-[2.5rem] sharp-shadow z-50 gap-2">
        {[
          { id: 'all', icon: 'fa-solid fa-location-arrow', rot: '-rotate-45' },
          { id: 'add', icon: 'fa-solid fa-plus' },
          { id: 'scenes', icon: 'fa-regular fa-square' },
          { id: 'text', icon: 'fa-solid fa-t' },
          { id: 'pen', icon: 'fa-solid fa-marker' },
          { id: 'sep', isSep: true },
          { id: 'media', icon: 'fa-regular fa-image', ai: true },
          { id: 'video', icon: 'fa-solid fa-clapperboard', ai: true },
        ].map((item: any) => (
          item.isSep ? (
            <div key={item.id} className="w-7 h-[1px] bg-[#F0F2F5] my-2"></div>
          ) : (
            <button 
              key={item.id}
              onClick={() => item.id !== 'add' && item.id !== 'pen' && setActiveTab(item.id)}
              className={`w-11 h-11 rounded-[14px] flex items-center justify-center transition-all relative ${
                activeTab === item.id ? 'bg-[#F0F2F5] text-black' : 'text-[#ADB5BD] hover:bg-[#F0F2F5] hover:text-[#1A1C1E]'
              }`}
            >
              <i className={`${item.icon} text-[18px] ${item.rot || ''}`}></i>
              {item.ai && <i className="fa-solid fa-sparkles text-[6px] absolute top-2.5 right-2.5 text-[#0066FF]"></i>}
            </button>
          )
        ))}
      </div>

      {/* Bottom Left: Layers & Credits */}
      <div className="absolute bottom-8 left-8 z-50 flex items-center gap-6">
        <button className="w-9 h-9 rounded-[12px] bg-white border border-[#E9ECEF] flex items-center justify-center text-[#ADB5BD] hover:text-black sharp-shadow transition-all">
          <i className="fa-solid fa-layer-group text-[14px]"></i>
        </button>
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-[11px] text-white font-black shadow-lg">W</div>
           <div className="flex items-center gap-2 text-[11px] font-black text-[#8E8E93]">
             <i className="fas fa-bolt text-amber-400"></i> 88
           </div>
        </div>
      </div>

      {/* Main Canvas */}
      <main className="absolute inset-0 overflow-auto p-40 custom-scrollbar">
        {assets.length === 0 ? (
          <div className="h-full flex items-center justify-center select-none pointer-events-none opacity-[0.03]">
             <div className="text-center">
                <i className="fa-solid fa-clapperboard text-[140px] mb-8"></i>
                <p className="text-[12px] font-black uppercase tracking-[1.5em]">Director is waiting...</p>
             </div>
          </div>
        ) : (
          <div className="relative w-full h-full flex flex-wrap gap-24 items-start justify-center">
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

      {/* Agent Panel - Lovart Style (480px width for better spacing) */}
      <div className="absolute right-8 top-6 bottom-8 w-[480px] z-50">
        <AgentSidebar 
          contextAssets={assets.filter(a => selectedIds.has(a.id))} 
          onAddAsset={(a) => setAssets(prev => [a, ...prev])}
        />
      </div>
    </div>
  );
};

export default App;
