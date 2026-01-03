
import { useAssetStore } from '../stores/useAssetStore';
import { Asset, Viewport } from '../types';

export class AssetManager {
  addAsset = (asset: Omit<Asset, 'position'>) => {
    const { viewport } = useAssetStore.getState();
    const position = {
      x: -viewport.x / viewport.zoom + (window.innerWidth / 2) / viewport.zoom - 200,
      y: -viewport.y / viewport.zoom + (window.innerHeight / 2) / viewport.zoom - 150,
    };
    useAssetStore.getState().setAssets((prev) => [{ ...asset, position } as Asset, ...prev]);
  };

  updateAssetPosition = (id: string, x: number, y: number) => {
    useAssetStore.getState().setAssets((prev) => 
      prev.map(a => a.id === id ? { ...a, position: { x, y } } : a)
    );
  };

  removeAsset = (id: string) => {
    useAssetStore.getState().setAssets((prev) => prev.filter(a => a.id !== id));
  };

  setViewport = (v: Partial<Viewport> | ((prev: Viewport) => Viewport)) => {
    useAssetStore.getState().setViewport(prev => {
      const next = typeof v === 'function' ? v(prev) : { ...prev, ...v };
      return { ...next, zoom: Math.max(0.05, Math.min(next.zoom, 5)) };
    });
  };

  /**
   * 一键自适应屏幕逻辑
   */
  fitToScreen = () => {
    const { assets, setViewport } = useAssetStore.getState();
    if (assets.length === 0) {
      setViewport({ x: 0, y: 0, zoom: 1 });
      return;
    }

    const innerPadding = 30; 
    const cardWidth = 420;
    const estimatedCardHeight = 420; 

    // UI 实际占用尺寸 (紧凑化后更新)
    const toolbarWidth = 85;   
    const sidebarWidth = 340;  // 320 面板 + 8 边缘 + 12 安全间距
    const topBarHeight = 10;   
    const bottomHUDHeight = 80; 

    const minX = Math.min(...assets.map(a => a.position.x));
    const maxX = Math.max(...assets.map(a => a.position.x + cardWidth));
    const minY = Math.min(...assets.map(a => a.position.y));
    const maxY = Math.max(...assets.map(a => a.position.y + estimatedCardHeight));

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    const usableWidth = window.innerWidth - toolbarWidth - sidebarWidth;
    const usableHeight = window.innerHeight - topBarHeight - bottomHUDHeight;

    const scaleX = (usableWidth - innerPadding * 2) / contentWidth;
    const scaleY = (usableHeight - innerPadding * 2) / contentHeight;
    
    const maxSafeZoom = assets.length === 1 ? 0.95 : 1.25;
    const nextZoom = Math.max(0.1, Math.min(scaleX, scaleY, maxSafeZoom));

    const usableCenterX = toolbarWidth + usableWidth / 2;
    const usableCenterY = topBarHeight + usableHeight / 2;

    const contentCenterX = (minX + maxX) / 2;
    const contentCenterY = (minY + maxY) / 2;

    const nextX = usableCenterX - contentCenterX * nextZoom;
    const nextY = usableCenterY - contentCenterY * nextZoom;

    setViewport({ x: nextX, y: nextY, zoom: nextZoom });
  };

  toggleSelection = (id: string) => {
    const { setSelectedIds, selectedIds } = useAssetStore.getState();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  setActiveTab = (tab: any) => {
    useAssetStore.getState().setActiveTab(tab);
  };
}
