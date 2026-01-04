
import { create } from 'zustand';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  isExecuting?: boolean;
  isStreaming?: boolean;
  step?: 'thinking' | 'writing' | 'generating' | 'done';
}

interface ChatState {
  messages: Message[];
  isTyping: boolean;
  input: string;
  setMessages: (msgs: Message[] | ((prev: Message[]) => Message[])) => void;
  setInput: (input: string) => void;
  setIsTyping: (isTyping: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isTyping: false,
  input: '',
  setMessages: (msgs) => set((state) => ({ 
    messages: typeof msgs === 'function' ? msgs(state.messages) : msgs 
  })),
  setInput: (input) => set({ input }),
  setIsTyping: (isTyping) => set({ isTyping }),
}));
