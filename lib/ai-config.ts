import { createOpenAI } from '@ai-sdk/openai';

/**
 * OmniRoute Configuration
 * Uses local OmniRoute proxy as primary gateway
 * Supports multiple model providers via single unified endpoint
 * Make sure to run: omniroute start (in another terminal)
 */

// Create OpenAI-compatible client pointing to local OmniRoute proxy
const omniRoute = createOpenAI({
  apiKey: 'placeholder', // OmniRoute proxy doesn't require actual API key
  baseURL: 'http://localhost:20128/v1', // Local OmniRoute proxy server
});

export const aiConfig = {
  name: 'microfilm-chat',
  // Use omniRoute('auto') to let OmniRoute select the best available model
  // or specify: 'gpt-4', 'gpt-3.5-turbo', 'claude-3-sonnet', 'mistral', etc.
  model: omniRoute('auto'),
  systemPrompt:
    'You are MicroFilm, a warm and knowledgeable movie and TV assistant. Help users discover films, series, talent, and trends, give concise but useful recommendations, and keep answers grounded in entertainment context. If a user asks for a recommendation, tailor it to their taste, mention a few titles, and explain briefly why they fit. Do not pretend to have real-time data beyond your model knowledge; if unsure, say so clearly and offer a best-effort recommendation.',
};
