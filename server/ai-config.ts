// Server-side AI config for the MicroFilm chat endpoint.
// Holds the system prompt, model settings and model constructor.
// Reads AI_BASE_URL, AI_API_KEY and AI_MODEL from process.env (server only).

import { createOpenAI } from '@ai-sdk/openai';

export const SYSTEM_PROMPT = `You are MicroFilm's friendly movie and TV assistant. You answer questions about movies, TV shows, people and entertainment in general. Keep answers short and friendly. If you are not sure about a fact, say you are not sure instead of guessing. Never invent details.`;

export const AI_CONFIG = {
  temperature: 0.7,
  maxOutputTokens: 800,
};

export function getModel() {
  const apiKey = process.env.AI_API_KEY;
  const baseURL = process.env.AI_BASE_URL;
  const modelId = process.env.AI_MODEL || 'gpt-4o-mini';

  const provider = createOpenAI({ apiKey, baseURL });
  const model = provider.chat(modelId);

  return model;
}
