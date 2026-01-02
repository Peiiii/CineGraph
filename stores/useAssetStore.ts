
import { create } from 'zustand';
import { Asset } from '../types';

const MOCK_ASSETS: Asset[] = [
  {
    id: 'mock-1',
    type: 'text',
    title: '剧本梗概：暗影都市',
    content: '### 第一幕：雨夜的邂逅\n在2077年的新德里，霓虹灯在积水中破碎。私家侦探**K**站在天桥上，抽着最后一根合成烟。一个穿着透明雨衣的女孩向他走来，手里握着一块散发着蓝光的芯片。',
    createdAt: Date.now() - 100000
  },
  {
    id: 'mock-2',
    type: 'image',
    title: '角色设定：私家侦探 K',
    content: 'https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?auto=format&fit=crop&q=80&w=1000',
    metadata: { prompt: 'Futuristic detective noir style, heavy rain, neon lights reflection' },
    createdAt: Date.now() - 80000
  },
  {
    id: 'mock-3',
    type: 'image',
    title: '分镜：天桥远景',
    content: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&q=80&w=1000',
    metadata: { prompt: 'Cyberpunk city landscape, wide shot, cinematic lighting' },
    createdAt: Date.now() - 60000
  }
];

interface AssetState {
  assets: Asset[];
  selectedIds: Set<string>;
  activeTab: 'all' | 'media' | 'video' | 'text' | 'scenes';
  setAssets: (assets: Asset[] | ((prev: Asset[]) => Asset[])) => void;
  setSelectedIds: (ids: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  setActiveTab: (tab: 'all' | 'media' | 'video' | 'text' | 'scenes') => void;
}

export const useAssetStore = create<AssetState>((set) => ({
  assets: MOCK_ASSETS,
  selectedIds: new Set(),
  activeTab: 'all',
  setAssets: (assets) => set((state) => ({ 
    assets: typeof assets === 'function' ? assets(state.assets) : assets 
  })),
  setSelectedIds: (ids) => set((state) => ({ 
    selectedIds: typeof ids === 'function' ? ids(state.selectedIds) : ids 
  })),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
