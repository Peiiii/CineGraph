
import React from 'react';
import { useAssetStore } from '../../stores/useAssetStore';
import { usePresenter } from '../../PresenterContext';

export const Toolbar: React.FC = () => {
  const presenter = usePresenter();
  const { activeTab } = useAssetStore();

  const tools = [
    { id: 'all', icon: 'fa-solid fa-arrow-pointer', label: '选择模式' },
    { id: 'add', icon: 'fa-solid fa-plus', label: '添加资产' },
    { id: 'text', icon: 'fa-solid fa-t', label: '文字剧本' },
    { id: 'sep', isSep: true },
    { id: 'media', icon: 'fa-regular fa-image', ai: true, label: 'AI 生图' },
    { id: 'video', icon: 'fa-solid fa-film', ai: true, label: 'AI 视频' },
  ];

  return (
    <div className="absolute left-5 top-1/2 -translate-y-1/2 w-[60px] flex flex-col items-center py-6 bg-white border border-[#E9ECEF] rounded-[2.5rem] sharp-shadow z-[100] gap-2">
      {tools.map((item: any, idx: number) => (
        item.isSep ? (
          <div key={`sep-${idx}`} className="w-6 h-[1px] bg-[#F0F2F5] my-2"></div>
        ) : (
          <button 
            key={item.id}
            title={item.label}
            onClick={() => presenter.assetManager.setActiveTab(item.id)}
            className={`w-11 h-11 rounded-[16px] flex items-center justify-center transition-all relative ${
              activeTab === item.id ? 'bg-[#F0F2F5] text-black shadow-inner' : 'text-[#ADB5BD] hover:bg-[#F8F9FA] hover:text-black'
            }`}
          >
            <i className={`${item.icon} text-[16px]`}></i>
            {item.ai && <i className="fa-solid fa-sparkles text-[6px] absolute top-2 right-2 text-[#0066FF] animate-pulse"></i>}
          </button>
        )
      ))}
    </div>
  );
};
