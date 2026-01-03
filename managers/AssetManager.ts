
import { useAssetStore } from '../stores/useAssetStore';
import { Asset, Viewport } from '../types';

export class AssetManager {
  addAsset = (asset: Omit<Asset, 'position'>) => {
    const { viewport } = useAssetStore.getState();
    // 默认放在视口中心
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
   * 需要避开：
   * 1. 左侧 Toolbar (约 80px)
   * 2. 右侧 AgentSidebar (约 480px)
   * 3. 上下 Padding (约 40px)
   */
  fitToScreen = () => {
    const { assets, setViewport } = useAssetStore.getState();
    if (assets.length === 0) {
      setViewport({ x: 0, y: 0, zoom: 1 });
      return;
    }

    const padding = 60; // 内部留白
    const cardWidth = 420;
    const estimatedCardHeight = 450; // 包含标题的预估高度

    // 定义物理遮挡区域
    const leftObstruction = 100; // Toolbar (60) + Margin (20) + Buffer
    const rightObstruction = 500; // Sidebar (460) + Margin (16) + Buffer
    const topObstruction = 40;
    const bottomObstruction = 80; // HUD 区域

    // 计算资产群组在世界坐标系下的包围盒
    const minX = Math.min(...assets.map(a => a.position.x));
    const maxX = Math.max(...assets.map(a => a.position.x + cardWidth));
    const minY = Math.min(...assets.map(a => a.position.y));
    const maxY = Math.max(...assets.map(a => a.position.y + estimatedCardHeight));

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    // 计算实际可用的画布区域（避开 UI 遮挡）
    const availableWidth = window.innerWidth - leftObstruction - rightObstruction;
    const availableHeight = window.innerHeight - topObstruction - bottomObstruction;

    // 计算缩放比例，取宽高缩放的最小值，并设置上下限
    const scaleX = (availableWidth - padding * 2) / contentWidth;
    const scaleY = (availableHeight - padding * 2) / contentHeight;
    const nextZoom = Math.max(0.1, Math.min(scaleX, scaleY, 1.2));

    // 计算可用区域的中心点（屏幕坐标）
    const visibleCenterX = leftObstruction + availableWidth / 2;
    const visibleCenterY = topObstruction + availableHeight / 2;

    // 计算内容群组的中心点（世界坐标）
    const contentCenterX = (minX + maxX) / 2;
    const contentCenterY = (minY + maxY) / 2;

    // 根据中心点对齐公式：ScreenPos = WorldPos * Zoom + Offset
    // 推导 Offset = ScreenPos - WorldPos * Zoom
    const nextX = visibleCenterX - contentCenterX * nextZoom;
    const nextY = visibleCenterY - contentCenterY * nextZoom;

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
