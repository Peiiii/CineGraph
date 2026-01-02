
import React, { useRef } from 'react';
import AssetCard from './components/AssetCard';
import AgentSidebar from './components/AgentSidebar';
import { useAssetStore } from './stores/useAssetStore';
import { usePresenter, PresenterProvider } from './PresenterContext';

const AppContent: React.FC = () => {
  const presenter = usePresenter();
  const { assets, selectedIds, activeTab, viewport } = useAssetStore();
  const canvasRef = useRef<HTMLDivElement>(null);

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
    // 只有当点击的是画布背景（canvas-dot-grid）或者按住 Alt 时允许平移
    const isBackground = e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('canvas-dot-grid');
    
    if (e.button === 0 && (isBackground || e.altKey)) {
      const startX = e.clientX - viewport.x;
      const startY = e.clientY - viewport.y;

      const onMouseMove = (moveEvent: MouseEvent) => {
        presenter.assetManager.setViewport({
          x: moveEvent.clientX - startX,
          y: moveEvent.clientY - startY
        });
      };

      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
  };

  return (
    <div 
      className="relative h-screen w-screen bg-[#F8F9FA] overflow-hidden cursor-crosshair"
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
        className="absolute inset-0 transition-transform duration-75 ease-out origin-top-left"
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

      {/* Zoom HUD: 避开右侧 AgentSidebar (460px)，居中于工作区 */}
      <div 
        className="absolute bottom-6 z-[100] flex items-center bg-white/90 backdrop-blur-md border border-[#E9ECEF] rounded-full px-2 py-1.5 sharp-shadow gap-2"
        style={{ left: 'calc(50% - 230px)', transform: 'translateX(-50%)' }}
      >
         <button 
           title="缩小"
           onClick={() => presenter.assetManager.setViewport(v => ({...v, zoom: v.zoom - 0.1}))} 
           className="w-8 h-8 rounded-full hover:bg-black/5 transition-all flex items-center justify-center text-[#ADB5BD] hover:text-black"
         >
           <i className="fas fa-minus text-[10px]"></i>
         </button>
         <div className="min-w-[50px] text-center">
           <span className="text-[11px] font-black text-black">{Math.round(viewport.zoom * 100)}%</span>
         </div>
         <button 
           title="放大"
           onClick={() => presenter.assetManager.setViewport(v => ({...v, zoom: v.zoom + 0.1}))} 
           className="w-8 h-8 rounded-full hover:bg-black/5 transition-all flex items-center justify-center text-[#ADB5BD] hover:text-black"
         >
           <i className="fas fa-plus text-[10px]"></i>
         </button>
      </div>

      {/* Left Sidebar Toolbar */}
      <div className="absolute left-5 top-1/2 -translate-y-1/2 w-[60px] flex flex-col items-center py-6 bg-white border border-[#E9ECEF] rounded-[2.5rem] sharp-shadow z-[100] gap-2">
        {[
          { id: 'all', icon: 'fa-solid fa-arrow-pointer', label: '选择模式' },
          { id: 'add', icon: 'fa-solid fa-plus', label: '添加资产' },
          { id: 'text', icon: 'fa-solid fa-t', label: '文字剧本' },
          { id: 'sep', isSep: true },
          { id: 'media', icon: 'fa-regular fa-image', ai: true, label: 'AI 生图' },
          { id: 'video', icon: 'fa-solid fa-film', ai: true, label: 'AI 视频' },
        ].map((item: any) => (
          item.isSep ? (
            <div key={item.id} className="w-6 h-[1px] bg-[#F0F2F5] my-2"></div>
          ) : (
            <button 
              key={item.id}
              title={item.label}
              onClick={() => presenter.assetManager.setActiveTab(item.id)}
              className={`w-11 h-11 rounded-[16px] flex items-center justify-center transition-all relative ${
                activeTab === item.id ? 'bg-[#F0F2F5] text-black shadow-inner' : 'text-[#ADB5BD] hover:bg-[#F8F9FA] hover:text-black'
              }`}
            >
              <i className={`${item.icon} text-[16px]`}></i>
              {item.ai && <i className="fa-solid fa-sparkles text-[6px] absolute top-2 right-2 text-[#0066FF] animate-pulse"></i>}
            </button>
          )
        ))}
      </div>

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
