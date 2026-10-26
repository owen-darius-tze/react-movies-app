import { streamText } from 'ai';
import { SYSTEM_PROMPT, AI_CONFIG, getModel } from './ai-config';

export async function handleChat(req: Request, signal?: AbortSignal): Promise<Response> {
  const abortSignal = signal || req.signal;

  if (req.method === 'GET') {
    const configured = !!(process.env.AI_BASE_URL && process.env.AI_API_KEY && process.env.AI_MODEL);
    return new Response(JSON.stringify({ ok: true, configured }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const missing = [];
  if (!process.env.AI_BASE_URL) missing.push('AI_BASE_URL');
  if (!process.env.AI_API_KEY) missing.push('AI_API_KEY');
  if (!process.env.AI_MODEL) missing.push('AI_MODEL');

  if (missing.length > 0) {
    return new Response(JSON.stringify({ error: `Missing configuration: ${missing.join(', ')}` }), { status: 500 });
  }

  try {
    const body = await req.json();
    const { messages } = body;

    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 30) {
      return new Response(JSON.stringify({ error: 'Invalid messages: must be a non-empty array of at most 30 items' }), { status: 400 });
    }

    for (const msg of messages) {
      if (!msg.role || !['user', 'assistant'].includes(msg.role) || typeof msg.content !== 'string' || msg.content.length > 4000) {
        return new Response(JSON.stringify({ error: 'Invalid message format or content too long' }), { status: 400 });
      }
    }

    const result = streamText({
      model: getModel(),
      system: SYSTEM_PROMPT,
      messages: messages,
      ...AI_CONFIG,
      abortSignal,
    });

    return result.toTextStreamResponse();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: `Provider error: ${message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
