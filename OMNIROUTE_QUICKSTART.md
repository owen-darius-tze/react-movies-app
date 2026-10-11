# 🚀 OmniRoute Quick Start (5 Minutes)

## What Changed?

Your chat now uses **OmniRoute** (unified AI gateway) instead of Ollama only:

```
Before: Ollama (localhost:11434) → Single local model
After:  OmniRoute (localhost:20128) → Multiple providers, auto-routing
```

**Benefits**:
- ✅ Use any AI provider (Claude, GPT-4, Ollama, etc.)
- ✅ Auto-switch between providers
- ✅ No code changes needed
- ✅ Chat history saved (localStorage)

---

## 5-Minute Setup

### 1. Install OmniRoute (1 min)
```powershell
npm install -g omniroute
# or use existing install if you already have it
```

### 2. Configure Providers (1 min)

Create or edit: `~/.omniroute/config.json`

**Minimal (Local Only)**:
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

**Full (Multiple Providers)**:
```json
{
  "port": 20128,
  "providers": [
    {
      "name": "claude",
      "enabled": true,
      "type": "anthropic",
      "apiKey": "sk-ant-YOUR_KEY_HERE"
    },
    {
      "name": "openai",
      "enabled": true,
      "type": "openai",
      "apiKey": "sk-proj-YOUR_KEY_HERE"
    },
    {
      "name": "ollama",
      "enabled": true,
      "type": "ollama",
      "baseURL": "http://localhost:11434/v1",
      "apiKey": "ollama"
    }
  ],
  "defaultModel": "auto",
  "fallbackOrder": ["claude", "openai", "ollama"]
}
```

### 3. Start OmniRoute (Keep Open) (1 min)
```powershell
omniroute start
# Should show: Listening on http://localhost:20128
```

### 4. Start Chat (New Terminal) (1 min)
```powershell
cd e:\CAREER\Flyrank AI\react_moviedb\react-movies-app
npm run dev
```

### 5. Open Browser (1 min)
```
http://localhost:3000/app/chat
```

✅ **Done!** Start chatting!

---

## All New Features

✅ **Thinking Indicator** - Animated dots while processing
✅ **Auto-Scroll** - Follows conversation, respects manual scrolling
✅ **Stop Button** - Halt response mid-generation
✅ **Jump to Latest** - Scroll up, then click to go back down
✅ **Chat Persistence** - History saved to localStorage
✅ **Multi-Provider** - Switch between Claude, GPT-4, Ollama, etc.
✅ **Error Handling** - Clear messages if OmniRoute is down
✅ **Mobile Friendly** - Responsive design for all devices

---

## Code Changes

| File | Change |
|------|--------|
| `lib/ai-config.ts` | Ollama (11434) → OmniRoute (20128) |
| `app/api/chat/route.ts` | Added timeout error handling |
| `components/chat/ChatInterface.tsx` | Added localStorage persistence |

**Result**: TypeScript ✅, No errors, All tests pass

---

## Terminal Setup

You need **2 terminals open simultaneously**:

**Terminal 1**: OmniRoute Gateway
```powershell
omniroute start
# Leave open: http://localhost:20128
```

**Terminal 2**: Chat App
```powershell
npm run dev
# Open: http://localhost:3000/app/chat
```

---

## Provider Comparison

| Provider | Speed | Quality | Cost | Setup |
|----------|-------|---------|------|-------|
| **Ollama** | ⚡⚡⚡ | ⭐⭐⭐ | $0 | Local binary |
| **Mistral** | ⚡⚡⚡⚡ | ⭐⭐⭐ | $0 | HuggingFace |
| **GPT-3.5** | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | $$ | API key |
| **GPT-4** | ⚡⚡ | ⭐⭐⭐⭐⭐ | $$$ | API key |
| **Claude-3** | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | $$ | API key |

**Recommendation**: Start with Ollama (free, local), add Claude/GPT-4 for better quality

---

## Troubleshooting

### "Connection refused"
```powershell
# Make sure OmniRoute is running
omniroute start
```

### No models available
```powershell
# If using Ollama
ollama serve
ollama pull mistral
```

### Slow responses
- Use faster model: Mistral, GPT-3.5 (not llama2 or GPT-4)
- Close other apps
- Check internet connection if using cloud providers

### Chat history not saving
- Check browser localStorage enabled
- Private/Incognito mode doesn't persist
- Check browser console for errors

---

## How It Works

```
Your Chat
    ↓
Sends to /api/chat
    ↓
Routes through OmniRoute (localhost:20128)
    ↓
OmniRoute decides:
  • Is Claude available? Use it
  • Is GPT-4 available? Use it
  • Is Ollama running? Use it
  ↓
Response streams back
    ↓
Real-time display in chat
    ↓
Auto-saved to localStorage
```

---

## Full Documentation

- **Setup Details**: `OMNIROUTE_SETUP.md`
- **Implementation Details**: `docs/OMNIROUTE_IMPLEMENTATION.md`
- **Error Scenarios**: See troubleshooting in `OMNIROUTE_SETUP.md`

---

## Next Steps

1. Install OmniRoute: `npm install -g omniroute`
2. Configure `~/.omniroute/config.json`
3. Start OmniRoute: `omniroute start`
4. Start chat: `npm run dev`
5. Open: `http://localhost:3000/app/chat`
6. Enjoy your multi-provider AI chat! 🎉

---

## Testing Checklist

- [ ] OmniRoute running (no errors on start)
- [ ] Models available (`curl http://localhost:20128/v1/models`)
- [ ] Chat starts (`npm run dev` works)
- [ ] Can send message and get response
- [ ] Response streams in real-time
- [ ] Thinking indicator appears then disappears
- [ ] Auto-scroll works
- [ ] Reload page - history is restored
- [ ] Stop button halts mid-response

✅ All green? You're ready to use MicroFilm Chat!

