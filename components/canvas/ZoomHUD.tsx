
import React from 'react';
import { useAssetStore } from '../../stores/useAssetStore';
import { usePresenter } from '../../PresenterContext';

export const ZoomHUD: React.FC = () => {
  const presenter = usePresenter();
  const { viewport } = useAssetStore();

  const adjustZoom = (delta: number) => {
    presenter.assetManager.setViewport(v => ({...v, zoom: v.zoom + delta}));
  };

  return (
    <div 
      className="absolute bottom-6 z-[100] flex items-center bg-white/90 backdrop-blur-md border border-[#E9ECEF] rounded-full px-2 py-1.5 sharp-shadow gap-1"
      style={{ left: 'calc(50% - 230px)', transform: 'translateX(-50%)' }}
    >
       <button 
         title="缩小"
         onClick={() => adjustZoom(-0.2)} 
         className="w-8 h-8 rounded-full hover:bg-black/5 transition-all flex items-center justify-center text-[#ADB5BD] hover:text-black"
       >
         <i className="fas fa-minus text-[10px]"></i>
       </button>
       
       <button 
         title="自适应视图"
         onClick={() => presenter.assetManager.fitToScreen()}
         className="px-3 h-8 rounded-full hover:bg-black/5 transition-all flex items-center justify-center gap-2 group"
       >
         <span className="text-[11px] font-black text-black min-w-[35px]">{Math.round(viewport.zoom * 100)}%</span>
         <i className="fas fa-expand text-[10px] text-[#ADB5BD] group-hover:text-black"></i>
       </button>

       <button 
         title="放大"
         onClick={() => adjustZoom(0.2)} 
         className="w-8 h-8 rounded-full hover:bg-black/5 transition-all flex items-center justify-center text-[#ADB5BD] hover:text-black"
       >
         <i className="fas fa-plus text-[10px]"></i>
       </button>
       
       <div className="w-[1px] h-4 bg-[#E9ECEF] mx-1"></div>

       <button 
         title="重置缩放"
         onClick={() => presenter.assetManager.setViewport({ zoom: 1 })}
         className="w-8 h-8 rounded-full hover:bg-black/5 transition-all flex items-center justify-center text-[#ADB5BD] hover:text-black"
       >
         <i className="fas fa-rotate-left text-[10px]"></i>
       </button>
    </div>
  );
};
