
import { useState, RefObject } from 'react';
import { usePresenter } from '../PresenterContext';
import { useAssetStore } from '../stores/useAssetStore';

export const useCanvasInteraction = (canvasRef: RefObject<HTMLDivElement>) => {
  const presenter = usePresenter();
  const { viewport } = useAssetStore();
  const [isPanning, setIsPanning] = useState(false);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      // 提高缩放敏感度：从 0.001 提升到 0.0025
      const zoomSpeed = 0.0025; 
      const delta = -e.deltaY;
      
      // 使用平滑的缩放增量
      const zoomFactor = Math.pow(1.1, (delta * zoomSpeed));
      const newZoom = viewport.zoom * zoomFactor;
      
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      // 以鼠标所在位置为中心缩放
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const worldX = (mouseX - viewport.x) / viewport.zoom;
      const worldY = (mouseY - viewport.y) / viewport.zoom;
      
      const nextZoom = Math.max(0.05, Math.min(newZoom, 5));
      const newX = mouseX - worldX * nextZoom;
      const newY = mouseY - worldY * nextZoom;
      
      presenter.assetManager.setViewport({ zoom: nextZoom, x: newX, y: newY });
    } else {
      // 普通滚动平移也增加一点点感度
      presenter.assetManager.setViewport({ 
        x: viewport.x - e.deltaX * 1.2, 
        y: viewport.y - e.deltaY * 1.2 
      });
    }
  };

  const startPanning = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
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

  return { handleWheel, startPanning, isPanning };
};
