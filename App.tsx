
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
    <div className="flex h-screen w-screen p-5 gap-6 bg-[#F8F9FA]">
      
      {/* 完全复刻参考图的左侧工具栏 */}
      <div className="w-[68px] flex flex-col items-center py-6 bg-white border border-[#E9ECEF] rounded-[2.5rem] sharp-shadow z-50">
        <nav className="flex flex-col items-center w-full gap-2">
          {/* 导航/选择 */}
          <button 
            onClick={() => setActiveTab('all')}
            className={`w-12 h-12 rounded-[14px] flex items-center justify-center transition-all ${
              activeTab === 'all' ? 'bg-[#E9ECEF] text-[#1A1C1E]' : 'text-[#343A40] hover:bg-[#F8F9FA]'
            }`}
          >
            <i className="fa-solid fa-location-arrow text-[18px] -rotate-45 -translate-x-0.5 translate-y-0.5"></i>
          </button>

          <div className="h-4"></div>

          {/* 添加按钮 */}
          <button className="w-12 h-12 flex items-center justify-center text-[#343A40] hover:text-black transition-colors">
            <i className="fa-regular fa-square-plus text-[20px]"></i>
          </button>

          {/* 场景按钮 */}
          <button 
            onClick={() => setActiveTab('scenes')}
            className={`w-12 h-12 rounded-[14px] flex items-center justify-center transition-all ${
              activeTab === 'scenes' ? 'bg-[#E9ECEF] text-[#1A1C1E]' : 'text-[#343A40] hover:bg-[#F8F9FA]'
            }`}
          >
            <i className="fa-regular fa-square text-[18px]"></i>
          </button>

          {/* 文字按钮 */}
          <button 
            onClick={() => setActiveTab('text')}
            className={`w-12 h-12 rounded-[14px] flex items-center justify-center transition-all ${
              activeTab === 'text' ? 'bg-[#E9ECEF] text-[#1A1C1E]' : 'text-[#343A40] hover:bg-[#F8F9FA]'
            }`}
          >
            <i className="fa-solid fa-t text-[18px]"></i>
          </button>

          {/* 绘图/钢笔 */}
          <button className="w-12 h-12 flex items-center justify-center text-[#343A40] hover:text-black transition-colors">
            <i className="fa-solid fa-marker text-[18px] rotate-180"></i>
          </button>

          {/* 物理分割线 */}
          <div className="w-8 h-[1px] bg-[#E9ECEF] my-4"></div>

          {/* 生图 */}
          <button 
            onClick={() => setActiveTab('media')}
            className={`w-12 h-12 rounded-[14px] flex items-center justify-center transition-all relative ${
              activeTab === 'media' ? 'bg-[#E9ECEF] text-[#1A1C1E]' : 'text-[#343A40] hover:bg-[#F8F9FA]'
            }`}
          >
            <i className="fa-regular fa-image text-[18px]"></i>
            <i className="fa-solid fa-sparkles text-[8px] absolute top-3 right-3 text-[#0066FF]"></i>
          </button>

          {/* 生视频 */}
          <button 
            onClick={() => setActiveTab('video')}
            className={`w-12 h-12 rounded-[14px] flex items-center justify-center transition-all relative ${
              activeTab === 'video' ? 'bg-[#E9ECEF] text-[#1A1C1E]' : 'text-[#343A40] hover:bg-[#F8F9FA]'
            }`}
          >
            <i className="fa-solid fa-clapperboard text-[18px]"></i>
            <i className="fa-solid fa-sparkles text-[8px] absolute top-3 right-3 text-[#0066FF]"></i>
          </button>
        </nav>
        
        <div className="flex-1"></div>
        
        {/* 底部信息 */}
        <div className="flex flex-col gap-6 items-center mb-2">
           <div className="w-9 h-9 rounded-full bg-[#1A1C1E] flex items-center justify-center text-[11px] text-white font-bold">W</div>
           <div className="flex items-center gap-1 text-[10px] font-bold text-[#ADB5BD]">
             <i className="fas fa-bolt text-[#FFD43B]"></i> 88
           </div>
        </div>
      </div>

      {/* 主画布容器 */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-2 mb-2">
          <div className="flex items-center gap-4 cursor-pointer group">
            <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
              <i className="fas fa-chevron-down text-[8px] text-white"></i>
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ADB5BD]">Production</p>
               <h1 className="text-[14px] font-bold text-black">Untitled Project #01</h1>
            </div>
          </div>

          <div className="flex items-center bg-white border border-[#E9ECEF] rounded-full px-2 py-1.5 sharp-shadow">
            <button className="w-8 h-8 text-[#ADB5BD] hover:text-black transition-colors"><i className="fas fa-minus text-[10px]"></i></button>
            <span className="text-[11px] font-bold text-black px-6">100%</span>
            <button className="w-8 h-8 text-[#ADB5BD] hover:text-black transition-colors"><i className="fas fa-plus text-[10px]"></i></button>
          </div>
        </header>

        <main className="flex-1 bg-white border border-[#E9ECEF] rounded-[3rem] sharp-shadow overflow-y-auto p-16 custom-scrollbar relative">
          {assets.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-[0.05] pointer-events-none">
               <i className="fa-solid fa-layer-group text-[120px] mb-8"></i>
               <p className="text-[12px] font-black tracking-[1.5em] uppercase">Empty Workspace</p>
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
        .fa-sparkles { filter: drop-shadow(0 0 2px rgba(0,102,255,0.4)); }
      `}</style>
    </div>
  );
};

export default App;
