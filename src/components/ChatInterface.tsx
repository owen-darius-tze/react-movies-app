/**
 * Chat Interface Component
 * AI-powered chat for personalized entertainment recommendations
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, X, Sparkles, Loader2, MessageSquare, Trash2, Copy } from 'lucide-react';
import { useChatStore, type ChatMessage } from '../lib/chat/store';
import { buildChatContext, streamChatResponse } from '../lib/chat/api';
import { getFeed } from '../lib/data';

export function ChatInterface({ minimized = false, onToggleMinimize }: { minimized?: boolean; onToggleMinimize?: () => void }) {
  const { messages, profile, isLoading, error, addUserMessage, addAssistantMessage, clearChat, setError } = useChatStore();
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showMinimized, setShowMinimized] = useState(minimized);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming, scrollToBottom]);

  // Build context and stream response when user sends message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userContent = input.trim();
    setInput('');
    addUserMessage(userContent);

    // Build context with current feed data
    try {
      const context = await buildChatContext(profile);
      context.recentMessages = messages.slice(-6); // Last 6 messages for context

      setIsStreaming(true);
      let assistantContent = '';

      for await (const chunk of streamChatResponse([...messages, { id: '', role: 'user', content: userContent, timestamp: new Date().toISOString() }], context)) {
        assistantContent += chunk;
        // We'll update the message via addAssistantMessage after streaming completes
      }

      addAssistantMessage(assistantContent);
    } catch (err) {
      console.error('Chat error:', err);
      setError('Failed to get response. Please try again.');
      addAssistantMessage('Sorry, I encountered an error. Please try again.');
    } finally {
      setIsStreaming(false);
    }
  };

  const handleClear = () => {
    if (window.confirm('Clear chat history and reset preferences?')) {
      clearChat();
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  if (showMinimized) {
    return (
      <button
        className="chat-minimized"
        onClick={() => { setShowMinimized(false); onToggleMinimize?.(); }}
        aria-label="Open chat"
      >
        <MessageSquare size={24} />
        <span className="chat-badge">{messages.filter(m => m.role === 'user').length}</span>
      </button>
    );
  }

  return (
    <div className="chat-interface" ref={chatContainerRef}>
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-title">
          <Sparkles size={18} className="chat-sparkle" />
          <span>MicroFilm AI</span>
        </div>
        <div className="chat-header-actions">
          <button
            className="icon-btn"
            onClick={handleClear}
            aria-label="Clear chat"
            disabled={messages.length === 0}
          >
            <Trash2 size={16} />
          </button>
          <button
            className="icon-btn"
            onClick={() => { setShowMinimized(true); onToggleMinimize?.(); }}
            aria-label="Minimize chat"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages" role="log" aria-live="polite">
        {messages.length === 0 ? (
          <div className="chat-welcome">
            <Sparkles size={32} />
            <h3>Hi! I'm your entertainment assistant.</h3>
            <p>Ask me about movies, TV shows, Rotten Tomatoes scores, Insider TV articles, or get personalized recommendations.</p>
            <div className="chat-suggestions">
              <button className="suggestion-btn" onClick={() => setInput("Recommend me some sci-fi movies")}>
                Sci-fi recommendations
              </button>
              <button className="suggestion-btn" onClick={() => setInput("What's Certified Fresh on Rotten Tomatoes this week?")}>
                Certified Fresh this week
              </button>
              <button className="suggestion-btn" onClick={() => setInput("Show me Insider TV articles about crime dramas")}>
                Insider TV crime dramas
              </button>
              <button className="suggestion-btn" onClick={() => setInput("Add The Godfather to my watchlist")}>
                Add to watchlist
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={msg.id} className={`chat-message ${msg.role}`}>
              <div className="chat-message-bubble">
                <div className="chat-message-content">{msg.content}</div>
                <div className="chat-message-meta">
                  <time dateTime={msg.timestamp}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </time>
                  {msg.role === 'assistant' && (
                    <button
                      className="icon-btn sm"
                      onClick={() => handleCopyMessage(msg.content)}
                      aria-label="Copy message"
                    >
                      <Copy size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {isStreaming && (
          <div className="chat-message assistant streaming">
            <div className="chat-message-bubble">
              <div className="chat-typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="chat-error" role="alert">
          {error}
          <button onClick={() => setError(undefined)} aria-label="Dismiss">×</button>
        </div>
      )}

      {/* Input */}
      <form className="chat-input-form" onSubmit={handleSend}>
        <div className="chat-input-wrapper">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about movies, shows, ratings, articles..."
            rows={1}
            maxRows={4}
            disabled={isLoading}
            aria-label="Chat input"
            className="chat-input"
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
          >
            {isLoading ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
          </button>
        </div>
        <p className="chat-hint">Press Enter to send, Shift+Enter for new line</p>
      </form>
    </div>
  );
}

/** Floating chat button for minimized state */
export function ChatFloatButton({ onOpen }: { onOpen: () => void }) {
  const { messages } = useChatStore();
  const unreadCount = messages.filter(m => m.role === 'user').length;

  return (
    <button className="chat-float-btn" onClick={onOpen} aria-label="Open chat assistant">
      <MessageSquare size={28} />
      {unreadCount > 0 && <span className="chat-float-badge">{unreadCount}</span>}
      <span className="chat-float-label">Chat</span>
    </button>
  );
}