
import { useEffect } from 'react';
import { usePresenter } from '../PresenterContext';

export const useCanvasHotkeys = () => {
  const presenter = usePresenter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      // F: 自适应屏幕
      if (e.key.toLowerCase() === 'f') {
        presenter.assetManager.fitToScreen();
      }
      // Ctrl/Meta + 0: 恢复 100%
      if (e.key === '0' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        presenter.assetManager.setViewport({ zoom: 1 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [presenter]);
};
