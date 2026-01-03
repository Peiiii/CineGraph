
import React from 'react';
import { useAssetStore } from '../../stores/useAssetStore';
import { usePresenter } from '../../PresenterContext';
import { TabButton } from '../ui/TabButton';
import { ActionButton } from '../ui/ActionButton';

export const Toolbar: React.FC = () => {
  const presenter = usePresenter();
  const { activeTab } = useAssetStore();

  const tabs = [
    { id: 'all', icon: 'fa-solid fa-arrow-pointer', label: '全部资产' },
    { id: 'text', icon: 'fa-solid fa-file-lines', label: '剧本与文字' },
    { id: 'media', icon: 'fa-regular fa-image', ai: true, label: '分镜图片' },
    { id: 'video', icon: 'fa-solid fa-film', ai: true, label: '视频动态' },
  ];

  return (
    <div className="no-canvas-interaction absolute left-6 top-1/2 -translate-y-1/2 w-16 flex flex-col items-center py-3 bg-white/95 backdrop-blur-xl border border-[#E9ECEF] rounded-[2rem] sharp-shadow z-[100] gap-1.5">
      {tabs.map((tab) => (
        <TabButton 
          key={tab.id}
          icon={tab.icon}
          label={tab.label}
          hasAI={tab.ai}
          active={activeTab === tab.id}
          onClick={() => presenter.assetManager.setActiveTab(tab.id)}
        />
      ))}
      
      <div className="w-8 h-[1px] bg-[#F1F3F5] my-1.5"></div>
      
      <ActionButton 
        icon="fa-solid fa-plus" 
        title="添加资产" 
        className="!w-11 !h-11 !rounded-[14px]"
        onClick={() => presenter.assetManager.addAsset({ 
          id: Math.random().toString(36).substr(2, 9), 
          type: 'text', 
          title: '新建便签', 
          content: '在此输入内容...', 
          createdAt: Date.now() 
        })} 
      />
    </div>
  );
};
