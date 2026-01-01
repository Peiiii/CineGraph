
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
      className={`group relative flex flex-col gap-4 transition-all duration-500 cursor-pointer`}
    >
      <div className={`relative aspect-video rounded-[2.2rem] overflow-hidden transition-all duration-500 ${
        selected 
        ? 'ring-[6px] ring-[#0066FF] shadow-[0_30px_60px_-12px_rgba(0,102,255,0.25)] scale-[0.98]' 
        : 'bg-white border border-black/[0.03] hover:border-black/10'
      }`}>
        {asset.type === 'image' && (
          <img src={asset.content} alt={asset.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        )}
        {asset.type === 'video' && (
          <video src={asset.content} className="w-full h-full object-cover" controls={false} muted loop autoPlay />
        )}
        {(asset.type === 'character' || asset.type === 'scene' || asset.type === 'text') && (
          <div className="p-10 h-full flex flex-col bg-slate-50/50 justify-center">
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-black/10 mb-4">{asset.type}</span>
            <p className="text-[14px] leading-relaxed font-bold text-black/60 italic">"{asset.content}"</p>
          </div>
        )}

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 bg-black text-white px-6 py-2.5 rounded-full flex items-center gap-3 shadow-2xl pointer-events-none">
           <i className="fas fa-plus text-[10px]"></i>
           <span className="text-[11px] font-black tracking-tight whitespace-nowrap">⌘ + 点击编辑特定区域</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between px-4">
        <h3 className={`text-[11px] font-black uppercase tracking-widest transition-colors ${selected ? 'text-[#0066FF]' : 'text-black/30 group-hover:text-black'}`}>
          {asset.title}
        </h3>
        {onRemove && (
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(asset.id); }} 
            className="w-8 h-8 rounded-full text-[#D1D1D6] hover:text-red-500 transition-all"
          >
            <i className="fas fa-trash-can text-[10px]"></i>
          </button>
        )}
      </div>
    </div>
  );
};

export default AssetCard;
