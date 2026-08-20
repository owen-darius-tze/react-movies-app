import { streamText, convertToModelMessages, createUIMessageStreamResponse } from 'ai';
import { NextRequest } from 'next/server';
import { config } from '@/lib/chat/config';
import { mockResponse } from '@/lib/chat/mock-responses';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const messages = body.messages ?? [];
  const modelMessages = convertToModelMessages(messages);
  const userMessage = body.input ?? '';
  const responseText = mockResponse(userMessage);

  const stream = streamText({
    model: config.model,
    system: config.systemPrompt,
    messages: modelMessages,
    provider: {
      async *invoke({ messages }) {
        const tokens = responseText.split(/\s+/);
        for (const token of tokens) {
          await new Promise(r => setTimeout(r, 200));
          yield { content: token + ' ' };
        }
      },
    },
  });

  return createUIMessageStreamResponse(stream);
}
