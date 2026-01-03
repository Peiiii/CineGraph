
import React from 'react';
import { useAssetStore } from '../../stores/useAssetStore';
import { usePresenter } from '../../PresenterContext';
import { ActionButton } from '../ui/ActionButton';

export const ZoomHUD: React.FC = () => {
  const presenter = usePresenter();
  const { viewport } = useAssetStore();

  const adjustZoom = (delta: number) => {
    presenter.assetManager.setViewport(v => ({...v, zoom: v.zoom + delta}));
  };

  return (
    <div 
      className="no-canvas-interaction absolute bottom-6 z-[100] flex items-center bg-white/95 backdrop-blur-md border border-[#E9ECEF] rounded-full px-2 py-1 sharp-shadow gap-0.5"
      style={{ left: 'calc(50% - 240px)', transform: 'translateX(-50%)' }}
    >
      {/* 缩小按钮 */}
      <ActionButton 
        icon="fas fa-minus" 
        title="缩小" 
        onClick={() => adjustZoom(-0.1)} 
      />
      
      {/* 百分比显示 */}
      <div className="px-2 min-w-[54px] text-center">
        <span className="text-[13px] font-bold text-[#1A1C1E] tabular-nums">
          {Math.round(viewport.zoom * 100)}%
        </span>
      </div>

      {/* 放大按钮 */}
      <ActionButton 
        icon="fas fa-plus" 
        title="放大" 
        onClick={() => adjustZoom(0.1)} 
      />
      
      {/* 分隔符 */}
      <div className="w-[1px] h-4 bg-[#E9ECEF] mx-1.5"></div>

      {/* 恢复 100% 按钮 */}
      <ActionButton 
        icon="fas fa-rotate-left" 
        title="恢复 100% (Ctrl+0)" 
        onClick={() => presenter.assetManager.setViewport({ zoom: 1 })} 
      />

      {/* 一键自适应按钮 */}
      <ActionButton 
        icon="fas fa-expand" 
        title="一键自适应 (F)" 
        onClick={() => presenter.assetManager.fitToScreen()} 
      />
    </div>
  );
};
