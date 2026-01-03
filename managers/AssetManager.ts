
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
   * 目标：将所有资产放置在非遮挡区域中心，并尽可能填满可用空间
   */
  fitToScreen = () => {
    const { assets, setViewport } = useAssetStore.getState();
    if (assets.length === 0) {
      setViewport({ x: 0, y: 0, zoom: 1 });
      return;
    }

    // 核心参数微调：减少留白以提高填充率
    const innerPadding = 40; 
    const cardWidth = 420;
    // 动态计算大致高度，或者使用更贴合的预估值（300-450）
    const estimatedCardHeight = 420; 

    // UI 实际占用尺寸（px）
    const toolbarWidth = 85;   // 左侧工具栏 60 + 间距
    const sidebarWidth = 480;  // 右侧面板 460 + 间距
    const topBarHeight = 20;   // 顶部留空
    const bottomHUDHeight = 90; // 底部 ZoomHUD 区域

    // 1. 计算所有资产构成的联合边界（世界坐标）
    const minX = Math.min(...assets.map(a => a.position.x));
    const maxX = Math.max(...assets.map(a => a.position.x + cardWidth));
    const minY = Math.min(...assets.map(a => a.position.y));
    const maxY = Math.max(...assets.map(a => a.position.y + estimatedCardHeight));

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    // 2. 计算除去遮挡后的物理可用区域尺寸
    const usableWidth = window.innerWidth - toolbarWidth - sidebarWidth;
    const usableHeight = window.innerHeight - topBarHeight - bottomHUDHeight;

    // 3. 计算缩放比：可用空间 / 内容空间
    // 增加填充感：减小 innerPadding 的比例影响
    const scaleX = (usableWidth - innerPadding * 2) / contentWidth;
    const scaleY = (usableHeight - innerPadding * 2) / contentHeight;
    
    // 限制最大缩放倍数，单张卡片不至于铺满全屏，多张卡片则尽可能填满
    const maxSafeZoom = assets.length === 1 ? 0.9 : 1.2;
    const nextZoom = Math.max(0.1, Math.min(scaleX, scaleY, maxSafeZoom));

    // 4. 计算视口偏移（Offset）
    // 目标是在 usable 区域的正中心显示 content 的中心
    const usableCenterX = toolbarWidth + usableWidth / 2;
    const usableCenterY = topBarHeight + usableHeight / 2;

    const contentCenterX = (minX + maxX) / 2;
    const contentCenterY = (minY + maxY) / 2;

    // Offset = ScreenCenter - (WorldCenter * Zoom)
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
