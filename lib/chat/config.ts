/**
 * Model configuration for the streaming chat feature.
 * The model config includes the system prompt and model name.
 * For this demo we use a mock model — the actual streaming happens
 * in the route handler's provider override.
 */

export const config = {
  systemPrompt: 'You are a movie advisor with knowledge of Scorsese, Pacino, and De Niro films.',
  model: {
    name: 'mock',
    // temperature and other params are handled in the route handler
  },
};