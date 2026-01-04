
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
   * 核心聚焦逻辑：计算一组资产的范围，并自动计算最佳缩放比例和居中位置
   * 优化版：更小的边距，更高的利用率
   */
  private applyFocusToAssets = (targetAssets: Asset[]) => {
    if (targetAssets.length === 0) return;

    const { setViewport } = useAssetStore.getState();
    
    // 配置参数 - 更加激进的布局
    const cardWidth = 420;
    const safePadding = 40; // 从 80 降至 40，增加利用率

    // 避让 UI 区域
    const toolbarWidth = 85;   
    const sidebarWidth = 380; 
    const topBarHeight = 20;   
    const bottomHUDHeight = 100; 

    const usableWidth = window.innerWidth - toolbarWidth - sidebarWidth;
    const usableHeight = window.innerHeight - topBarHeight - bottomHUDHeight;

    // 计算选中目标的包围盒 (World Space)
    const minX = Math.min(...targetAssets.map(a => a.position.x));
    const maxX = Math.max(...targetAssets.map(a => a.position.x + cardWidth));
    const minY = Math.min(...targetAssets.map(a => a.position.y));
    const maxY = Math.max(...targetAssets.map(a => {
      // 不同类型卡片高度不同
      let height = 450; 
      if (a.type === 'character') height = 620;
      if (a.type === 'image' || a.type === 'video') height = 300;
      return a.position.y + height;
    }));

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    // 计算缩放比例
    const zoomX = (usableWidth - safePadding * 2) / contentWidth;
    const zoomY = (usableHeight - safePadding * 2) / contentHeight;
    
    let nextZoom = Math.min(zoomX, zoomY);
    
    // 提升上限，允许更近距离的观察
    if (targetAssets.length === 1) {
      nextZoom = Math.min(nextZoom, 1.1); // 单卡片允许略微放大超过 1:1
    } else {
      nextZoom = Math.min(nextZoom, 1.0); // 多卡片最高 1.0
    }

    nextZoom = Math.max(0.1, nextZoom);

    // 计算显示中心
    const viewCenterX = toolbarWidth + usableWidth / 2;
    const viewCenterY = topBarHeight + (usableHeight / 2) - 20; // 视觉重心上移 20px

    const contentCenterX = (minX + maxX) / 2;
    const contentCenterY = (minY + maxY) / 2;

    const nextX = viewCenterX - contentCenterX * nextZoom;
    const nextY = viewCenterY - contentCenterY * nextZoom;

    setViewport({ x: nextX, y: nextY, zoom: nextZoom });
  };

  fitToScreen = () => {
    const { assets } = useAssetStore.getState();
    if (assets.length === 0) {
      this.setViewport({ x: 0, y: 0, zoom: 1 });
      return;
    }
    this.applyFocusToAssets(assets);
  };

  focusSelected = () => {
    const { assets, selectedIds } = useAssetStore.getState();
    const selectedAssets = assets.filter(a => selectedIds.has(a.id));
    
    if (selectedAssets.length === 0) {
      this.fitToScreen();
    } else {
      this.applyFocusToAssets(selectedAssets);
    }
  };

  toggleSelection = (id: string, multi: boolean = false) => {
    const { setSelectedIds, selectedIds } = useAssetStore.getState();
    if (!multi) {
      setSelectedIds(new Set([id]));
    } else {
      const next = new Set(selectedIds);
      if (next.has(id)) next.delete(id); else next.add(id);
      setSelectedIds(next);
    }
  };

  setActiveTab = (tab: any) => {
    useAssetStore.getState().setActiveTab(tab);
  };
}
