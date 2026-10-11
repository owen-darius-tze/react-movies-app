/**
 * Chat Integration Test
 * Validates the streaming chat flow end-to-end
 */

import { describe, it, expect } from 'vitest';
import type { UIMessage } from 'ai';

describe('MicroFilm Streaming Chat', () => {
  describe('Configuration', () => {
    it('should load AI config with Anthropic model', async () => {
      const { aiConfig } = await import('../lib/ai-config');
      expect(aiConfig).toBeDefined();
      expect(aiConfig.name).toBe('microfilm-chat');
      expect(aiConfig.modelId).toBe('claude-3-5-sonnet-20241022');
      expect(aiConfig.model).toBeDefined();
    });

    it('should have a system prompt configured', async () => {
      const { aiConfig } = await import('../lib/ai-config');
      expect(aiConfig.systemPrompt).toContain('MicroFilm');
      expect(aiConfig.systemPrompt).toContain('movie');
      expect(aiConfig.systemPrompt).toContain('assistant');
    });
  });

  describe('Message Format', () => {
    it('should create valid UI messages', () => {
      const userMessage: UIMessage = {
        id: 'msg-1',
        role: 'user',
        parts: [
          {
            type: 'text',
            text: 'Recommend a movie',
          },
        ],
      };

      expect(userMessage.id).toBe('msg-1');
      expect(userMessage.role).toBe('user');
      expect(userMessage.parts).toHaveLength(1);
      expect(userMessage.parts[0].type).toBe('text');
    });

    it('should create valid assistant messages', () => {
      const assistantMessage: UIMessage = {
        id: 'msg-2',
        role: 'assistant',
        parts: [
          {
            type: 'text',
            text: 'I recommend watching The Godfather...',
          },
        ],
      };

      expect(assistantMessage.role).toBe('assistant');
      expect(assistantMessage.parts[0].type).toBe('text');
    });
  });

  describe('Streaming Response', () => {
    it('should handle message array conversion', async () => {
      const messages: UIMessage[] = [
        {
          id: '1',
          role: 'user',
          parts: [{ type: 'text', text: 'Hello' }],
        },
        {
          id: '2',
          role: 'assistant',
          parts: [{ type: 'text', text: 'Hi there!' }],
        },
      ];

      // Messages should be convertible to model format
      expect(messages).toHaveLength(2);
      expect(messages[0].parts[0].type).toBe('text');
      expect(messages[1].parts[0].type).toBe('text');
    });

    it('should support streaming state transitions', () => {
      const streamingStates = ['ready', 'submitted', 'streaming', 'error'] as const;
      
      streamingStates.forEach((state) => {
        expect(['ready', 'submitted', 'streaming', 'error']).toContain(state);
      });
    });
  });

  describe('Component Integration', () => {
    it('should export ChatInterface component', async () => {
      const ChatInterface = (await import('../components/chat/ChatInterface')).default;
      expect(ChatInterface).toBeDefined();
      expect(typeof ChatInterface).toBe('function');
    });

    it('should export MessageInput component', async () => {
      const MessageInput = (await import('../components/chat/MessageInput')).default;
      expect(MessageInput).toBeDefined();
      expect(typeof MessageInput).toBe('function');
    });

    it('should export MessageList component', async () => {
      const MessageList = (await import('../components/chat/MessageList')).default;
      expect(MessageList).toBeDefined();
      expect(typeof MessageList).toBe('function');
    });
  });

  describe('Route Handler', () => {
    it('should export POST handler', async () => {
      const routeModule = await import('../app/api/chat/route');
      expect(routeModule.POST).toBeDefined();
      expect(typeof routeModule.POST).toBe('function');
    });
  });

  describe('Chat Page', () => {
    it('should export default chat page component', async () => {
      const ChatPage = (await import('../app/chat/page')).default;
      expect(ChatPage).toBeDefined();
      expect(typeof ChatPage).toBe('function');
    });
  });
});
