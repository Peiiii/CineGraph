
import { create } from 'zustand';
import { Asset } from '../types';

interface AssetState {
  assets: Asset[];
  selectedIds: Set<string>;
  activeTab: 'all' | 'media' | 'video' | 'text' | 'scenes';
  setAssets: (assets: Asset[] | ((prev: Asset[]) => Asset[])) => void;
  setSelectedIds: (ids: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  setActiveTab: (tab: 'all' | 'media' | 'video' | 'text' | 'scenes') => void;
}

export const useAssetStore = create<AssetState>((set) => ({
  assets: [],
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
