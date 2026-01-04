
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
  const { selectedIds, viewport, isInteracting } = useAssetStore();
  const canvasRef = useRef<HTMLDivElement>(null);
  
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

      {/* 2. 画布资产层 
          关键修改：当 isInteracting 为 true（用户手动操控）时，禁用 transition。
          只有在自动聚焦等非交互状态下才启用平滑动画。
      */}
      <div 
        className={`absolute inset-0 origin-top-left will-change-transform canvas-viewport-layer ${
          !isInteracting ? 'transition-transform duration-500 cubic-bezier(0.25, 1, 0.5, 1)' : ''
        }`}
        style={{ 
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})` 
        }}
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

      <div className="absolute right-2 top-2 bottom-2 w-[380px] z-[200]">
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
