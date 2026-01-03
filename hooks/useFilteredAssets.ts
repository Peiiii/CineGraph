
import { useAssetStore } from '../stores/useAssetStore';
import { Asset } from '../types';

export const useFilteredAssets = (): Asset[] => {
  const { assets, activeTab } = useAssetStore();

  return assets.filter(a => {
    if (activeTab === 'all') return true;
    if (activeTab === 'media') return a.type === 'image';
    if (activeTab === 'video') return a.type === 'video';
    if (activeTab === 'text') return a.type === 'text' || a.type === 'character' || a.type === 'scene';
    return true;
  });
};
