
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
    
    case 'character':
      return (
        <div className="bg-white min-h-[250px] overflow-hidden flex flex-col">
          {/* 角色档案顶栏装饰 */}
          <div className="h-2 bg-[#1A1C1E] w-full" />
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6 border-b border-[#F1F3F5] pb-4">
               <div className="w-10 h-10 bg-[#F8F9FA] rounded-full flex items-center justify-center text-[#1A1C1E]">
                  <i className="fa-solid fa-user-tie text-lg"></i>
               </div>
               <div>
                 <div className="text-[10px] font-black text-[#0066FF] uppercase tracking-wider mb-0.5">Character Dossier</div>
                 <div className="text-[16px] font-bold text-black">{asset.title}</div>
               </div>
            </div>
            
            <div className="prose prose-sm prose-slate max-w-none prose-headings:text-blue-600 prose-headings:mt-4 first:prose-headings:mt-0">
              <div dangerouslySetInnerHTML={{ __html: marked.parse(asset.content) }} />
            </div>
          </div>
        </div>
      );

    case 'text':
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
