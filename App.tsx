
import React, { useRef, useState } from 'react';
import AssetCard from './components/AssetCard';
import AgentSidebar from './components/AgentSidebar';
import { useAssetStore } from './stores/useAssetStore';
import { usePresenter, PresenterProvider } from './PresenterContext';
import { Toolbar } from './components/canvas/Toolbar';
import { ZoomHUD } from './components/canvas/ZoomHUD';

const AppContent: React.FC = () => {
  const presenter = usePresenter();
  const { assets, selectedIds, activeTab, viewport } = useAssetStore();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);

  const filteredAssets = assets.filter(a => {
    if (activeTab === 'all') return true;
    if (activeTab === 'media') return a.type === 'image';
    if (activeTab === 'video') return a.type === 'video';
    if (activeTab === 'text') return a.type === 'text';
    return true;
  });

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      const zoomSpeed = 0.001;
      const delta = -e.deltaY;
      const newZoom = viewport.zoom + delta * zoomSpeed;
      
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const worldX = (mouseX - viewport.x) / viewport.zoom;
      const worldY = (mouseY - viewport.y) / viewport.zoom;
      
      const nextZoom = Math.max(0.1, Math.min(newZoom, 5));
      const newX = mouseX - worldX * nextZoom;
      const newY = mouseY - worldY * nextZoom;
      
      presenter.assetManager.setViewport({ zoom: nextZoom, x: newX, y: newY });
    } else {
      presenter.assetManager.setViewport({ 
        x: viewport.x - e.deltaX, 
        y: viewport.y - e.deltaY 
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isBackground = target === canvasRef.current || target.classList.contains('canvas-viewport-layer');
    
    if (e.button === 0 && (isBackground || e.altKey)) {
      setIsPanning(true);
      const startX = e.clientX - viewport.x;
      const startY = e.clientY - viewport.y;

      const onMouseMove = (moveEvent: MouseEvent) => {
        presenter.assetManager.setViewport({
          x: moveEvent.clientX - startX,
          y: moveEvent.clientY - startY
        });
      };

      const onMouseUp = () => {
        setIsPanning(false);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
  };

  return (
    <div 
      className={`relative h-screen w-screen bg-[#F8F9FA] overflow-hidden transition-colors duration-500 ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      ref={canvasRef}
    >
      {/* 动态网格背景 */}
      <div 
        className="absolute inset-0 canvas-dot-grid opacity-[0.2] pointer-events-none"
        style={{ 
          backgroundPosition: `${viewport.x}px ${viewport.y}px`,
          backgroundSize: `${32 * viewport.zoom}px ${32 * viewport.zoom}px`
        }}
      ></div>

      {/* Viewport Transform Layer */}
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

      {/* Agent Panel */}
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
