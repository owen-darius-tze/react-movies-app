import { convertToModelMessages, streamText, type UIMessage } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { aiConfig } from '../../../lib/ai-config';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { messages?: UIMessage[] };
    const messages = body.messages ?? [];

    const result = streamText({
      model: aiConfig.model,
      system: aiConfig.systemPrompt,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    // Handle OmniRoute connection errors
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        return NextResponse.json(
          {
            error: 'OmniRoute proxy is not running. Please start it with: omniroute start',
            details: 'Make sure OmniRoute is installed and running on http://localhost:20128',
          },
          { status: 503 },
        );
      }
      if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
        return NextResponse.json(
          {
            error: 'OmniRoute request timed out. Check proxy status or try again.',
            details: 'Ensure OmniRoute is running and responsive.',
          },
          { status: 504 },
        );
      }
    }
    throw error;
  }
}

