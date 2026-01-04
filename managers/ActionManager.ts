
import { GeminiService } from '../services/geminiService';
import { useAssetStore } from '../stores/useAssetStore';
import { useChatStore } from '../stores/useChatStore';
import { Asset, AssetType } from '../types';

export class ActionManager {
  async executeFunctionCall(name: string, args: any, contextAssets: Asset[]) {
    const { viewport, setAssets } = useAssetStore.getState();
    const { setMessages } = useChatStore.getState();

    const isUpdate = name === 'update_creative_asset';

    // 更新 UI 状态
    setMessages(prev => {
      const next = [...prev];
      next[next.length - 1] = { 
        ...next[next.length - 1],
        content: isUpdate ? `✍️ **导演正在润色内容...**` : `🎬 **导演指令下达:** \`${name}\`...`, 
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

      if (name === 'update_creative_asset') {
        const targetId = args.asset_id;
        const targetAsset = useAssetStore.getState().assets.find(a => a.id === targetId);
        
        if (!targetAsset) throw new Error(`找不到 ID 为 ${targetId} 的资产`);

        setAssets(prev => prev.map(a => 
          a.id === targetId 
            ? { ...a, content: args.content, title: args.title || a.title } 
            : a
        ));

        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { 
            role: 'assistant', 
            content: `✅ **资产已更新:** [${args.title || targetAsset.title}] 已根据您的指令完成润色。`, 
            isExecuting: false,
            step: 'done' 
          };
          return updated;
        });
        return;
      }

      // 处理新建资产
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
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { 
          role: 'assistant', 
          content: `❌ 执行失败: ${err.message}`, 
          isExecuting: false,
          step: 'done' 
        };
        return updated;
      });
    }
  }
}
