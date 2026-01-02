
import { useState, RefObject } from 'react';
import { usePresenter } from '../PresenterContext';
import { useAssetStore } from '../stores/useAssetStore';

export const useCanvasInteraction = (canvasRef: RefObject<HTMLDivElement>) => {
  const presenter = usePresenter();
  const { viewport } = useAssetStore();
  const [isPanning, setIsPanning] = useState(false);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      const zoomSpeed = 0.001;
      const delta = -e.deltaY;
      const newZoom = viewport.zoom + delta * zoomSpeed;
      
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const worldX = (mouseX - viewport.x) / viewport.zoom;
      const worldY = (mouseY - viewport.y) / viewport.zoom;
      
      const nextZoom = Math.max(0.1, Math.min(newZoom, 5));
      const newX = mouseX - worldX * nextZoom;
      const newY = mouseY - worldY * nextZoom;
      
      presenter.assetManager.setViewport({ zoom: nextZoom, x: newX, y: newY });
    } else {
      presenter.assetManager.setViewport({ 
        x: viewport.x - e.deltaX, 
        y: viewport.y - e.deltaY 
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
