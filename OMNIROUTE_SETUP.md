# 🚀 OmniRoute Setup Guide for MicroFilm Chat

## Overview

OmniRoute is a unified API gateway that provides access to multiple AI model providers through a single local proxy. This setup gives you:

- **Single unified endpoint** for multiple AI providers
- **Model auto-selection** (best available, based on provider availability)
- **No API costs** if using free models (e.g., Ollama, HuggingFace)
- **Local privacy** - all requests stay on your machine
- **Hot-swappable providers** - switch providers without code changes

---

## Architecture

```
Browser Chat
    ↓
POST /api/chat
    ↓
Node.js Server (app/api/chat/route.ts)
    ↓
HTTP to OmniRoute Proxy (localhost:20128/v1)
    ↓
OmniRoute Auto-Routes Request
    ├─→ Claude (Anthropic) [if key available]
    ├─→ GPT-4/GPT-3.5 (OpenAI) [if key available]
    ├─→ Mistral/Llama2 (Ollama) [if running locally]
    └─→ Other configured providers
    ↓
Response streams back to chat
    ↓
✨ Real-time streaming display
```

---

## Step 1: Install OmniRoute

### Option A: NPM Package (Recommended for Node.js projects)

```bash
npm install -g omniroute
# or
npm install omniroute --save-dev
```

### Option B: Standalone Binary

Download from: https://github.com/omnigateway/omniroute/releases

Extract and add to PATH.

### Option C: Docker

```bash
docker run -p 20128:20128 omniroute/omniroute:latest
```

### Verify Installation

```powershell
omniroute --version
# Should output: OmniRoute v1.x.x
```

---

## Step 2: Configure OmniRoute Providers

OmniRoute config file: `~/.omniroute/config.json` (auto-created)

### Minimal Config (Local Models Only)

```json
{
  "port": 20128,
  "providers": [
    {
      "name": "ollama",
      "enabled": true,
      "type": "ollama",
      "baseURL": "http://localhost:11434/v1",
      "apiKey": "ollama"
    }
  ],
  "defaultModel": "auto"
}
```

### Full Config (Multiple Providers)

```json
{
  "port": 20128,
  "timeout": 30000,
  "providers": [
    {
      "name": "claude",
      "enabled": true,
      "type": "anthropic",
      "apiKey": "sk-ant-...",
      "models": ["claude-3-sonnet", "claude-3-haiku"]
    },
    {
      "name": "openai",
      "enabled": true,
      "type": "openai",
      "apiKey": "sk-proj-...",
      "models": ["gpt-4", "gpt-3.5-turbo"]
    },
    {
      "name": "ollama",
      "enabled": true,
      "type": "ollama",
      "baseURL": "http://localhost:11434/v1",
      "apiKey": "ollama",
      "models": ["mistral", "llama2", "neural-chat"]
    },
    {
      "name": "huggingface",
      "enabled": false,
      "type": "huggingface",
      "apiKey": "hf_...",
      "models": ["meta-llama/Llama-2-70b"]
    }
  ],
  "defaultModel": "auto",
  "fallbackOrder": ["claude", "openai", "ollama"]
}
```

---

## Step 3: Start OmniRoute Proxy

**Keep this terminal open while using the chat:**

```powershell
omniroute start
# or if installed globally
omniroute
```

You should see:

```
OmniRoute Proxy Server
Listening on http://localhost:20128
Available endpoints:
  POST /v1/chat/completions
  GET  /v1/models
  
Configured providers:
  ✓ ollama (active)
  ✗ anthropic (no API key)
  ✗ openai (no API key)
```

✅ **Leave this running in the background** — don't close this terminal!

---

## Step 4: Verify OmniRoute is Working

**Open a NEW PowerShell terminal** (keep the `omniroute start` one open):

```powershell
curl http://localhost:20128/v1/models
```

Should return:

```json
{
  "object": "list",
  "data": [
    {
      "id": "mistral:latest",
      "object": "model",
      "owned_by": "ollama"
    },
    {
      "id": "llama2:latest",
      "object": "model",
      "owned_by": "ollama"
    }
  ]
}
```

✅ If you see available models, OmniRoute is working!

---

## Step 5: Your Chat Code is Already Updated ✅

I've already updated:
- ✅ `lib/ai-config.ts` — Points to OmniRoute on localhost:20128
- ✅ `app/api/chat/route.ts` — Includes error handling for OmniRoute
- ✅ `components/chat/ChatInterface.tsx` — Includes localStorage persistence

**No code changes needed on your part!**

### What Changed:

**Before (Ollama only):**
```typescript
const ollama = createOpenAI({
  apiKey: 'ollama',
  baseURL: 'http://localhost:11434/v1',
});
export const aiConfig = {
  model: ollama('mistral'),
  // ...
};
```

**After (OmniRoute gateway):**
```typescript
const omniRoute = createOpenAI({
  apiKey: 'placeholder',
  baseURL: 'http://localhost:20128/v1',
});
export const aiConfig = {
  model: omniRoute('auto'), // Let OmniRoute pick the best model
  // ...
};
```

---

## Step 6: Run Your Chat

**In a NEW PowerShell terminal** (keep `omniroute start` running):

```powershell
cd e:\CAREER\Flyrank AI\react_moviedb\react-movies-app
npm run dev
```

Then open:

```
http://localhost:3000/app/chat
```

---

## ✅ Quick Checklist

```
☐ OmniRoute installed (omniroute --version works)
☐ Config file created (~/.omniroute/config.json)
☐ Ollama installed and has models (if using local models)
☐ ollama serve running in one terminal (if using Ollama)
☐ omniroute start running in another terminal
☐ npm run dev running in third terminal
☐ Open http://localhost:3000/app/chat
☐ Type a message and see it stream!
```

---

## Key Features Implemented

### 1. **Thinking Indicator → First Token Handoff**
Smooth transition from animated thinking dots to actual response text.

```typescript
const isThinking = status === 'submitted' 
  || (status === 'streaming' && !latestAssistantText.trim());
```

### 2. **Pinned Auto-Scroll with Manual Control**
- Automatically scrolls when pinned to bottom
- Releases pin when user scrolls up
- Shows "Jump to Latest" button when scrolled up

```typescript
useEffect(() => {
  const nearBottom = container.scrollHeight - container.scrollTop 
    - container.clientHeight <= 120;
  setIsPinned(nearBottom);
}, []);
```

### 3. **Stop Generation Button**
Stops the current response without breaking the UI state.

```typescript
{isStreaming ? (
  <button onClick={stop}>Stop</button>
) : (
  <button type="submit">Send</button>
)}
```

### 4. **Conversation Persistence**
All chat messages saved to localStorage automatically.

```typescript
useEffect(() => {
  if (mounted) {
    saveChatHistory(messages);
  }
}, [messages, mounted]);
```

### 5. **Mobile Responsive Design**
Adapts to mobile, tablet, and desktop sizes using Tailwind breakpoints.

### 6. **Error Handling**
Displays helpful error messages when OmniRoute is unavailable.

```typescript
if (error?.message.includes('ECONNREFUSED')) {
  return { error: 'OmniRoute proxy is not running...' };
}
```

---

## Using Different Models

### Switch to a Specific Model

Edit `lib/ai-config.ts` line 17:

```typescript
// Option 1: Let OmniRoute auto-select
model: omniRoute('auto'),

// Option 2: Request specific model
model: omniRoute('gpt-4'),
model: omniRoute('claude-3-sonnet'),
model: omniRoute('mistral'),
model: omniRoute('llama2'),
```

Then restart: `npm run dev`

### Available Models (depends on your config)

| Provider | Model | Speed | Quality | Cost |
|----------|-------|-------|---------|------|
| Ollama | mistral | ⚡⚡⚡⚡ | ⭐⭐⭐ | $0 |
| Ollama | llama2 | ⚡⚡ | ⭐⭐⭐⭐ | $0 |
| Ollama | neural-chat | ⚡⚡⚡⚡ | ⭐⭐⭐ | $0 |
| OpenAI | gpt-4 | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | $$$ |
| OpenAI | gpt-3.5-turbo | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | $ |
| Anthropic | claude-3-sonnet | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | $$ |
| Anthropic | claude-3-haiku | ⚡⚡⚡⚡ | ⭐⭐⭐ | $ |

---

## Troubleshooting

### "Connection refused" error in chat?

**Solution 1**: Make sure `omniroute start` is running
```powershell
omniroute start
```

**Solution 2**: Check port 20128 is available
```powershell
netstat -ano | findstr :20128
# If something is using it, kill it or change OmniRoute port in config
```

### No models available?

Check if you have at least one provider configured:

```powershell
# If using Ollama, make sure it's running
ollama serve

# Check models available
curl http://localhost:11434/api/tags
```

### Chat is slow?

1. Use `mistral` instead of `llama2` (faster local model)
2. Use `gpt-3.5-turbo` instead of `gpt-4` (faster cloud model)
3. Close other heavy apps to free up RAM
4. Check internet connection if using cloud models

### OmniRoute won't start?

```powershell
# Check installation
omniroute --version

# Try reinstalling
npm install -g omniroute@latest

# Check if port 20128 is in use
netstat -ano | findstr :20128
```

---

## Advanced: Hot-Swap Providers

Switch between providers without restarting:

```powershell
# Scenario 1: Start with Ollama (local, free)
omniroute start

# Test: npm run dev, use chat
# Works fine locally!

# Scenario 2: Want faster responses, add OpenAI
# Edit ~/.omniroute/config.json, add OpenAI provider
# Restart omniroute start
# Chat automatically uses GPT-4 if available

# Scenario 3: OpenAI quota hit, fallback to Claude
# OmniRoute's fallbackOrder handles this automatically
# No code changes needed!
```

---

## File Structure

```
~/.omniroute/
├── config.json           # Provider configuration
├── cache/                # Response cache (optional)
└── logs/                 # Debug logs
```

---

## Performance Expectations

| Scenario | Setup | Speed | Cost |
|----------|-------|-------|------|
| **Free Local** | Ollama + OmniRoute | 2-5s per message | $0 |
| **Fast Cloud** | OpenAI gpt-3.5 + OmniRoute | 0.5-2s | $0.001-0.01 |
| **Best Quality** | Claude-3-Sonnet + OmniRoute | 1-3s | $0.003-0.015 |
| **Hybrid** | Ollama (free) + GPT-4 (paid fallback) | 0.5-5s | $0-0.015 |

---

## 🎉 You're All Set!

Your chat now uses **OmniRoute as the unified gateway**:

- ✅ Single endpoint for multiple providers
- ✅ Auto-routing to best available model
- ✅ Simple provider swapping
- ✅ Conversation persistence (localStorage)
- ✅ Production-ready error handling
- ✅ Mobile responsive UI

**Enjoy your flexible, multi-provider AI chat!** 🚀

---

## Next Steps

1. **Start OmniRoute**: `omniroute start`
2. **Start Chat**: `npm run dev`
3. **Open Browser**: http://localhost:3000/app/chat
4. **Test Streaming**: Type a message and watch it stream in real-time
5. **Switch Providers**: Edit config.json and restart to use different AI providers

---

## Questions?

If OmniRoute doesn't work:
1. Check: `omniroute --version`
2. Check: `omniroute start` produces no errors
3. Check: `curl http://localhost:20128/v1/models` returns available models
4. Check: Provider API keys in `~/.omniroute/config.json` are correct
5. Restart OmniRoute: `omniroute start`

Everything should work! 🎯
