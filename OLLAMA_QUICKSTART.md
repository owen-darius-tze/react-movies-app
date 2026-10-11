# 🚀 Quick Start: Ollama + MicroFilm Chat

## TL;DR (5 minutes)

### 1. Install Ollama
Download & install: https://ollama.ai

### 2. Download a Model (choose one)
```powershell
ollama pull mistral           # Fast, recommended
# OR
ollama pull llama2            # Better quality, slower
# OR  
ollama pull neural-chat       # Very fast, small
```
**Wait for completion** (~5-15 minutes depending on internet)

### 3. Start Ollama (keep this open!)
```powershell
ollama serve
```

### 4. Run Chat (in another PowerShell)
```powershell
cd e:\CAREER\Flyrank AI\react_moviedb\react-movies-app
npm run dev
```

### 5. Open Browser
```
http://localhost:3000/app/chat
```

✅ **Done! Start chatting for free!**

---

## What Changed

| Component | Before | After |
|-----------|--------|-------|
| Model | Claude 3.5 (paid) | Mistral/Llama2 (free) |
| Provider | Anthropic | Ollama |
| Cost | $3-$10/million tokens | $0 |
| API Key | Required | Not needed |
| Location | Cloud | Your computer |

---

## Files Modified

✅ `lib/ai-config.ts` — Now uses Ollama on localhost:11434  
✅ `app/api/chat/route.ts` — Added error handling for Ollama  

**Everything else works the same!**

---

## Terminal Windows (Keep Both Open)

**Window 1**: Ollama server
```powershell
ollama serve
# Leave open: http://localhost:11434
```

**Window 2**: Your app
```powershell
npm run dev
# http://localhost:3000/app/chat
```

---

## Model Reference

```powershell
ollama pull mistral          # Default, recommended
ollama pull llama2           # High quality
ollama pull neural-chat      # Very fast
ollama pull dolphin-mixtral  # Advanced reasoning
ollama pull codellama        # Code generation
ollama pull phi              # Small & efficient
```

Find more: https://ollama.ai/library

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Connection refused" | Start `ollama serve` |
| "Model not found" | Run `ollama pull mistral` |
| Slow responses | Use `mistral` instead of `llama2` |
| "Port already in use" | Close other Ollama instances |

---

## Performance Tips

- **Mistral** (default): Best balance of speed + quality
- **Neural-chat**: Fastest, use if slow
- **Llama2**: Best quality, use if you have time to wait
- Close other apps to free up RAM
- Responses depend on your computer's CPU/RAM

---

## Full Setup Guide

See: `docs/OLLAMA_FREE_SETUP.md` (detailed instructions)

---

## That's It! 🎉

You now have a **completely free, unlimited AI chat** running on your computer.

No API costs. No limits. No internet needed (after models download).

Enjoy! 🚀
