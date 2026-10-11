import { Send, Square } from 'lucide-react';
import type { FormEvent, KeyboardEvent } from 'react';

type MessageInputProps = {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  handleKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  stop: () => void;
  status: 'ready' | 'submitted' | 'streaming' | 'error';
};

export default function MessageInput({
  input,
  setInput,
  handleSubmit,
  handleKeyDown,
  stop,
  status,
}: MessageInputProps) {
  const isStreaming = status === 'streaming' || status === 'submitted';
  const isSubmitDisabled = isStreaming || input.trim().length === 0;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <textarea
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isStreaming}
        placeholder="Ask about movies, actors, or recommendations..."
        rows={1}
        className="min-h-[44px] w-full resize-none rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60"
      />

      {isStreaming ? (
        <button
          type="button"
          onClick={stop}
          aria-label="Stop generation"
          className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-red-600 px-4 text-white transition hover:bg-red-500 sm:w-11"
        >
          <Square size={16} fill="currentColor" />
        </button>
      ) : (
        <button
          type="submit"
          disabled={isSubmitDisabled}
          aria-label="Send message"
          className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-indigo-600 px-4 text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-11"
        >
          <Send size={16} />
        </button>
      )}
    </form>
  );
}
