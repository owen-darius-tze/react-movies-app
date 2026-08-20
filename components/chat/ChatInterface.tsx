'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ThinkingIndicator from './ThinkingIndicator';

export default function ChatInterface() {
  const {
    messages,
    input,
    setInput,
    append,
    handleInput,
    handleSubmit,
    status,
    stop,
    error,
  } = useChat({
    api: '/api/chat',
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        parts: [
          {
            type: 'text',
            text: 'Hi! I\'m your movie advisor. Ask me anything about Scorsese, Pacino, and De Niro films — I\'ll stream my recommendations in real time.',
          },
        ],
      },
    ],
  });

  const [showThinking, setShowThinking] = useState(false);
  const [showError, setShowError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasReceivedTokenRef = useRef(false);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track whether the assistant has produced its first token so the
  // thinking indicator can hand off to the streamed text without flicker.
  useEffect(() => {
    if (status === 'streaming') {
      const last = messages[messages.length - 1];
      if (last && last.role === 'assistant') {
        const hasText = last.parts.some(
          (p) => p.type === 'text' && p.text && p.text.length > 0,
        );
        if (hasText) {
          hasReceivedTokenRef.current = true;
        }
      }
    } else if (status === 'ready') {
      hasReceivedTokenRef.current = false;
    }
  }, [messages, status]);

  // Show thinking indicator during 'submitted' and the quiet start of
  // 'streaming' before the first token lands.
  useEffect(() => {
    if (status === 'submitted') {
      setShowThinking(true);
    } else if (status === 'streaming') {
      setShowThinking(!hasReceivedTokenRef.current);
    } else {
      setShowThinking(false);
    }
  }, [status]);

  // Show error banner when the stream fails.
  useEffect(() => {
    if (error) {
      setShowError(true);
    } else {
      setShowError(false);
    }
  }, [error]);

  // Auto-scroll that respects user scroll: only pin to bottom when the
  // user is already near the bottom or when we're actively streaming.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 120;

    if (isNearBottom || status === 'streaming' || status === 'submitted') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, status]);

  // Detect user-initiated scrolling so we can pause auto-scroll.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onScroll = () => {
      isUserScrollingRef.current = true;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isUserScrollingRef.current = false;
      }, 800);
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', onScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center text-sm font-bold">
          M
        </div>
        <div>
          <h1 className="font-semibold leading-tight">MicroFilm Chat</h1>
          <p className="text-xs text-gray-400">Movie advisor · streaming live</p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth"
      >
        <MessageList messages={messages} />
        {showThinking && <ThinkingIndicator />}
        {showError && (
          <div className="rounded-md bg-red-900/40 border border-red-700 text-red-200 px-3 py-2 text-sm">
            ⚠️ Something went wrong. Try sending again.
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 px-4 py-3 bg-gray-950">
        <MessageInput
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          handleKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
            }
          }}
          stop={stop}
          status={status}
        />
      </div>
    </div>
  );
}