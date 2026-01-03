
import { useChatStore } from '../stores/useChatStore';
import { useAssetStore } from '../stores/useAssetStore';
import { GeminiService } from '../services/geminiService';
import { globalPresenter } from '../Presenter';

export class ChatManager {
  setInput = (val: string) => {
    useChatStore.getState().setInput(val);
  };

  newChat = () => {
    const { setMessages, setIsTyping, setInput } = useChatStore.getState();
    setMessages([]);
    setIsTyping(false);
    setInput('');
  };

  sendMessage = async () => {
    const { input, isTyping, setMessages, setInput, setIsTyping } = useChatStore.getState();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
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
        if (chunk.text) {
          accumulatedText += chunk.text;
          setMessages(prev => {
            const next = [...prev];
            next[next.length - 1] = { ...next[next.length - 1], content: accumulatedText, step: 'writing', isStreaming: true };
            return next;
          });
        }

        const parts = chunk.candidates?.[0]?.content?.parts || [];
        const calls = parts.filter(p => p.functionCall).map(p => p.functionCall!);

        // 委托给 ActionManager 执行具体资产创建逻辑
        if (calls.length > 0) {
          for (const call of calls) {
            await globalPresenter.actionManager.executeFunctionCall(call.name, call.args, contextAssets);
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
