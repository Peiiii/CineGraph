
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
      className={`group relative bg-zinc-900 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
        selected ? 'border-violet-500 shadow-lg shadow-violet-500/20 scale-[1.02]' : 'border-zinc-800 hover:border-zinc-700'
      }`}
    >
      <div className="aspect-video bg-zinc-800 relative">
        {asset.type === 'image' && (
          <img src={asset.content} alt={asset.title} className="w-full h-full object-cover" />
        )}
        {asset.type === 'video' && (
          <video src={asset.content} className="w-full h-full object-cover" controls={false} muted loop autoPlay />
        )}
        {(asset.type === 'text' || asset.type === 'character' || asset.type === 'scene') && (
          <div className="p-4 h-full flex flex-col justify-center">
            <span className="text-xs uppercase font-bold text-violet-400 mb-1">{asset.type}</span>
            <p className="text-sm line-clamp-4 italic text-zinc-300">"{asset.content.substring(0, 150)}..."</p>
          </div>
        )}
        
        {selected && (
          <div className="absolute top-2 right-2 bg-violet-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
            <i className="fas fa-check"></i>
          </div>
        )}
      </div>
      
      <div className="p-3 bg-zinc-900">
        <h3 className="text-sm font-semibold truncate text-zinc-100">{asset.title}</h3>
        <p className="text-xs text-zinc-500 mt-1">{new Date(asset.createdAt).toLocaleDateString()}</p>
      </div>

      {onRemove && (
        <button 
          onClick={(e) => { e.stopPropagation(); onRemove(asset.id); }}
          className="absolute top-2 left-2 bg-black/50 hover:bg-red-500 text-white rounded-md w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <i className="fas fa-trash-alt text-xs"></i>
        </button>
      )}
    </div>
  );
};

export default AssetCard;
