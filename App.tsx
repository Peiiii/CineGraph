
import React, { useState, useEffect } from 'react';
import AssetCard from './components/AssetCard';
import AgentSidebar from './components/AgentSidebar';
import { Asset } from './types';

const App: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'all' | 'drawing' | 'scenes' | 'text' | 'pen' | 'media' | 'video'>('all');

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
    <div className="flex h-screen w-screen p-6 gap-8 bg-[#F8F9FA]">
      
      {/* 精确复刻左侧工具栏 */}
      <div className="w-[72px] flex flex-col items-center py-8 bg-white border border-[#E9ECEF] rounded-[2.8rem] sharp-shadow z-50">
        <nav className="flex flex-col items-center w-full gap-3">
          {/* 选择 */}
          <button 
            onClick={() => setActiveTab('all')}
            className={`w-12 h-12 rounded-[16px] flex items-center justify-center transition-all ${
              activeTab === 'all' ? 'bg-[#F0F2F5] text-black shadow-inner' : 'text-[#ADB5BD] hover:bg-[#F8F9FA] hover:text-black'
            }`}
          >
            <i className="fa-solid fa-location-arrow text-[18px] -rotate-45 -translate-x-0.5"></i>
          </button>

          <div className="h-4"></div>

          {/* 加号按钮 */}
          <button className="w-12 h-12 flex items-center justify-center text-[#ADB5BD] hover:text-black transition-colors">
            <i className="fa-regular fa-square-plus text-[22px]"></i>
          </button>

          {/* 场景按钮 */}
          <button 
            onClick={() => setActiveTab('scenes')}
            className={`w-12 h-12 rounded-[16px] flex items-center justify-center transition-all ${
              activeTab === 'scenes' ? 'bg-[#F0F2F5] text-black' : 'text-[#ADB5BD] hover:bg-[#F8F9FA]'
            }`}
          >
            <i className="fa-regular fa-square text-[20px]"></i>
          </button>

          {/* 文字按钮 */}
          <button 
            onClick={() => setActiveTab('text')}
            className={`w-12 h-12 rounded-[16px] flex items-center justify-center transition-all ${
              activeTab === 'text' ? 'bg-[#F0F2F5] text-black' : 'text-[#ADB5BD] hover:bg-[#F8F9FA]'
            }`}
          >
            <i className="fa-solid fa-t text-[18px]"></i>
          </button>

          {/* 笔刷 */}
          <button className="w-12 h-12 flex items-center justify-center text-[#ADB5BD] hover:text-black transition-colors">
            <i className="fa-solid fa-marker text-[18px] rotate-180"></i>
          </button>

          <div className="w-9 h-[1px] bg-[#E9ECEF] my-5"></div>

          {/* 核心 AI 生成能力 */}
          <button 
            onClick={() => setActiveTab('media')}
            className={`w-12 h-12 rounded-[16px] flex items-center justify-center transition-all relative ${
              activeTab === 'media' ? 'bg-[#F0F2F5] text-[#0066FF]' : 'text-[#ADB5BD] hover:bg-[#F8F9FA]'
            }`}
          >
            <i className="fa-regular fa-image text-[20px]"></i>
            <i className="fa-solid fa-sparkles text-[8px] absolute top-3 right-3 text-[#0066FF]"></i>
          </button>

          <button 
            onClick={() => setActiveTab('video')}
            className={`w-12 h-12 rounded-[16px] flex items-center justify-center transition-all relative ${
              activeTab === 'video' ? 'bg-[#F0F2F5] text-[#0066FF]' : 'text-[#ADB5BD] hover:bg-[#F8F9FA]'
            }`}
          >
            <i className="fa-solid fa-clapperboard text-[20px]"></i>
            <i className="fa-solid fa-sparkles text-[8px] absolute top-3 right-3 text-[#0066FF]"></i>
          </button>
        </nav>
        
        <div className="flex-1"></div>
        
        <div className="flex flex-col gap-6 items-center">
           <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-[12px] text-white font-black shadow-lg">W</div>
           <div className="flex items-center gap-1.5 text-[10px] font-black text-[#ADB5BD]">
             <i className="fas fa-bolt text-amber-400"></i> 88
           </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 flex items-center justify-between px-2 mb-2">
          <div className="flex items-center gap-5 cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform">
              <i className="fas fa-chevron-down text-[10px] text-white"></i>
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ADB5BD] mb-0.5">Production</p>
               <h1 className="text-[16px] font-bold text-black tracking-tight">Project / Lovart-Story-01</h1>
            </div>
          </div>

          <div className="flex items-center bg-white border border-[#E9ECEF] rounded-full px-3 py-2 sharp-shadow">
            <button className="w-9 h-9 text-[#ADB5BD] hover:text-black transition-colors"><i className="fas fa-minus text-[11px]"></i></button>
            <span className="text-[12px] font-bold text-black px-8">100%</span>
            <button className="w-9 h-9 text-[#ADB5BD] hover:text-black transition-colors"><i className="fas fa-plus text-[11px]"></i></button>
          </div>
        </header>

        <main className="flex-1 bg-white border border-[#E9ECEF] rounded-[3.5rem] sharp-shadow overflow-y-auto p-20 custom-scrollbar relative">
          {assets.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-[0.03] pointer-events-none">
               <i className="fa-solid fa-layer-group text-[160px] mb-10"></i>
               <p className="text-[14px] font-black tracking-[2em] uppercase">Ready for Creation</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-20">
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
        .fa-sparkles { filter: drop-shadow(0 0 2px rgba(0,102,255,0.4)); }
      `}</style>
    </div>
  );
};

export default App;
