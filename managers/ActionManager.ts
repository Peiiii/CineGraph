
import { GeminiService } from '../services/geminiService';
import { useAssetStore } from '../stores/useAssetStore';
import { useChatStore } from '../stores/useChatStore';
import { Asset, AssetType } from '../types';

export class ActionManager {
  async executeFunctionCall(name: string, args: any, contextAssets: Asset[]) {
    const { viewport, setAssets } = useAssetStore.getState();
    const { setMessages } = useChatStore.getState();

    // 更新 UI 状态
    setMessages(prev => {
      const next = [...prev];
      next[next.length - 1] = { 
        ...next[next.length - 1],
        content: `🎬 **导演指令下达:** \`${name}\`...`, 
        isExecuting: true, 
        step: 'generating' 
      };
      return next;
    });

    try {
      const defaultPosition = {
        x: -viewport.x / viewport.zoom + (window.innerWidth / 2) / viewport.zoom - 200,
        y: -viewport.y / viewport.zoom + (window.innerHeight / 2) / viewport.zoom - 150,
      };

      let newAsset: Asset | null = null;
      const assetId = Math.random().toString(36).substr(2, 9);

      if (name === 'create_visual_shot') {
        const dataUrl = await GeminiService.generateImage(args.prompt as string);
        newAsset = { id: assetId, type: 'image', content: dataUrl, title: args.title || 'AI 视觉分镜', createdAt: Date.now(), position: defaultPosition };
      } else if (name === 'animate_scene') {
        const ref = contextAssets.find(a => a.id === args.reference_asset_id) || contextAssets.find(a => a.type === 'image');
        const videoUrl = await GeminiService.generateVideo(args.prompt as string, ref?.content);
        newAsset = { id: assetId, type: 'video', content: videoUrl, title: 'AI 动态片段', createdAt: Date.now(), position: defaultPosition };
      } else if (name === 'write_creative_asset') {
        newAsset = { id: assetId, type: (args.type as AssetType) || 'text', content: args.content as string, title: args.title as string, createdAt: Date.now(), position: defaultPosition };
      }

      if (newAsset) {
        setAssets(prev => [newAsset!, ...prev]);
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { 
            role: 'assistant', 
            content: `✨ **制作完成:** [${newAsset?.title}] 已添加到工作区。`, 
            isExecuting: false,
            step: 'done' 
          };
          return updated;
        });
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ 创意执行失败 [${name}]: ${err.message}` }]);
    }
  }
}
