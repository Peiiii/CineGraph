
import React from 'react';
import { Asset } from '../../types';
import { marked } from 'marked';

interface AssetRendererProps {
  asset: Asset;
}

export const AssetRenderer: React.FC<AssetRendererProps> = ({ asset }) => {
  switch (asset.type) {
    case 'image':
      return <img src={asset.content} alt={asset.title} className="w-full object-cover pointer-events-none" />;
    
    case 'video':
      return <video src={asset.content} className="w-full object-cover" controls={false} muted loop autoPlay />;
    
    case 'text':
    case 'character':
    case 'scene':
      return (
        <div className="p-8 bg-white min-h-[200px] prose prose-sm prose-slate max-w-none">
          <div dangerouslySetInnerHTML={{ __html: marked.parse(asset.content) }} />
        </div>
      );
    
    default:
      return <div className="p-4 text-xs text-gray-400">Unknown Asset Type</div>;
  }
};
