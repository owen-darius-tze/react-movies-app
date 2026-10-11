# MicroFilm Streaming Chat - Architecture & Data Flow

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                         │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │     app/chat/page.tsx (Chat Page)                       │  │
│  │     └─→ imports ChatInterface                           │  │
│  └────────────────┬─────────────────────────────────────────┘  │
│                   │                                             │
│  ┌────────────────▼─────────────────────────────────────────┐  │
│  │  components/chat/ChatInterface.tsx                      │  │
│  │  ├─ useChat({ api: '/api/chat' })                      │  │
│  │  ├─ messages, input, status, stop()                    │  │
│  │  ├─ Thinking indicator (no flicker)                    │  │
│  │  ├─ Auto-scroll pin-to-bottom logic                    │  │
│  │  ├─ Jump to Latest button                              │  │
│  │  └─ Desktop/mobile responsive layout                   │  │
│  └────────────────┬──────────────────────┬─────────────────┘  │
│                   │                      │                     │
│  ┌────────────────▼──────┐  ┌────────────▼──────────────────┐  │
│  │ MessageInput.tsx      │  │ MessageList.tsx              │  │
│  │ ├─ Textarea input     │  │ ├─ Safe text extraction      │  │
│  │ ├─ Send button        │  │ ├─ No broken markdown        │  │
│  │ ├─ Stop button        │  │ ├─ Filtered parts only       │  │
│  │ └─ Mobile responsive  │  │ └─ Responsive message cards  │  │
│  └───────────────────────┘  └─────────────────────────────┘  │
│                   │                                             │
│          HTTP POST /api/chat                                    │
│          (message streaming)                                    │
│                   │                                             │
└───────────────────┼─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js Server / API                         │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  app/api/chat/route.ts (Route Handler)                 │  │
│  │  ├─ POST(req: NextRequest)                             │  │
│  │  ├─ await req.json() → messages: UIMessage[]           │  │
│  │  ├─ convertToModelMessages(messages)                   │  │
│  │  ├─ streamText({                                       │  │
│  │  │   model: aiConfig.model,                            │  │
│  │  │   system: aiConfig.systemPrompt,                    │  │
│  │  │   messages: [...model messages...]                  │  │
│  │  │ })                                                   │  │
│  │  └─ return result.toUIMessageStreamResponse()          │  │
│  └───────────────────────┬─────────────────────────────────┘  │
│                          │                                      │
│  ┌──────────────────────▼───────────────────────────────────┐  │
│  │  lib/ai-config.ts (Model Configuration)               │  │
│  │  ├─ aiConfig.model = anthropic('claude-3-5-sonnet-...')│  │
│  │  ├─ aiConfig.systemPrompt = "You are MicroFilm..."     │  │
│  │  └─ Centralized for server & client imports            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          │                                      │
└──────────────────────────┼───────────────────────────────────────┘
                           │
                           ▼
                  ┌─────────────────────┐
                  │   Anthropic API     │
                  │   (Claude 3.5)      │
                  │  Environment Var:   │
                  │ ANTHROPIC_API_KEY   │
                  └─────────────────────┘
                           │
                  Streaming Response
                  (SSE format)
                           │
                           ▼
              Browser receives & processes
              text deltas in real-time
```

---

## Message Flow Sequence

### 1. User Sends Message
```
User Types: "Recommend a sci-fi movie"
         ↓
Input Capture → handleInputChange(event)
         ↓
Submit Button Click → handleSubmit(event)
         ↓
status transitions: ready → submitted
```

### 2. Client → Server
```
POST /api/chat
Content-Type: application/json
{
  "id": "chat-123",
  "messages": [
    {
      "id": "user-1",
      "role": "user",
      "parts": [
        {
          "type": "text",
          "text": "Recommend a sci-fi movie"
        }
      ]
    }
  ]
}
```

### 3. Server Processing
```
app/api/chat/route.ts:

1. Receive & parse request
   ↓
2. Extract messages array
   ↓
3. convertToModelMessages(messages)
   UIMessage[] → ModelMessage[]
   ↓
4. streamText({
     model: Claude 3.5 Sonnet
     system: aiConfig.systemPrompt
     messages: [...converted...]
   })
   ↓
5. result.toUIMessageStreamResponse()
   ↓
6. Stream response back to client
```

### 4. Client Receives Stream
```
ReadableStream<UIMessageChunk>
         ↓
useChat hook processes chunks:
- text-start
- text-delta: "I'd recommend"
- text-delta: " Blade Runner"
- text-delta: " 2049"
- text-end
         ↓
Updates messages array in real-time
         ↓
Components re-render (React)
```

### 5. UI State Transitions
```
status: ready
   ↓ (user clicks send)
status: submitted (show thinking indicator)
   ↓ (first token arrives)
status: streaming (hide thinking, show text)
   ↓ (stream completes)
status: ready (enable input again)
```

---

## Component Interaction Map

```
ChatInterface
├─ useChat hook (from @ai-sdk/react)
│  ├─ messages: UIMessage[]
│  ├─ input: string
│  ├─ status: 'ready'|'submitted'|'streaming'|'error'
│  ├─ handleInputChange: (event) => void
│  ├─ handleSubmit: (event) => void
│  ├─ stop: () => Promise<void>
│  └─ error: Error | undefined
│
├─ State Management
│  ├─ isPinned: boolean (auto-scroll state)
│  ├─ showThinking: boolean (indicator visibility)
│  └─ latestAssistantText: string (for handoff)
│
├─ Effects
│  ├─ Track thinking indicator (showThinking logic)
│  ├─ Detect scroll & manage pin state
│  ├─ Auto-scroll when pinned or streaming
│  └─ Message updates trigger scroll check
│
├─ Child: MessageList
│  └─ Receives: messages[]
│     Renders: Safe text-only message cards
│
├─ Child: MessageInput
│  ├─ Receives: input, status, stop, handleSubmit, etc.
│  ├─ Sends: user input via handleInputChange
│  ├─ Handles: Enter key, Shift+Enter
│  └─ Shows: Send/Stop button based on status
│
└─ Child: ThinkingIndicator
   └─ Shows: Only when showThinking=true
      Hides: When latestAssistantText.trim() !== ''
```

---

## Key Feature: Thinking Indicator Handoff

### Problem Solved
- Traditional approach: Think indicator shows until server responds, then text appears (visible flicker/gap)
- **Solution**: Detect when first token arrives, then seamlessly hide indicator

### Implementation
```typescript
// Extract latest assistant message text
const latestAssistantText = useMemo(() => {
  const msg = [...messages].reverse().find(m => m.role === 'assistant');
  return msg?.parts
    .filter(p => p.type === 'text')
    .map(p => p.text)
    .join('') ?? '';
}, [messages]);

// Show thinking only while no text exists
useEffect(() => {
  const isThinking = status === 'submitted' || 
                    (status === 'streaming' && !latestAssistantText.trim());
  setShowThinking(isThinking);
}, [latestAssistantText, status]);
```

### Behavior
```
Time →

submitted ────────────────── streaming ───────────────────────── ready
    │                             │                                │
Show Thinking ───────────────────┼── Hide Thinking ────────────────┘
                        (first token arrives)

Result: Thinking indicator smoothly → text, NO FLICKER
```

---

## Key Feature: Pin-to-Bottom Auto-Scroll

### Algorithm
```typescript
// Detect if user is "near bottom" (within 120px)
nearBottom = scrollHeight - scrollTop - clientHeight ≤ 120

// Only auto-scroll if:
// 1. User is near bottom, OR
// 2. Messages/status changed while streaming

// Release pin on user scroll-up
// Show "Jump to Latest" button when not pinned
```

### State Diagram
```
Scrolling ─────────────────────┐
                               ▼
            ┌──────────────────────────────┐
            │    isPinned = true           │
            │   (Auto-scroll enabled)      │
            │                              │
            │  Scroll up 121px ─────────┐  │
            └──────────────────────────┼──┘
                     ▲                 │
                     │                 ▼
            ┌────────┴─────────────────────────┐
            │    isPinned = false              │
            │   (Auto-scroll disabled)         │
            │   Show "Jump to Latest" button   │
            │                                  │
            │  Click "Jump to Latest" ───────┘
            └─────────────────────────────────┘
```

---

## Key Feature: Stop Button State Management

### State Before Stop
```
User sends message
↓
status = 'submitted'
input disabled
message appearing
stop button visible
```

### User Clicks Stop
```
stop() function called
↓
Stream aborted (TCP)
↓
status = 'ready'
input re-enabled
Partial message kept (not deleted!)
Next send available immediately
```

### No Full Rebuild
- Message array not cleared
- Partial text persists
- User can see what was generated before stop
- Input becomes usable immediately

---

## TypeScript Types Used

```typescript
// From @ai-sdk/react
interface Message {
  id: string;
  role: 'system' | 'user' | 'assistant';
  parts: UIMessagePart[];
}

type MessagePart = TextUIPart | ToolUIPart | CustomContentUIPart | ...;

type TextUIPart = {
  type: 'text';
  text: string;
  state?: 'streaming' | 'done';
};

type UseChatReturnType = {
  messages: Message[];
  input: string;
  handleInputChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  status: 'ready' | 'submitted' | 'streaming' | 'error';
  stop: () => Promise<void>;
  error: Error | undefined;
};

// From app/api/chat/route.ts
type ChatRouteRequest = {
  messages?: UIMessage[];
};

type ChatRouteResponse = Response; // Streaming response
```

---

## Environment Variables Required

```bash
# Required for production
ANTHROPIC_API_KEY=sk-ant-[your-key]

# Optional for Next.js
NODE_ENV=production
```

---

## Performance Considerations

1. **Streaming**: Real-time token delivery (no waiting for full response)
2. **Memory**: Messages array grows linearly (consider pagination for long conversations)
3. **Network**: SSE (Server-Sent Events) used for streaming
4. **UI**: React batches updates (no excessive re-renders)
5. **Mobile**: CSS media queries optimize layout (no JS overhead)

---

## Security Notes

- ✅ API keys server-side only (never exposed in client bundle)
- ✅ Message validation on server before Claude call
- ✅ No direct XSS risk (text properly extracted and rendered)
- ✅ CORS handled by Next.js default (same-origin only)
- ✅ Rate limiting should be added in production

---

## Testing Checklist

- [ ] Open `/app/chat`
- [ ] Type a message
- [ ] Verify thinking indicator appears
- [ ] Verify text streams in real-time
- [ ] Verify auto-scroll follows
- [ ] Click stop button mid-stream
- [ ] Verify partial text is kept
- [ ] Type new message
- [ ] Scroll up
- [ ] Verify "Jump to Latest" appears
- [ ] Click "Jump to Latest"
- [ ] Verify smooth scroll to bottom
- [ ] Test on mobile (Shift+Enter for newline)
- [ ] Verify responsive layout

**All items passing = Production Ready** ✅
