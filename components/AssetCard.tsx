
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
      className={`group relative flex flex-col gap-4 transition-all duration-500 cursor-pointer max-w-[480px]`}
    >
      <div className={`relative rounded-[2.5rem] overflow-hidden transition-all duration-500 ${
        selected 
        ? 'ring-[6px] ring-[#0066FF] shadow-[0_40px_80px_-12px_rgba(0,102,255,0.2)] scale-[0.99]' 
        : 'bg-white border border-[#E9ECEF] sharp-shadow hover:scale-[1.01]'
      }`}>
        {asset.type === 'image' && (
          <img src={asset.content} alt={asset.title} className="w-full object-cover max-h-[60vh] transition-transform duration-700" />
        )}
        {asset.type === 'video' && (
          <video src={asset.content} className="w-full object-cover max-h-[60vh]" controls={false} muted loop autoPlay />
        )}
        
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/2 transition-colors"></div>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 bg-black text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl pointer-events-none z-10">
           <i className="fas fa-plus text-[10px]"></i>
           <span className="text-[11px] font-black tracking-tight whitespace-nowrap">COMMAND + CLICK TO EDIT</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between px-6">
        <div>
          <h3 className={`text-[12px] font-black uppercase tracking-[0.2em] transition-colors ${selected ? 'text-[#0066FF]' : 'text-[#ADB5BD] group-hover:text-black'}`}>
            {asset.title}
          </h3>
        </div>
        {onRemove && (
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(asset.id); }} 
            className="w-10 h-10 rounded-[12px] text-[#ADB5BD] hover:bg-[#F0F2F5] hover:text-red-500 transition-all flex items-center justify-center"
          >
            <i className="fas fa-trash-can text-[12px]"></i>
          </button>
        )}
      </div>
    </div>
  );
};

export default AssetCard;
