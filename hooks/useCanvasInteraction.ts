
import { useState, RefObject, useEffect } from 'react';
import { usePresenter } from '../PresenterContext';
import { useAssetStore } from '../stores/useAssetStore';

export const useCanvasInteraction = (canvasRef: RefObject<HTMLDivElement>) => {
  const presenter = usePresenter();
  const { viewport } = useAssetStore();
  const [isPanning, setIsPanning] = useState(false);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // 检查是否是缩放操作（触控板捏合或 Ctrl+滚轮）
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();

        // 提升敏感度：将缩放步长和基础系数调大
        // deltaY 正常滚动通常是 100 或 -100
        const delta = -e.deltaY;
        
        // 使用更激进的缩放系数，基础 1.25 倍
        // 敏感度系数从 0.0025 提升到 0.005，感官上会快一倍以上
        const zoomSpeed = 0.005; 
        const zoomFactor = Math.pow(1.25, (delta * zoomSpeed));
        const newZoom = viewport.zoom * zoomFactor;

        const rect = el.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const worldX = (mouseX - viewport.x) / viewport.zoom;
        const worldY = (mouseY - viewport.y) / viewport.zoom;

        // 限制缩放范围在 0.05x 到 5x 之间
        const nextZoom = Math.max(0.05, Math.min(newZoom, 5));
        const newX = mouseX - worldX * nextZoom;
        const newY = mouseY - worldY * nextZoom;

        presenter.assetManager.setViewport({ zoom: nextZoom, x: newX, y: newY });
      } else {
        // 普通平移逻辑
        // 提高平移速度，1.5倍系数让拖拽更跟手
        presenter.assetManager.setViewport({ 
          x: viewport.x - e.deltaX * 1.5, 
          y: viewport.y - e.deltaY * 1.5 
        });
      }
    };

    // 针对 Safari 的手势事件（捏合缩放）
    const onGestureStart = (e: Event) => e.preventDefault();
    const onGestureChange = (e: Event) => e.preventDefault();

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('gesturestart', onGestureStart);
    el.addEventListener('gesturechange', onGestureChange);

    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('gesturestart', onGestureStart);
      el.removeEventListener('gesturechange', onGestureChange);
    };
  }, [viewport, presenter]);

  const startPanning = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // 只有点击背景或按住 Alt 键时才触发平移
    const isBackground = target === canvasRef.current || target.classList.contains('canvas-viewport-layer');
    
    if (e.button === 0 && (isBackground || e.altKey)) {
      setIsPanning(true);
      const startX = e.clientX - viewport.x;
      const startY = e.clientY - viewport.y;

      const onMouseMove = (moveEvent: MouseEvent) => {
        presenter.assetManager.setViewport({
          x: moveEvent.clientX - startX,
          y: moveEvent.clientY - startY
        });
      };

      const onMouseUp = () => {
        setIsPanning(false);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
  };

  return { startPanning, isPanning };
};
