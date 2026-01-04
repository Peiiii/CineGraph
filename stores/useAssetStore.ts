
import { create } from 'zustand';
import { Asset, Viewport } from '../types';

export const MOCK_ASSETS: Asset[] = [
  {
    id: 'mock-char-1',
    type: 'character',
    title: '主角：侦探 K',
    position: { x: 100, y: 100 },
    content: '### 核心档案\n- **全名**: K (真名已抹除)\n- **动机**: 寻找失踪的妹妹\n- **特质**: 沉默寡言、义体化左手\n\n### 详细设定\n曾是新德里警方的精英侦探，在一次调查中被陷害。现在在下城区经营一家非法调查所，性格冷酷但对受难者有同情心。',
    createdAt: Date.now() - 120000
  },
  {
    id: 'mock-1',
    type: 'text',
    title: '剧本梗概：暗影都市',
    position: { x: 550, y: 100 },
    content: '### 第一幕：雨夜的邂逅\n在2077年的新德里，霓虹灯在积水中破碎。私家侦探**K**站在天桥上，抽着最后一根合成烟。一个穿着透明雨衣的女孩向他走来，手里握着一块散发着蓝光的芯片。',
    createdAt: Date.now() - 100000
  },
  {
    id: 'mock-2',
    type: 'image',
    title: '视觉风格参考',
    position: { x: 1000, y: 100 },
    content: 'https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?auto=format&fit=crop&q=80&w=1000',
    metadata: { prompt: 'Futuristic detective noir style, heavy rain, neon lights reflection' },
    createdAt: Date.now() - 80000
  }
];

interface AssetState {
  assets: Asset[];
  viewport: Viewport;
  selectedIds: Set<string>;
  activeTab: 'all' | 'media' | 'video' | 'text' | 'scenes' | 'character';
  setAssets: (assets: Asset[] | ((prev: Asset[]) => Asset[])) => void;
  setViewport: (v: Viewport | ((prev: Viewport) => Viewport)) => void;
  setSelectedIds: (ids: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  setActiveTab: (tab: 'all' | 'media' | 'video' | 'text' | 'scenes' | 'character') => void;
}

export const useAssetStore = create<AssetState>((set) => ({
  assets: MOCK_ASSETS,
  viewport: { x: 0, y: 0, zoom: 1 },
  selectedIds: new Set(),
  activeTab: 'all',
  setAssets: (assets) => set((state) => ({ 
    assets: typeof assets === 'function' ? assets(state.assets) : assets 
  })),
  setViewport: (viewport) => set((state) => ({
    viewport: typeof viewport === 'function' ? viewport(state.viewport) : viewport
  })),
  setSelectedIds: (ids) => set((state) => ({ 
    selectedIds: typeof ids === 'function' ? ids(state.selectedIds) : ids 
  })),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
