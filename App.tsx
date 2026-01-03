
import React, { useRef } from 'react';
import AssetCard from './components/AssetCard';
import AgentSidebar from './components/AgentSidebar';
import { useAssetStore } from './stores/useAssetStore';
import { PresenterProvider } from './PresenterContext';
import { Toolbar } from './components/canvas/Toolbar';
import { ZoomHUD } from './components/canvas/ZoomHUD';
import { useCanvasInteraction } from './hooks/useCanvasInteraction';
import { useCanvasHotkeys } from './hooks/useCanvasHotkeys';
import { useFilteredAssets } from './hooks/useFilteredAssets';
import { useAutoFit } from './hooks/useAutoFit';

const AppContent: React.FC = () => {
  const { selectedIds, viewport } = useAssetStore();
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // 注入业务逻辑 Hooks
  useCanvasHotkeys();
  useAutoFit();
  const filteredAssets = useFilteredAssets();
  const { startPanning, isPanning } = useCanvasInteraction(canvasRef);

  return (
    <div 
      ref={canvasRef}
      onMouseDown={startPanning}
      className={`relative h-screen w-screen bg-[#F8F9FA] overflow-hidden ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{ touchAction: 'none' }}
    >
      {/* 1. 背景网格层 */}
      <div 
        className="absolute inset-0 canvas-dot-grid opacity-[0.25] pointer-events-none"
        style={{ 
          backgroundPosition: `${viewport.x}px ${viewport.y}px`,
          backgroundSize: `${40 * viewport.zoom}px ${40 * viewport.zoom}px`
        }}
      />

      {/* 2. 画布资产层 (支持位移与缩放) */}
      <div 
        className="absolute inset-0 transition-transform duration-75 ease-out origin-top-left will-change-transform canvas-viewport-layer"
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

      {/* 3. UI 叠加层 */}
      <ZoomHUD />
      <Toolbar />

      <div className="absolute right-2 top-2 bottom-2 w-[320px] z-[200]">
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
