
import { useAssetStore } from '../stores/useAssetStore';
import { Asset } from '../types';

export class AssetManager {
  addAsset = (asset: Asset) => {
    useAssetStore.getState().setAssets((prev) => [asset, ...prev]);
  };

  removeAsset = (id: string) => {
    useAssetStore.getState().setAssets((prev) => prev.filter(a => a.id !== id));
    this.deselectAsset(id);
  };

  toggleSelection = (id: string) => {
    const { setSelectedIds, selectedIds } = useAssetStore.getState();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  deselectAsset = (id: string) => {
    const { setSelectedIds, selectedIds } = useAssetStore.getState();
    if (selectedIds.has(id)) {
      const next = new Set(selectedIds);
      next.delete(id);
      setSelectedIds(next);
    }
  };

  setActiveTab = (tab: any) => {
    useAssetStore.getState().setActiveTab(tab);
  };

  getSelectedAssets = () => {
    const { assets, selectedIds } = useAssetStore.getState();
    return assets.filter(a => selectedIds.has(a.id));
  };
}
