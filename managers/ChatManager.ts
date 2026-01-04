
import { useChatStore } from '../stores/useChatStore';
import { useAssetStore } from '../stores/useAssetStore';
import { GeminiService } from '../services/geminiService';
import { globalPresenter } from '../Presenter';

export class ChatManager {
  private currentAbortController: AbortController | null = null;

  setInput = (val: string) => {
    useChatStore.getState().setInput(val);
  };

  newChat = () => {
    this.stopResponse();
    const { setMessages, setIsTyping, setInput } = useChatStore.getState();
    setMessages([]);
    setIsTyping(false);
    setInput('');
  };

  stopResponse = () => {
    if (this.currentAbortController) {
      this.currentAbortController.abort();
      this.currentAbortController = null;
    }
    useChatStore.getState().setIsTyping(false);
    useChatStore.getState().setMessages(prev => {
      if (prev.length === 0) return prev;
      const next = [...prev];
      const last = next[next.length - 1];
      if (last.role === 'assistant') {
        next[next.length - 1] = { ...last, isStreaming: false, isExecuting: false };
      }
      return next;
    });
  };

  sendMessage = async () => {
    const { input, isTyping, messages, setMessages, setInput, setIsTyping } = useChatStore.getState();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    const { assets, selectedIds } = useAssetStore.getState();
    const contextAssets = assets.filter(a => selectedIds.has(a.id));

    // 保存当前历史记录副本，用于传递给 AI
    const historySnapshot = [...messages];

    setInput('');
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: userMsg },
      { role: 'assistant', content: '', isStreaming: true, step: 'thinking' }
    ]);
    setIsTyping(true);

    // 初始化新的中止控制器
    this.currentAbortController = new AbortController();
    const signal = this.currentAbortController.signal;

    try {
      // 关键改进：传入 historySnapshot，让 AI 拥有“记忆”
      const stream = await GeminiService.chatWithAgentStream(userMsg, contextAssets, historySnapshot);
      let accumulatedText = "";

      for await (const chunk of stream) {
        if (signal.aborted) break;

        if (chunk.text) {
          accumulatedText += chunk.text;
          setMessages(prev => {
            if (signal.aborted) return prev;
            const next = [...prev];
            next[next.length - 1] = { ...next[next.length - 1], content: accumulatedText, step: 'writing', isStreaming: true };
            return next;
          });
        }

        const parts = chunk.candidates?.[0]?.content?.parts || [];
        const calls = parts.filter(p => p.functionCall).map(p => p.functionCall!);

        if (calls.length > 0 && !signal.aborted) {
          for (const call of calls) {
            if (signal.aborted) break;
            await globalPresenter.actionManager.executeFunctionCall(call.name, call.args, contextAssets);
          }
        }
      }

      if (!signal.aborted) {
        setMessages(prev => {
          const next = [...prev];
          next[next.length - 1] = { ...next[next.length - 1], isStreaming: false };
          return next;
        });
      }

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ 通信异常: ${err.message}` }]);
      }
    } finally {
      if (this.currentAbortController?.signal === signal) {
        this.currentAbortController = null;
      }
      setIsTyping(false);
    }
  };
}
