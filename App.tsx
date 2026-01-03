
import React, { useRef, useEffect } from 'react';
import AssetCard from './components/AssetCard';
import AgentSidebar from './components/AgentSidebar';
import { useAssetStore } from './stores/useAssetStore';
import { PresenterProvider, usePresenter } from './PresenterContext';
import { Toolbar } from './components/canvas/Toolbar';
import { ZoomHUD } from './components/canvas/ZoomHUD';
import { useCanvasInteraction } from './hooks/useCanvasInteraction';

const AppContent: React.FC = () => {
  const presenter = usePresenter();
  const { assets, selectedIds, activeTab, viewport } = useAssetStore();
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const { startPanning, isPanning } = useCanvasInteraction(canvasRef);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key.toLowerCase() === 'f') {
        presenter.assetManager.fitToScreen();
      }
      if (e.key === '0' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        presenter.assetManager.setViewport({ zoom: 1 });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [presenter]);

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
      style={{ touchAction: 'none' }}
    >
      <div 
        className="absolute inset-0 canvas-dot-grid opacity-[0.25] pointer-events-none transition-opacity duration-1000"
        style={{ 
          backgroundPosition: `${viewport.x}px ${viewport.y}px`,
          backgroundSize: `${40 * viewport.zoom}px ${40 * viewport.zoom}px`
        }}
      ></div>

      <div 
        className="absolute inset-0 transition-transform duration-75 ease-out origin-top-left canvas-viewport-layer will-change-transform"
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
