
import React from 'react';
import AssetCard from './components/AssetCard';
import AgentSidebar from './components/AgentSidebar';
import { useAssetStore } from './stores/useAssetStore';
import { usePresenter, PresenterProvider } from './PresenterContext';

const AppContent: React.FC = () => {
  const presenter = usePresenter();
  const { assets, selectedIds, activeTab } = useAssetStore();

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
      <div className="absolute inset-0 canvas-dot-grid opacity-[0.2] pointer-events-none"></div>

      {/* Top Left: Logo & Project Name */}
      <div className="absolute top-4 left-5 z-50 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center shadow-lg">
          <i className="fa-solid fa-clapperboard text-[12px] text-white"></i>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[14px] font-bold text-black tracking-tight">未命名项目</span>
          <i className="fas fa-chevron-down text-[9px] text-[#ADB5BD]"></i>
        </div>
      </div>

      {/* Top Right: Zoom Control */}
      <div className="absolute top-4 right-[492px] z-50 flex items-center bg-white/80 backdrop-blur-md border border-[#E9ECEF] rounded-full px-1 py-1 sharp-shadow">
        <button className="w-7 h-7 text-[#ADB5BD] hover:bg-black/5 rounded-full transition-all flex items-center justify-center">
          <i className="fas fa-minus text-[9px]"></i>
        </button>
        <span className="text-[10px] font-bold text-black px-3.5">25%</span>
        <button className="w-7 h-7 text-[#ADB5BD] hover:bg-black/5 rounded-full transition-all flex items-center justify-center">
          <i className="fas fa-plus text-[9px]"></i>
        </button>
      </div>

      {/* Left Sidebar: 悬浮工具栏 */}
      <div className="absolute left-5 top-1/2 -translate-y-1/2 w-[58px] flex flex-col items-center py-5 bg-white border border-[#E9ECEF] rounded-[2.2rem] sharp-shadow z-50 gap-1.5">
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
            <div key={item.id} className="w-6 h-[1px] bg-[#F0F2F5] my-1"></div>
          ) : (
            <button 
              key={item.id}
              onClick={() => item.id !== 'add' && item.id !== 'pen' && presenter.assetManager.setActiveTab(item.id)}
              className={`w-10 h-10 rounded-[12px] flex items-center justify-center transition-all relative ${
                activeTab === item.id ? 'bg-[#F0F2F5] text-black' : 'text-[#ADB5BD] hover:bg-[#F0F2F5] hover:text-[#1A1C1E]'
              }`}
            >
              <i className={`${item.icon} text-[16px] ${item.rot || ''}`}></i>
              {item.ai && <i className="fa-solid fa-sparkles text-[5px] absolute top-2 right-2 text-[#0066FF]"></i>}
            </button>
          )
        ))}
      </div>

      {/* Main Canvas */}
      <main className="absolute inset-0 overflow-auto p-32 pr-[500px] custom-scrollbar">
        {assets.length === 0 ? (
          <div className="h-full flex items-center justify-center select-none pointer-events-none opacity-[0.02]">
             <div className="text-center">
                <i className="fa-solid fa-film text-[120px] mb-6"></i>
                <p className="text-[11px] font-black uppercase tracking-[1.2em]">Ready to Shoot</p>
             </div>
          </div>
        ) : (
          <div className="relative w-full h-full flex flex-wrap gap-20 items-start justify-center">
            {filteredAssets.map(asset => (
              <AssetCard 
                key={asset.id} 
                asset={asset} 
                selected={selectedIds.has(asset.id)}
                onSelect={presenter.assetManager.toggleSelection}
                onRemove={presenter.assetManager.removeAsset}
              />
            ))}
          </div>
        )}
      </main>

      {/* Agent Panel */}
      <div className="absolute right-3 top-3 bottom-3 w-[472px] z-50">
        <AgentSidebar />
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <PresenterProvider>
    <AppContent />
  </PresenterProvider>
);

export default App;
