
import React, { useRef, useState } from 'react';
import { Asset } from '../types';
import { usePresenter } from '../PresenterContext';
import { useAssetStore } from '../stores/useAssetStore';
import { AssetRenderer } from './canvas/AssetRenderer';

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
    e.stopPropagation();
    
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - asset.position.x * viewport.zoom,
      y: e.clientY - asset.position.y * viewport.zoom
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      // 拖拽过程中必须考虑 viewport.zoom 的缩放补偿
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
        zIndex: isDragging ? 1000 : (selected ? 10 : 1)
      }}
      className={`group flex flex-col gap-4 cursor-grab active:cursor-grabbing w-[420px] select-none transition-shadow ${isDragging ? 'opacity-90' : 'opacity-100'}`}
    >
      <div className={`relative rounded-[2rem] overflow-hidden transition-all duration-300 ${
        selected 
        ? 'ring-[6px] ring-[#0066FF] shadow-[0_40px_80px_-12px_rgba(0,102,255,0.25)]' 
        : 'bg-white border border-[#E9ECEF] sharp-shadow'
      }`}>
        {/* 将复杂的渲染逻辑抽离到 AssetRenderer */}
        <AssetRenderer asset={asset} />
        
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onMouseDown={(e) => { e.stopPropagation(); presenter.assetManager.removeAsset(asset.id); }}
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur shadow-sm flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"
          >
            <i className="fas fa-trash-can text-[10px]"></i>
          </button>
        </div>
      </div>
      
      <div className="flex items-center px-4">
        <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] ${selected ? 'text-[#0066FF]' : 'text-[#ADB5BD]'}`}>
          {asset.title}
        </h3>
      </div>
    </div>
  );
};

export default AssetCard;
