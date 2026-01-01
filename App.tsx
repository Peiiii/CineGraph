
import React, { useState } from 'react';
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
    <div className="relative h-screen w-screen bg-[#F8F9FA] overflow-hidden font-['Plus_Jakarta_Sans']">
      
      {/* 背景画布：带有极淡的网格点 */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.4]" 
           style={{backgroundImage: 'radial-gradient(#CED4DA 0.5px, transparent 0.5px)', backgroundSize: '32px 32px'}}>
      </div>

      {/* 左上角：项目信息 */}
      <div className="absolute top-6 left-6 z-50 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shadow-lg cursor-pointer">
          <i className="fas fa-chevron-down text-[10px] text-white"></i>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-bold text-black">未命名</span>
        </div>
      </div>

      {/* 右上角：缩放控制 */}
      <div className="absolute top-6 right-[464px] z-50 flex items-center bg-white border border-[#E9ECEF] rounded-full px-2 py-1 sharp-shadow">
        <button className="w-8 h-8 text-[#ADB5BD] hover:bg-[#F0F2F5] hover:text-black rounded-full transition-all">
          <i className="fas fa-minus text-[10px]"></i>
        </button>
        <span className="text-[11px] font-bold text-black px-4 whitespace-nowrap">33%</span>
        <button className="w-8 h-8 text-[#ADB5BD] hover:bg-[#F0F2F5] hover:text-black rounded-full transition-all">
          <i className="fas fa-plus text-[10px]"></i>
        </button>
      </div>

      {/* 左侧：悬浮工具栏 */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 w-[64px] flex flex-col items-center py-6 bg-white border border-[#E9ECEF] rounded-[2.5rem] sharp-shadow z-50">
        <nav className="flex flex-col items-center w-full gap-2">
          <button 
            onClick={() => setActiveTab('all')}
            className={`w-11 h-11 rounded-[14px] flex items-center justify-center transition-all ${
              activeTab === 'all' ? 'bg-[#F0F2F5] text-black' : 'text-[#ADB5BD] hover:bg-[#F8F9FA] hover:text-black'
            }`}
          >
            <i className="fa-solid fa-location-arrow text-[18px] -rotate-45"></i>
          </button>
          
          <div className="h-4"></div>
          
          <button className="w-11 h-11 rounded-[14px] flex items-center justify-center text-[#ADB5BD] hover:bg-[#F8F9FA] hover:text-black transition-all">
            <i className="fa-regular fa-square-plus text-[20px]"></i>
          </button>
          
          <button 
            onClick={() => setActiveTab('scenes')}
            className={`w-11 h-11 rounded-[14px] flex items-center justify-center transition-all ${
              activeTab === 'scenes' ? 'bg-[#F0F2F5] text-black' : 'text-[#ADB5BD] hover:bg-[#F8F9FA]'
            }`}
          >
            <i className="fa-regular fa-square text-[18px]"></i>
          </button>

          <button 
            onClick={() => setActiveTab('text')}
            className={`w-11 h-11 rounded-[14px] flex items-center justify-center transition-all ${
              activeTab === 'text' ? 'bg-[#F0F2F5] text-black' : 'text-[#ADB5BD] hover:bg-[#F8F9FA]'
            }`}
          >
            <i className="fa-solid fa-t text-[16px]"></i>
          </button>

          <button className="w-11 h-11 rounded-[14px] flex items-center justify-center text-[#ADB5BD] hover:bg-[#F8F9FA] transition-all">
            <i className="fa-solid fa-marker text-[16px] rotate-180"></i>
          </button>

          <div className="w-7 h-[1px] bg-[#E9ECEF] my-4"></div>

          <button 
            onClick={() => setActiveTab('media')}
            className={`w-11 h-11 rounded-[14px] flex items-center justify-center transition-all relative ${
              activeTab === 'media' ? 'bg-[#F0F2F5] text-[#0066FF]' : 'text-[#ADB5BD] hover:bg-[#F8F9FA]'
            }`}
          >
            <i className="fa-regular fa-image text-[18px]"></i>
            <i className="fa-solid fa-sparkles text-[6px] absolute top-2.5 right-2.5 text-[#0066FF]"></i>
          </button>

          <button 
            onClick={() => setActiveTab('video')}
            className={`w-11 h-11 rounded-[14px] flex items-center justify-center transition-all relative ${
              activeTab === 'video' ? 'bg-[#F0F2F5] text-[#0066FF]' : 'text-[#ADB5BD] hover:bg-[#F8F9FA]'
            }`}
          >
            <i className="fa-solid fa-clapperboard text-[18px]"></i>
            <i className="fa-solid fa-sparkles text-[6px] absolute top-2.5 right-2.5 text-[#0066FF]"></i>
          </button>
        </nav>
      </div>

      {/* 左下角：用户信息 */}
      <div className="absolute bottom-6 left-6 z-50 flex items-center gap-5">
        <button className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[#ADB5BD] hover:bg-white hover:text-black sharp-shadow transition-all">
          <i className="fa-solid fa-layer-group text-[14px]"></i>
        </button>
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-full bg-[#8E8E93] flex items-center justify-center text-[11px] text-white font-black">W</div>
           <div className="flex items-center gap-1.5 text-[11px] font-black text-[#8E8E93]">
             <i className="fas fa-bolt text-amber-400"></i> 88
           </div>
        </div>
      </div>

      {/* 主画布内容区域 */}
      <main className="absolute inset-0 overflow-auto p-32 custom-scrollbar">
        {assets.length === 0 ? (
          <div className="h-full flex items-center justify-center">
             <div className="text-center opacity-[0.05]">
                <i className="fa-solid fa-clapperboard text-[120px] mb-8"></i>
                <p className="text-[12px] font-black uppercase tracking-[1.5em]">Start Creating</p>
             </div>
          </div>
        ) : (
          <div className="relative w-full h-full flex flex-wrap gap-20 items-start justify-center">
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

      {/* 右侧：悬浮对话面板 */}
      <div className="absolute right-6 top-6 bottom-6 w-[440px] z-50">
        <AgentSidebar 
          contextAssets={assets.filter(a => selectedIds.has(a.id))} 
          onAddAsset={(a) => setAssets(prev => [a, ...prev])}
        />
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
        .fa-sparkles { filter: drop-shadow(0 0 2px rgba(0,102,255,0.4)); }
      `}</style>
    </div>
  );
};

export default App;
