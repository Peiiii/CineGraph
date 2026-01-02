
import { useChatStore } from '../stores/useChatStore';
import { useAssetStore } from '../stores/useAssetStore';
import { GeminiService } from '../services/geminiService';
import { Asset, AssetType } from '../types';

export class ChatManager {
  setInput = (val: string) => {
    useChatStore.getState().setInput(val);
  };

  sendMessage = async () => {
    const { input, isTyping, setMessages, setInput, setIsTyping } = useChatStore.getState();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    // 动态获取当前选中的资产作为 AI 上下文
    const { assets, selectedIds } = useAssetStore.getState();
    const contextAssets = assets.filter(a => selectedIds.has(a.id));

    setInput('');
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: userMsg },
      { role: 'assistant', content: '', isStreaming: true, step: 'thinking' }
    ]);
    setIsTyping(true);

    try {
      const stream = await GeminiService.chatWithAgentStream(userMsg, contextAssets);
      let accumulatedText = "";

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        if (chunkText) {
          accumulatedText += chunkText;
          setMessages(prev => {
            const next = [...prev];
            const last = next[next.length - 1];
            next[next.length - 1] = { 
              ...last, 
              content: accumulatedText, 
              step: 'writing',
              isStreaming: true 
            };
            return next;
          });
        }

        const parts = chunk.candidates?.[0]?.content?.parts || [];
        const functionCalls = parts.filter(p => p.functionCall).map(p => p.functionCall!);

        if (functionCalls.length > 0) {
          for (const call of functionCalls) {
            const { name, args } = call;
            
            setMessages(prev => {
              const next = [...prev];
              next[next.length - 1] = { 
                role: 'assistant', 
                content: `🎬 **导演指令下达:** \`${name}\`...`, 
                isExecuting: true, 
                step: 'generating' 
              };
              return next;
            });

            try {
              let newAsset: Asset | null = null;
              if (name === 'create_visual_shot') {
                const dataUrl = await GeminiService.generateImage(args.prompt as string);
                newAsset = { id: Math.random().toString(36).substr(2, 9), type: 'image', content: dataUrl, title: args.title as string || 'AI 视觉分镜', createdAt: Date.now() };
              } else if (name === 'animate_scene') {
                const ref = contextAssets.find(a => a.id === args.reference_asset_id) || contextAssets.find(a => a.type === 'image');
                const videoUrl = await GeminiService.generateVideo(args.prompt as string, ref?.content);
                newAsset = { id: Math.random().toString(36).substr(2, 9), type: 'video', content: videoUrl, title: 'AI 动态片段', createdAt: Date.now() };
              } else if (name === 'write_creative_asset') {
                newAsset = { id: Math.random().toString(36).substr(2, 9), type: (args.type as AssetType) || 'text', content: args.content as string, title: args.title as string, createdAt: Date.now() };
              }

              if (newAsset) {
                // 直接通过 Store 更新
                useAssetStore.getState().setAssets(prev => [newAsset!, ...prev]);
                
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
            } catch (err) {
              setMessages(prev => [...prev, { role: 'assistant', content: `❌ 创意执行失败: ${name}` }]);
            }
          }
        }
      }

      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = { ...next[next.length - 1], isStreaming: false };
        return next;
      });

    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ 通信异常: ${err.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };
}
