
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
   * 极简而精确的几何聚焦
   */
  private applyFocusToAssets = (targetAssets: Asset[]) => {
    if (targetAssets.length === 0) return;

    const { setViewport, setIsInteracting } = useAssetStore.getState();
    
    // 启用动画
    setIsInteracting(false);

    // --- 1. 定义视觉可见矩形 (避开 UI 遮挡) ---
    const UI_LEFT = 85;   // Toolbar
    const UI_RIGHT = 380; // Agent Sidebar
    const UI_BOTTOM = 80; // 底部 HUD 区域
    const UI_TOP = 0;     // 顶部通常是空的

    const usableRect = {
      left: UI_LEFT,
      right: window.innerWidth - UI_RIGHT,
      top: UI_TOP,
      bottom: window.innerHeight - UI_BOTTOM
    };

    const usableWidth = usableRect.right - usableRect.left;
    const usableHeight = usableRect.bottom - usableRect.top;

    // --- 2. 计算资产群组的“世界坐标”包围盒 ---
    const CARD_WIDTH = 420;
    const minX = Math.min(...targetAssets.map(a => a.position.x));
    const maxX = Math.max(...targetAssets.map(a => a.position.x + CARD_WIDTH));
    const minY = Math.min(...targetAssets.map(a => a.position.y));
    const maxY = Math.max(...targetAssets.map(a => {
      // 预估卡片高度（带有一点余量以保证视觉重心居中）
      let h = 350;
      if (a.type === 'character') h = 550;
      if (a.type === 'image' || a.type === 'video') h = 280;
      return a.position.y + h;
    }));

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    // --- 3. 计算最佳缩放 ---
    const PADDING = 24; 
    const zoomX = (usableWidth - PADDING * 2) / contentWidth;
    const zoomY = (usableHeight - PADDING * 2) / contentHeight;
    let nextZoom = Math.min(zoomX, zoomY);
    
    // 针对单卡或多卡设置合理的缩放上限
    nextZoom = targetAssets.length === 1 ? Math.min(nextZoom, 1.4) : Math.min(nextZoom, 1.05);
    nextZoom = Math.max(0.1, nextZoom);

    // --- 4. 完美对齐视觉中心 ---
    // 我们的目标是让 [assetCenterX, assetCenterY] 在缩放后，
    // 重合在屏幕上的 [visualCenterX, visualCenterY]。
    const visualCenterX = (usableRect.left + usableRect.right) / 2;
    const visualCenterY = (usableRect.top + usableRect.bottom) / 2;

    const assetCenterX = (minX + maxX) / 2;
    const assetCenterY = (minY + maxY) / 2;

    const nextX = visualCenterX - (assetCenterX * nextZoom);
    const nextY = visualCenterY - (assetCenterY * nextZoom);

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
