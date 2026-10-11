'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import MessageInput from './MessageInput';
import MessageList from './MessageList';

function ThinkingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-300">
        <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-400" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-400 [animation-delay:120ms]" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-400 [animation-delay:240ms]" />
      </div>
    </div>
  );
}

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  parts: [
    {
      type: 'text',
      text: "Hi! I'm MicroFilm's movie guide. Ask for a recommendation, a quick watchlist pick, or a deep dive into a director, actor, or franchise.",
    },
  ],
} as const;

const STORAGE_KEY = 'microfilm-chat-history';

function loadChatHistory() {
  if (typeof window === 'undefined') return undefined;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const messages = JSON.parse(stored);
      return Array.isArray(messages) ? messages : undefined;
    }
  } catch {}
  return undefined;
}

function saveChatHistory(messages: any[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {}
}

export default function ChatInterface() {
  const [initialMessages, setInitialMessages] = useState<typeof WELCOME_MESSAGE[]>([WELCOME_MESSAGE]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = loadChatHistory();
    if (stored && stored.length > 0) {
      setInitialMessages(stored);
    }
    setMounted(true);
  }, []);

  const { messages, input, handleInputChange, handleSubmit, status, stop, error } = useChat({
    api: '/api/chat',
    initialMessages,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [isPinned, setIsPinned] = useState(true);
  const [showThinking, setShowThinking] = useState(false);

  const latestAssistantText = useMemo(() => {
    const assistantMessage = [...messages].reverse().find((message) => message.role === 'assistant');
    if (!assistantMessage) {
      return '';
    }

    return assistantMessage.parts
      .filter((part) => part.type === 'text' && typeof part.text === 'string')
      .map((part) => part.text)
      .join('');
  }, [messages]);

  // Persist chat history to localStorage whenever messages change
  useEffect(() => {
    if (mounted) {
      saveChatHistory(messages);
    }
  }, [messages, mounted]);

  useEffect(() => {
    const isThinking = status === 'submitted' || (status === 'streaming' && !latestAssistantText.trim());
    setShowThinking(isThinking);
  }, [latestAssistantText, status]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const updatePinState = () => {
      const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight <= 120;
      setIsPinned(nearBottom);
    };

    updatePinState();
    container.addEventListener('scroll', updatePinState, { passive: true });

    return () => container.removeEventListener('scroll', updatePinState);
  }, []);

  useEffect(() => {
    if (isPinned || status === 'submitted' || status === 'streaming') {
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [isPinned, messages, status]);

  const jumpToLatest = () => {
    setIsPinned(true);
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  const submitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) {
      return;
    }

    void handleSubmit(event);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-slate-50 shadow-2xl shadow-slate-950/30">
      <header className="flex items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/90 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-red-600 via-orange-500 to-amber-400 text-sm font-bold text-white">
            M
          </div>
          <div>
            <h1 className="text-base font-semibold text-white sm:text-lg">MicroFilm Chat</h1>
            <p className="text-[11px] text-slate-400">Streaming movie advisor</p>
          </div>
        </div>

        {!isPinned && (
          <button
            type="button"
            onClick={jumpToLatest}
            className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition hover:border-indigo-500 hover:text-white"
          >
            Jump to Latest
          </button>
        )}
      </header>

      <div ref={containerRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5">
        <MessageList messages={messages} />
        {showThinking && <ThinkingIndicator />}

        {error && (
          <div className="rounded-xl border border-red-700 bg-red-950/40 px-3 py-2 text-sm text-red-200">
            Something went wrong. Please try again.
          </div>
        )}

        <div ref={endRef} className="h-px" />
      </div>

      <div className="border-t border-slate-800 bg-slate-950/95 px-4 py-3 sm:px-5">
        <MessageInput
          input={input}
          setInput={(value) => {
            handleInputChange({
              target: { value },
            } as React.ChangeEvent<HTMLTextAreaElement>);
          }}
          handleSubmit={submitForm}
          handleKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              const syntheticEvent = event as unknown as React.FormEvent<HTMLFormElement>;
              void handleSubmit(syntheticEvent);
            }
          }}
          stop={stop}
          status={status}
        />
      </div>
    </div>
  );
}
