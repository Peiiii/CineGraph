
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
      className={`group relative bg-white rounded-[1.5rem] overflow-hidden transition-all duration-500 cursor-pointer ${
        selected ? 'ring-2 ring-black ring-offset-4 scale-[0.98]' : 'hover:scale-[1.02]'
      }`}
    >
      <div className="aspect-video relative overflow-hidden rounded-[1.2rem]">
        {asset.type === 'image' && (
          <img src={asset.content} alt={asset.title} className="w-full h-full object-cover" />
        )}
        {asset.type === 'video' && (
          <video src={asset.content} className="w-full h-full object-cover" controls={false} muted loop autoPlay />
        )}
        {(asset.type === 'character' || asset.type === 'scene' || asset.type === 'text') && (
          <div className="p-6 h-full flex flex-col bg-slate-50 justify-center">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">{asset.type}</span>
            <p className="text-[13px] leading-relaxed font-medium text-slate-600 line-clamp-3">"{asset.content}"</p>
          </div>
        )}
        {selected && (
          <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
             <div className="bg-black text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">Selected</div>
          </div>
        )}
        
        {/* Hover 编辑按钮提示 - 参考图中部黑色胶囊 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-4 py-2 rounded-full flex items-center gap-2">
           <i className="fas fa-plus"></i> 点击编辑特定区域
        </div>
      </div>
      
      <div className="py-4 px-2 flex items-center justify-between">
        <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-tight truncate">{asset.title}</h3>
        {onRemove && (
          <button onClick={(e) => { e.stopPropagation(); onRemove(asset.id); }} className="text-slate-300 hover:text-red-500 transition-colors">
            <i className="fas fa-trash-can text-[10px]"></i>
          </button>
        )}
      </div>
    </div>
  );
};

export default AssetCard;
