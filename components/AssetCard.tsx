
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
      }}
      className={`group flex flex-col gap-3 cursor-grab active:cursor-grabbing w-[420px] select-none ${isDragging ? 'opacity-80' : 'opacity-100'}`}
    >
      <div className={`relative transition-shadow duration-300 ${
        selected 
        ? 'ring-[3px] ring-[#0066FF] rounded-[2rem] shadow-[0_20px_60px_-10px_rgba(0,102,255,0.2)]' 
        : 'bg-white rounded-[2rem] border border-[#E9ECEF] sharp-shadow hover:shadow-xl'
      }`}>
        {/* 内容裁剪层 */}
        <div className="w-full h-full rounded-[1.8rem] overflow-hidden">
          <AssetRenderer asset={asset} />
        </div>
        
        {/* 操作交互层 */}
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
          <ActionButton 
            icon="fa-solid fa-trash-can" 
            title="从工作区移除" 
            className="bg-white/90 backdrop-blur shadow-sm hover:!bg-red-500 hover:!text-white"
            onClick={() => presenter.assetManager.removeAsset(asset.id)}
          />
        </div>
      </div>
      
      {/* 底部信息栏 */}
      <div className="flex items-center px-4">
        <div className={`h-1.2 w-1.2 rounded-full mr-2.5 ${selected ? 'bg-[#0066FF]' : 'bg-[#E9ECEF]'}`}></div>
        <h3 className={`text-[10px] font-bold uppercase tracking-[0.15em] transition-colors ${selected ? 'text-black' : 'text-[#ADB5BD]'}`}>
          {asset.title}
        </h3>
      </div>
    </div>
  );
};

export default AssetCard;
