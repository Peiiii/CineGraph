
import React from 'react';
import { useAssetStore } from '../../stores/useAssetStore';
import { usePresenter } from '../../PresenterContext';
import { Tooltip } from '../ui/Tooltip';
import { ActionButton } from '../ui/ActionButton';

export const ZoomHUD: React.FC = () => {
  const presenter = usePresenter();
  const { viewport } = useAssetStore();

  const adjustZoom = (delta: number) => {
    presenter.assetManager.setViewport(v => ({...v, zoom: v.zoom + delta}));
  };

  return (
    <div 
      className="no-canvas-interaction absolute bottom-6 z-[100] flex items-center bg-white/95 backdrop-blur-md border border-[#E9ECEF] rounded-full px-2 py-1.5 sharp-shadow gap-1"
      style={{ left: 'calc(50% - 240px)', transform: 'translateX(-50%)' }}
    >
       <ActionButton icon="fas fa-minus" title="缩小" onClick={() => adjustZoom(-0.2)} />
       
       <Tooltip content="自适应视图 (F)">
         <button 
           onClick={() => presenter.assetManager.fitToScreen()}
           className="px-3.5 h-9 rounded-full hover:bg-[#F1F3F5] transition-all flex items-center justify-center gap-2.5 group"
         >
           <span className="text-[12px] font-bold text-[#1A1C1E] min-w-[32px] tabular-nums text-center">{Math.round(viewport.zoom * 100)}%</span>
           <i className="fas fa-expand text-[11px] text-[#ADB5BD] group-hover:text-[#1A1C1E]"></i>
         </button>
       </Tooltip>

       <ActionButton icon="fas fa-plus" title="放大" onClick={() => adjustZoom(0.2)} />
       
       <div className="w-[1px] h-4 bg-[#E9ECEF] mx-1"></div>

       <ActionButton icon="fas fa-rotate-left" title="重置 (Ctrl+0)" onClick={() => presenter.assetManager.setViewport({ zoom: 1 })} />
    </div>
  );
};
