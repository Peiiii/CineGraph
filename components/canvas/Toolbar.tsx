
import React from 'react';
import { useAssetStore } from '../../stores/useAssetStore';
import { usePresenter } from '../../PresenterContext';
import { Tooltip } from '../ui/Tooltip';

export const Toolbar: React.FC = () => {
  const presenter = usePresenter();
  const { activeTab } = useAssetStore();

  const tools = [
    { id: 'all', icon: 'fa-solid fa-arrow-pointer', label: '全部资产' },
    { id: 'text', icon: 'fa-solid fa-file-lines', label: '剧本与文字' },
    { id: 'media', icon: 'fa-regular fa-image', ai: true, label: '分镜图片' },
    { id: 'video', icon: 'fa-solid fa-film', ai: true, label: '视频动态' },
    { id: 'sep', isSep: true },
    { id: 'add_text', icon: 'fa-solid fa-plus', label: '手动添加资产', action: () => presenter.assetManager.addAsset({ 
      id: Math.random().toString(36).substr(2, 9), 
      type: 'text', 
      title: '新建便签', 
      content: '在此输入内容...', 
      createdAt: Date.now() 
    }) },
  ];

  return (
    <div className="no-canvas-interaction absolute left-6 top-1/2 -translate-y-1/2 w-[68px] flex flex-col items-center py-6 bg-white/90 backdrop-blur-xl border border-[#E9ECEF] rounded-[2.5rem] sharp-shadow z-[100] gap-3">
      {tools.map((item: any, idx: number) => (
        item.isSep ? (
          <div key={`sep-${idx}`} className="w-8 h-[1px] bg-[#F1F3F5] my-1"></div>
        ) : (
          <Tooltip key={item.id} content={item.label} position="right">
            <button 
              onClick={item.action ? item.action : () => presenter.assetManager.setActiveTab(item.id)}
              className={`w-12 h-12 rounded-[18px] flex items-center justify-center transition-all duration-300 relative group active:scale-95 ${
                activeTab === item.id 
                  ? 'bg-[#E2E6EA] text-[#1A1C1E] shadow-sm ring-1 ring-[#DEE2E6]' 
                  : 'text-[#ADB5BD] hover:bg-[#F1F3F5] hover:text-[#1A1C1E]'
              }`}
            >
              <i className={`${item.icon} text-[18px] transition-transform group-hover:scale-105`}></i>
              {item.ai && (
                <div className="absolute -top-1 -right-1 flex items-center justify-center">
                   <i className="fa-solid fa-sparkles text-[8px] text-[#0066FF] animate-pulse"></i>
                </div>
              )}
            </button>
          </Tooltip>
        )
      ))}
    </div>
  );
};
