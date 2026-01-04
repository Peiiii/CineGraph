
import React, { useState, RefObject, useEffect } from 'react';
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
      const target = e.target as HTMLElement;
      
      // CRITICAL: If the event target is inside a UI component, don't move the canvas.
      if (target.closest('.no-canvas-interaction')) {
        return;
      }

      // Check if it's a zoom operation (Pinch on trackpad or Ctrl+Wheel)
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();

        const delta = -e.deltaY;
        const zoomSpeed = 0.005; 
        const zoomFactor = Math.pow(1.25, (delta * zoomSpeed));
        const newZoom = viewport.zoom * zoomFactor;

        const rect = el.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const worldX = (mouseX - viewport.x) / viewport.zoom;
        const worldY = (mouseY - viewport.y) / viewport.zoom;

        const nextZoom = Math.max(0.05, Math.min(newZoom, 5));
        const newX = mouseX - worldX * nextZoom;
        const newY = mouseY - worldY * nextZoom;

        presenter.assetManager.setViewport({ zoom: nextZoom, x: newX, y: newY });
      } else {
        // Normal Panning (Wheel scroll)
        // We only pan if we are not on a UI element (already checked above)
        presenter.assetManager.setViewport({ 
          x: viewport.x - e.deltaX * 1.5, 
          y: viewport.y - e.deltaY * 1.5 
        });
      }
    };

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

  // Added React.MouseEvent type which requires React namespace
  const startPanning = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    // Don't start panning if we click a UI element or an asset card button
    if (target.closest('.no-canvas-interaction') || target.closest('button')) {
      return;
    }

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
