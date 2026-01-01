
import React from 'react';
import { Asset } from '../types';

interface AssetCardProps {
  asset: Asset;
  selected: boolean;
  onSelect: (id: string) => void;
  onRemove?: (id: string) => void;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, selected, onSelect, onRemove }) => {
  return (
    <div 
      onClick={() => onSelect(asset.id)}
      className={`group relative bg-[#1a181f]/40 backdrop-blur-md rounded-[2rem] overflow-hidden border-2 transition-all duration-500 cursor-pointer shadow-xl ${
        selected 
        ? 'border-purple-400 shadow-purple-500/20 scale-[1.03] ring-8 ring-purple-500/5' 
        : 'border-white/5 hover:border-white/20 hover:shadow-2xl hover:shadow-black/60'
      }`}
    >
      <div className="aspect-[4/3] bg-zinc-900/50 relative overflow-hidden">
        {asset.type === 'image' && (
          <img src={asset.content} alt={asset.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        )}
        {asset.type === 'video' && (
          <video src={asset.content} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" controls={false} muted loop autoPlay />
        )}
        {(asset.type === 'text' || asset.type === 'character' || asset.type === 'scene') && (
          <div className="p-6 h-full flex flex-col justify-center bg-gradient-to-br from-purple-500/5 to-transparent">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
              <span className="text-[10px] uppercase font-black tracking-[0.2em] text-purple-300/60">{asset.type}</span>
            </div>
            <p className="text-xs leading-relaxed font-light italic text-zinc-400 line-clamp-5">"{asset.content.substring(0, 180)}..."</p>
          </div>
        )}
        
        {/* 精致选中标记 */}
        <div className={`absolute inset-0 bg-purple-500/10 pointer-events-none transition-opacity duration-500 ${selected ? 'opacity-100' : 'opacity-0'}`}></div>
      </div>
      
      <div className="p-5 bg-gradient-to-b from-[#211e27]/50 to-transparent">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold tracking-wider truncate text-zinc-100 max-w-[70%]">{asset.title}</h3>
          <span className="text-[8px] font-mono text-zinc-600">ID:{asset.id.slice(0, 4)}</span>
        </div>
      </div>

      {onRemove && (
        <button 
          onClick={(e) => { e.stopPropagation(); onRemove(asset.id); }}
          className="absolute top-4 left-4 bg-black/40 backdrop-blur-md hover:bg-red-500/80 text-white rounded-full w-9 h-9 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center border border-white/10"
        >
          <i className="fas fa-trash-alt text-[10px]"></i>
        </button>
      )}
    </div>
  );
};

export default AssetCard;
