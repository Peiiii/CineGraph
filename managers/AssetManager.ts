
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
   * 极简数学聚焦：计算净可视区域并完美对齐
   */
  private applyFocusToAssets = (targetAssets: Asset[]) => {
    if (targetAssets.length === 0) return;

    const { setViewport, setIsInteracting } = useAssetStore.getState();
    
    // 1. 临时关闭交互，启用 CSS Transition
    setIsInteracting(false);

    // 2. 定义真正的“视口净空区” (Viewable Void)
    // 左侧：工具栏占据 88px，预留 100px 呼吸
    const LEFT_OFFSET = 100;
    // 右侧：侧边栏占据 388px，预留 400px 呼吸
    const RIGHT_OFFSET = 400;
    // 顶部/底部：仅预留少量平衡边距，ZoomHUD 是悬浮的，不应深度参与居中偏移计算
    const TOP_OFFSET = 40;
    const BOTTOM_OFFSET = 40; 

    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;
    
    // 计算资产应该居中的“目标矩形”
    const usableWidth = canvasWidth - LEFT_OFFSET - RIGHT_OFFSET;
    const usableHeight = canvasHeight - TOP_OFFSET - BOTTOM_OFFSET;

    // 3. 计算资产的“最小世界包围盒”
    // 卡片宽度固定为 420
    const CARD_WIDTH = 420;
    const minX = Math.min(...targetAssets.map(a => a.position.x));
    const maxX = Math.max(...targetAssets.map(a => a.position.x + CARD_WIDTH));
    
    // 动态高度估算：根据内容行数或类型进行更紧凑的估算
    const minY = Math.min(...targetAssets.map(a => a.position.y));
    const maxY = Math.max(...targetAssets.map(a => {
      let h = 300; 
      if (a.type === 'character') h = 420; // 调低估算高度，防止重心下移
      if (a.type === 'image' || a.type === 'video') h = 240;
      if (a.type === 'text' || a.type === 'scene') h = 320;
      return a.position.y + h;
    }));

    const worldW = maxX - minX;
    const worldH = maxY - minY;

    // 4. 计算缩放倍率 (缩减 Padding，让内容占比更大)
    const INNER_PADDING = 30; // 极小的内部缓冲，使资产更饱满
    const targetW = usableWidth - (INNER_PADDING * 2);
    const targetH = usableHeight - (INNER_PADDING * 2);

    const zoomX = targetW / worldW;
    const zoomY = targetH / worldH;
    
    let nextZoom = Math.min(zoomX, zoomY);
    
    // 提升缩放上限：单卡片允许放大到 1.3 倍以充满视野
    if (targetAssets.length === 1) {
      nextZoom = Math.min(nextZoom, 1.3);
    } else {
      nextZoom = Math.min(nextZoom, 1.0);
    }
    nextZoom = Math.max(0.1, nextZoom);

    // 5. 核心：计算视口偏移 (完美的几何对齐)
    // 视觉上的中心点 (屏幕坐标)
    const visualCenterX = LEFT_OFFSET + (usableWidth / 2);
    const visualCenterY = TOP_OFFSET + (usableHeight / 2);

    // 资产包围盒的中心点 (世界坐标)
    const worldCenterX = minX + (worldW / 2);
    const worldCenterY = minY + (worldH / 2);

    // ViewportOffset = ScreenCenter - (WorldCenter * Zoom)
    const nextX = visualCenterX - (worldCenterX * nextZoom);
    const nextY = visualCenterY - (worldCenterY * nextZoom);

    // 6. 应用更新
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
