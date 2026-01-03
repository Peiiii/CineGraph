
import { useEffect } from 'react';
import { usePresenter } from '../PresenterContext';
import { useAssetStore } from '../stores/useAssetStore';

export const useAutoFit = () => {
  const presenter = usePresenter();
  const assets = useAssetStore(state => state.assets);

  useEffect(() => {
    // 只有当有资产时才进行自适应，避免初始化瞬间的空计算
    if (assets.length > 0) {
      const timer = setTimeout(() => {
        presenter.assetManager.fitToScreen();
      }, 300); // 稍微增加延迟以确保 DOM 尺寸稳定
      return () => clearTimeout(timer);
    }
  }, [presenter, assets.length === 0]); // 仅在资产从无到有时或 presenter 变化时触发
};
