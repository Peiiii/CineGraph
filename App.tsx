
import React, { useRef } from 'react';
import AssetCard from './components/AssetCard';
import AgentSidebar from './components/AgentSidebar';
import { useAssetStore } from './stores/useAssetStore';
import { PresenterProvider } from './PresenterContext';
import { Toolbar } from './components/canvas/Toolbar';
import { ZoomHUD } from './components/canvas/ZoomHUD';
import { useCanvasInteraction } from './hooks/useCanvasInteraction';

const AppContent: React.FC = () => {
  const { assets, selectedIds, activeTab, viewport } = useAssetStore();
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // 逻辑已移入 hook 内部进行手动事件绑定，以支持 e.preventDefault()
  const { startPanning, isPanning } = useCanvasInteraction(canvasRef);

  const filteredAssets = assets.filter(a => {
    if (activeTab === 'all') return true;
    if (activeTab === 'media') return a.type === 'image';
    if (activeTab === 'video') return a.type === 'video';
    if (activeTab === 'text') return a.type === 'text' || a.type === 'character' || a.type === 'scene';
    return true;
  });

  return (
    <div 
      className={`relative h-screen w-screen bg-[#F8F9FA] overflow-hidden transition-colors duration-500 ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
      onMouseDown={startPanning}
      ref={canvasRef}
      style={{ touchAction: 'none' }} // 禁止原生触摸缩放/滚动
    >
      <div 
        className="absolute inset-0 canvas-dot-grid opacity-[0.2] pointer-events-none"
        style={{ 
          backgroundPosition: `${viewport.x}px ${viewport.y}px`,
          backgroundSize: `${32 * viewport.zoom}px ${32 * viewport.zoom}px`
        }}
      ></div>

      <div 
        className="absolute inset-0 transition-transform duration-75 ease-out origin-top-left canvas-viewport-layer"
        style={{ transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})` }}
      >
        {filteredAssets.map(asset => (
          <AssetCard 
            key={asset.id} 
            asset={asset} 
            selected={selectedIds.has(asset.id)}
          />
        ))}
      </div>

      <ZoomHUD />
      <Toolbar />

      <div className="absolute right-4 top-4 bottom-4 w-[460px] z-[200]">
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
