
import React, { useRef, useState } from 'react';
import { Asset } from '../types';
import { usePresenter } from '../PresenterContext';
import { useAssetStore } from '../stores/useAssetStore';
import { AssetRenderer } from './canvas/AssetRenderer';
import { ActionButton } from './ui/ActionButton';

interface AssetCardProps {
  asset: Asset;
  selected: boolean;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, selected }) => {
  const presenter = usePresenter();
  const { viewport } = useAssetStore();
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    // 允许点击按钮，不触发拖拽
    if (target.closest('button')) return;

    e.stopPropagation();
    
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - asset.position.x * viewport.zoom,
      y: e.clientY - asset.position.y * viewport.zoom
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newX = (moveEvent.clientX - dragStart.current.x) / viewport.zoom;
      const newY = (moveEvent.clientY - dragStart.current.y) / viewport.zoom;
      presenter.assetManager.updateAssetPosition(asset.id, newX, newY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    if (!selected) presenter.assetManager.toggleSelection(asset.id);
  };

  return (
    <div 
      onMouseDown={handleMouseDown}
      style={{ 
        left: asset.position.x, 
        top: asset.position.y,
        position: 'absolute',
        zIndex: isDragging ? 1000 : (selected ? 10 : 1),
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
      }}
      className={`group flex flex-col gap-3 cursor-grab active:cursor-grabbing w-[420px] select-none transition-all duration-200 ${isDragging ? 'opacity-90' : 'opacity-100'}`}
    >
      <div className={`relative transition-all duration-300 ${
        selected 
        ? 'ring-[6px] ring-[#0066FF] rounded-[2rem] shadow-[0_40px_100px_-10px_rgba(0,102,255,0.3)] translate-y-[-4px]' 
        : 'bg-white rounded-[2rem] border border-[#E9ECEF] sharp-shadow hover:translate-y-[-2px] hover:shadow-xl'
      }`}>
        {/* 内容裁剪层 */}
        <div className="w-full h-full rounded-[1.8rem] overflow-hidden">
          <AssetRenderer asset={asset} />
        </div>
        
        {/* 操作交互层 - 放在裁剪层之外，避免 Tooltip 和阴影被切断 */}
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
          <ActionButton 
            icon="fa-solid fa-trash-can" 
            title="从工作区移除" 
            className="bg-white/90 backdrop-blur shadow-sm hover:!bg-red-500 hover:!text-white"
            onClick={() => presenter.assetManager.removeAsset(asset.id)}
          />
        </div>
      </div>
      
      {/* 底部信息栏 */}
      <div className="flex items-center px-4 transition-transform duration-300 transform">
        <div className={`h-1.5 w-1.5 rounded-full mr-3 ${selected ? 'bg-[#0066FF] animate-pulse' : 'bg-[#E9ECEF]'}`}></div>
        <h3 className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-colors ${selected ? 'text-black' : 'text-[#ADB5BD]'}`}>
          {asset.title}
        </h3>
      </div>
    </div>
  );
};

export default AssetCard;
