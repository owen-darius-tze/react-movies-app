---
name: omniroute-config
description: OmniRoute proxy configuration for AI chat streaming
metadata:
  type: reference
---

# OmniRoute Configuration

## Overview
OmniRoute runs as a local proxy (`http://localhost:20128/v1`) that provides a unified OpenAI-compatible API for multiple LLM providers.

## Setup
```bash
# Install
npm i -g omniroute

# Start proxy (run in separate terminal)
omniroute start
```

## Integration Points

### AI Config (`lib/ai-config.ts`)
- Creates OpenAI-compatible client pointing to local OmniRoute
- Uses `omniRoute('auto')` for automatic model selection
- System prompt defines MicroFilm persona

### Chat API Route (`app/api/chat/route.ts`)
- POST endpoint at `/api/chat`
- Uses Vercel AI SDK `streamText` for streaming responses
- Converts UI messages to model messages via `convertToModelMessages`
- Returns `toUIMessageStreamResponse()` for frontend consumption
- Error handling for:
  - `ECONNREFUSED` → 503 (OmniRoute not running)
  - `timeout`/`ETIMEDOUT` → 504 (Proxy unresponsive)

### Frontend Chat (`app/chat/page.tsx` → `components/chat/ChatInterface.tsx`)
- Uses `@ai-sdk/react` `useChat` hook
- Connects to `/api/chat` endpoint
- Persists history in localStorage (`microfilm-chat-history`)
- Streaming status handling: `submitted` → `streaming` → `ready`
- Thinking indicator during initial streaming

## Model Selection
OmniRoute supports multiple models via unified endpoint:
- `auto` - Let OmniRoute pick best available
- `gpt-4`, `gpt-3.5-turbo` - OpenAI
- `claude-3-sonnet`, `claude-3-haiku` - Anthropic
- `mistral` - Mistral
- And others configured in OmniRoute

## Troubleshooting
1. **Connection refused**: Run `omniroute start` in separate terminal
2. **Timeout**: Check OmniRoute logs, verify provider API keys in OmniRoute config
3. **Streaming issues**: Ensure `ai` and `@ai-sdk/react` versions are compatible (currently v4.x / v7.x)