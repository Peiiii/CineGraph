
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
   * 增强型聚焦：确保绝对垂直居中并预留垂直边距
   */
  private applyFocusToAssets = (targetAssets: Asset[]) => {
    if (targetAssets.length === 0) return;

    const { setViewport, setIsInteracting } = useAssetStore.getState();
    
    // 强制先结束交互状态以启用跳转动画
    setIsInteracting(false);

    // --- 1. 精确 UI 区域定义 ---
    const UI_LEFT = 88;    // Toolbar 宽度
    const UI_RIGHT = 396;  // Sidebar 宽度 + 间距
    const UI_BOTTOM = 110; // ZoomHUD 浮动高度 + 安全余量
    const UI_TOP = 40;     // 顶部呼吸感边距

    const usableRect = {
      left: UI_LEFT,
      right: window.innerWidth - UI_RIGHT,
      top: UI_TOP,
      bottom: window.innerHeight - UI_BOTTOM
    };

    const usableWidth = usableRect.right - usableRect.left;
    const usableHeight = usableRect.bottom - usableRect.top;

    // --- 2. 资产物理边界计算 ---
    const CARD_WIDTH = 420;
    const minX = Math.min(...targetAssets.map(a => a.position.x));
    const maxX = Math.max(...targetAssets.map(a => a.position.x + CARD_WIDTH));
    const minY = Math.min(...targetAssets.map(a => a.position.y));
    const maxY = Math.max(...targetAssets.map(a => {
      // 对高度预估进行精算，这是垂直居中的关键
      let h = 320; 
      if (a.type === 'character') h = 540;
      if (a.type === 'image' || a.type === 'video') h = 276;
      if (a.type === 'text' || a.type === 'scene') h = 360;
      return a.position.y + h + 40; // 40 为卡片下方阴影和标题高度
    }));

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    // --- 3. 缩放算法（包含强制边距） ---
    const HORIZONTAL_MARGIN = 40;
    const VERTICAL_MARGIN = 60; // 明确的上下边距，防止贴边

    const zoomX = (usableWidth - HORIZONTAL_MARGIN * 2) / contentWidth;
    const zoomY = (usableHeight - VERTICAL_MARGIN * 2) / contentHeight;
    
    let nextZoom = Math.min(zoomX, zoomY);
    
    // 动态调整缩放阈值
    if (targetAssets.length === 1) {
      nextZoom = Math.min(nextZoom, 1.3); 
    } else {
      nextZoom = Math.min(nextZoom, 1.0);
    }
    nextZoom = Math.max(0.1, nextZoom);

    // --- 4. 视觉几何中心对齐 ---
    // 目标点：视觉可用区域的中心坐标
    const targetVisualX = (usableRect.left + usableRect.right) / 2;
    const targetVisualY = (usableRect.top + usableRect.bottom) / 2;

    // 资产中心点（世界坐标）
    const assetCenterX = (minX + maxX) / 2;
    const assetCenterY = (minY + maxY) / 2;

    // ViewportOffset = TargetScreenPos - (WorldPos * Zoom)
    const nextX = targetVisualX - (assetCenterX * nextZoom);
    const nextY = targetVisualY - (assetCenterY * nextZoom);

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
