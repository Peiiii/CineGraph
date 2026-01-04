
import React, { useState, RefObject, useEffect, useRef } from 'react';
import { usePresenter } from '../PresenterContext';
import { useAssetStore } from '../stores/useAssetStore';

export const useCanvasInteraction = (canvasRef: RefObject<HTMLDivElement>) => {
  const presenter = usePresenter();
  const { viewport, setIsInteracting } = useAssetStore();
  const [isPanning, setIsPanning] = useState(false);
  const interactionTimer = useRef<number | null>(null);

  // 辅助函数：进入交互模式（禁用动画）
  const startInteraction = () => {
    setIsInteracting(true);
    if (interactionTimer.current) window.clearTimeout(interactionTimer.current);
  };

  // 辅助函数：结束交互模式（延时恢复动画，避免闪烁）
  const endInteraction = () => {
    interactionTimer.current = window.setTimeout(() => {
      setIsInteracting(false);
    }, 150) as any;
  };

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.no-canvas-interaction')) return;

      e.preventDefault();
      startInteraction();

      if (e.ctrlKey || e.metaKey) {
        // 缩放逻辑
        const delta = -e.deltaY;
        const zoomFactor = Math.pow(1.25, (delta * 0.005));
        const newZoom = Math.max(0.05, Math.min(viewport.zoom * zoomFactor, 5));

        const rect = el.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const worldX = (mouseX - viewport.x) / viewport.zoom;
        const worldY = (mouseY - viewport.y) / viewport.zoom;

        const nextX = mouseX - worldX * newZoom;
        const nextY = mouseY - worldY * newZoom;

        presenter.assetManager.setViewport({ zoom: newZoom, x: nextX, y: nextY });
      } else {
        // 拖拽逻辑：触控板 1:1 响应，不加倍率以保证精确度
        presenter.assetManager.setViewport({ 
          x: viewport.x - e.deltaX, 
          y: viewport.y - e.deltaY 
        });
      }

      endInteraction();
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [viewport, presenter]);

  const startPanning = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.no-canvas-interaction') || target.closest('button')) return;

    const isBackground = target === canvasRef.current || target.classList.contains('canvas-viewport-layer');
    
    if (e.button === 0 && (isBackground || e.altKey)) {
      setIsPanning(true);
      startInteraction();
      
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
        endInteraction();
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
  };

  return { startPanning, isPanning };
};
