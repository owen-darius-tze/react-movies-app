import { Send, Square } from 'lucide-react';

type MessageInputProps = {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  stop: () => void;
  status: string;
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
  const isDisabled = isStreaming || input.trim().length === 0;

  return (
    <form onSubmit={handleSubmit} className="flex items-end space-x-2">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isStreaming}
        placeholder="Ask me about movies..."
        rows={1}
        className="flex-1 resize-none rounded-md border border-gray-300 bg-gray-900 text-white placeholder-gray-400 p-2 focus:outline-none"
      />
      {isStreaming ? (
        <button
          type="button"
          onClick={stop}
          aria-label="Stop generation"
          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center justify-center"
        >
          <Square size={18} />
        </button>
      ) : (
        <button
          type="submit"
          disabled={isDisabled}
          aria-label="Send message"
          className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-md flex items-center justify-center"
        >
          <Send size={18} />
        </button>
      )}
    </form>
  );
}