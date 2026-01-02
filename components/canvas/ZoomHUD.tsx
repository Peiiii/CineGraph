
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
      className="absolute bottom-6 z-[100] flex items-center bg-white/90 backdrop-blur-md border border-[#E9ECEF] rounded-full px-2 py-1.5 sharp-shadow gap-2"
      style={{ left: 'calc(50% - 230px)', transform: 'translateX(-50%)' }}
    >
       <button 
         title="缩小"
         onClick={() => adjustZoom(-0.1)} 
         className="w-8 h-8 rounded-full hover:bg-black/5 transition-all flex items-center justify-center text-[#ADB5BD] hover:text-black"
       >
         <i className="fas fa-minus text-[10px]"></i>
       </button>
       <div className="min-w-[50px] text-center">
         <span className="text-[11px] font-black text-black">{Math.round(viewport.zoom * 100)}%</span>
       </div>
       <button 
         title="放大"
         onClick={() => adjustZoom(0.1)} 
         className="w-8 h-8 rounded-full hover:bg-black/5 transition-all flex items-center justify-center text-[#ADB5BD] hover:text-black"
       >
         <i className="fas fa-plus text-[10px]"></i>
       </button>
    </div>
  );
};
