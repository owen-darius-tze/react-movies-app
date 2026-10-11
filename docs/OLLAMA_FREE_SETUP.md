# 🆓 Ollama Setup Guide for MicroFilm Chat (Completely Free)

## Overview
- **Cost**: $0 (runs locally on your computer)
- **No API keys needed**
- **No internet required** (after models download)
- **Unlimited usage**
- **Fast responses** (depends on your hardware)

---

## Complete Setup Steps

### Step 1: Install Ollama (Windows)

**Method A: Installer (Easiest)**
1. Visit: https://ollama.ai
2. Click "Download" → "Windows"
3. Download `OllamaSetup.exe`
4. Double-click to install
5. Follow the installer wizard
6. **Restart your computer** (important!)

**Method B: Direct Link**
```
https://ollama.ai/download/OllamaSetup.exe
```

**Verify Installation:**
```powershell
ollama --version
# Should show: ollama version X.X.X
```

---

### Step 2: Download a Free AI Model

After restart, open **PowerShell** and pull a model. Choose one:

**Option A: Mistral (RECOMMENDED - Fastest)**
```powershell
ollama pull mistral
```
- Size: ~2.6 GB
- Speed: Very fast ⚡⚡⚡
- Quality: Good ✓✓✓
- Time: ~5-10 min (depends on internet)

**Option B: Llama2 (Better Quality)**
```powershell
ollama pull llama2
```
- Size: ~3.8 GB  
- Speed: Slower but better responses
- Quality: Excellent ✓✓✓✓
- Time: ~10-15 min

**Option C: Neural-Chat (Very Fast)**
```powershell
ollama pull neural-chat
```
- Size: ~1.3 GB
- Speed: Super fast ⚡⚡⚡⚡
- Quality: Good ✓✓
- Time: ~3-5 min

**Choose one and wait for download to complete.** You'll see:
```
pulling manifest
pulling xxxxxxx
verifying sha256 digest
writing manifest
success
```

---

### Step 3: Start Ollama Server

**Keep this terminal open while using the chat:**

```powershell
ollama serve
```

You should see:
```
2024-08-31T12:34:56.789Z INFO server.go:1234 "Listening on 127.0.0.1:11434"
```

✅ **Leave this running in the background** — don't close this terminal!

---

### Step 4: Verify Ollama is Working

**Open a NEW PowerShell terminal** (keep the `ollama serve` one open):

```powershell
curl http://localhost:11434/api/tags
```

Should return:
```json
{
  "models": [
    {
      "name": "mistral:latest",
      "size": 2700000000
    }
  ]
}
```

✅ If you see your model listed, Ollama is running correctly!

---

### Step 5: Your Chat Code is Already Updated ✅

I've already updated:
- ✅ `lib/ai-config.ts` — Points to Ollama on localhost:11434
- ✅ `app/api/chat/route.ts` — Includes error handling if Ollama stops

**No changes needed on your part!**

---

### Step 6: Run Your Chat

**In a NEW PowerShell terminal** (keep `ollama serve` running):

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
☐ Ollama installed (ollama --version works)
☐ Model downloaded (mistral, llama2, or neural-chat)
☐ ollama serve running in one terminal
☐ npm run dev running in another terminal
☐ Open http://localhost:3000/app/chat
☐ Type a message and see it stream!
```

---

## How It Works

```
Browser Chat
    ↓
POST /api/chat
    ↓
Node.js Server (app/api/chat/route.ts)
    ↓
HTTP to Ollama on localhost:11434
    ↓
Local AI Model runs on your computer
    ↓
Response streams back to chat
    ↓
✨ Real-time streaming display
```

**Everything runs locally — your computer, no internet, no costs.**

---

## Troubleshooting

### "Connection refused" error in chat?
**Solution**: Make sure `ollama serve` is running in another terminal.

```powershell
# Terminal 1: Keep this open
ollama serve

# Terminal 2: Run your app
npm run dev
```

---

### Chat is slow?
**Options**:
1. Use `mistral` instead of `llama2` (faster)
2. Upgrade your computer's RAM (AI models need RAM)
3. Close other heavy apps

---

### Want to change the model?

Edit `lib/ai-config.ts` line 18:

```typescript
model: ollama('mistral'),  // Change to: 'llama2' or 'neural-chat'
```

---

## Performance Expectations

| Model | Speed | Quality | RAM Needed |
|-------|-------|---------|-----------|
| mistral | ⚡⚡⚡⚡ Fast | ⭐⭐⭐⭐ Good | 4GB |
| neural-chat | ⚡⚡⚡⚡ Very Fast | ⭐⭐⭐ Good | 3GB |
| llama2 | ⚡⚡ Slower | ⭐⭐⭐⭐⭐ Excellent | 6GB |

---

## 🎉 You're All Set!

Your chat is now **completely free**:
- ✅ No Anthropic API costs
- ✅ No credit card needed
- ✅ Unlimited usage
- ✅ Runs on your computer

**Enjoy your free AI chat!** 🚀

---

## Optional: Change Model Later

Want to try a different model?

```powershell
# Download another model
ollama pull llama2

# Update lib/ai-config.ts:
# model: ollama('llama2'),  // Changed from 'mistral'

# Restart: npm run dev
```

Models run one at a time. Ollama loads the one you specify.

---

## Questions?

If Ollama doesn't work:
1. Check: `ollama --version`
2. Check: `ollama serve` is running (should not error)
3. Check: `curl http://localhost:11434/api/tags` returns your model
4. Restart Ollama: `ollama serve`

Everything should work! 🎯
