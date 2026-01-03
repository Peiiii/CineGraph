
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
   * 避开：左侧工具栏 (80px), 右侧 Agent 面板 (480px)
   */
  fitToScreen = () => {
    const { assets, setViewport } = useAssetStore.getState();
    if (assets.length === 0) {
      setViewport({ x: 0, y: 0, zoom: 1 });
      return;
    }

    const margin = 80; // 画布边缘的额外留白
    const cardWidth = 420;
    const estimatedCardHeight = 450; 

    // UI 遮挡区域定义
    const leftUIWidth = 120; // 包含 Toolbar 和间距
    const rightUIWidth = 500; // 包含 AgentSidebar 和间距
    const topUIHeight = 40;
    const bottomUIHeight = 100; // 包含 HUD

    // 计算资产群组的边界（世界坐标）
    const minX = Math.min(...assets.map(a => a.position.x));
    const maxX = Math.max(...assets.map(a => a.position.x + cardWidth));
    const minY = Math.min(...assets.map(a => a.position.y));
    const maxY = Math.max(...assets.map(a => a.position.y + estimatedCardHeight));

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    // 计算真正“露出来”的可用物理空间
    const usableWidth = window.innerWidth - leftUIWidth - rightUIWidth;
    const usableHeight = window.innerHeight - topUIHeight - bottomUIHeight;

    // 计算缩放：需要把 content 塞进 usable 空间，并留出 margin
    const scaleX = (usableWidth - margin * 2) / contentWidth;
    const scaleY = (usableHeight - margin * 2) / contentHeight;
    // 限制最大缩放为 1.1x，最小为 0.1x，防止过大遮挡美感
    const nextZoom = Math.max(0.1, Math.min(scaleX, scaleY, 1.1));

    // 计算可用区域的物理中心点
    const usableCenterX = leftUIWidth + usableWidth / 2;
    const usableCenterY = topUIHeight + usableHeight / 2;

    // 内容的世界中心点
    const contentCenterX = (minX + maxX) / 2;
    const contentCenterY = (minY + maxY) / 2;

    // 偏移量 = 目标中心点 - (世界中心点 * 缩放)
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
