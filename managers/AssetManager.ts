
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
   */
  private applyFocusToAssets = (targetAssets: Asset[]) => {
    if (targetAssets.length === 0) return;

    const { setViewport } = useAssetStore.getState();
    
    // 配置参数
    const cardWidth = 420;
    const cardHeightEstimate = 500; // 预留稍微多一点高度
    const safePadding = 80; // 四周预留边距

    // 可用区域计算 (避开 UI 遮挡)
    const toolbarWidth = 85;   
    const sidebarWidth = 380; // 侧边栏宽度
    const topBarHeight = 20;   
    const bottomHUDHeight = 100; 

    const usableWidth = window.innerWidth - toolbarWidth - sidebarWidth;
    const usableHeight = window.innerHeight - topBarHeight - bottomHUDHeight;

    // 计算选中目标的包围盒 (World Space)
    const minX = Math.min(...targetAssets.map(a => a.position.x));
    const maxX = Math.max(...targetAssets.map(a => a.position.x + cardWidth));
    const minY = Math.min(...targetAssets.map(a => a.position.y));
    const maxY = Math.max(...targetAssets.map(a => a.position.y + (a.type === 'character' ? 600 : cardHeightEstimate)));

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    // 计算能够让内容完全进入可用区域的缩放比例
    const zoomX = (usableWidth - safePadding * 2) / contentWidth;
    const zoomY = (usableHeight - safePadding * 2) / contentHeight;
    
    // 最终缩放值：取最小值确保不超出，并设置安全上限
    let nextZoom = Math.min(zoomX, zoomY);
    
    // 针对单张资产的特殊优化：不要放得太大，保持在一个舒适的 0.8-0.9 比例
    if (targetAssets.length === 1) {
      nextZoom = Math.min(nextZoom, 0.85);
    } else {
      // 多张资产时，允许稍微大一点但最高不超过 1.0
      nextZoom = Math.min(nextZoom, 1.0);
    }

    // 确保缩放不低于最小值
    nextZoom = Math.max(0.1, nextZoom);

    // 计算可用区域的中心点 (Screen Space)
    const viewCenterX = toolbarWidth + usableWidth / 2;
    const viewCenterY = topBarHeight + usableHeight / 2;

    // 计算内容的几何中心 (World Space)
    const contentCenterX = (minX + maxX) / 2;
    const contentCenterY = (minY + maxY) / 2;

    // 计算应用缩放后的偏移量
    const nextX = viewCenterX - contentCenterX * nextZoom;
    const nextY = viewCenterY - contentCenterY * nextZoom;

    // 应用变换
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
