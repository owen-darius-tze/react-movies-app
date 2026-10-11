import type { Message } from '@ai-sdk/react';
import clsx from 'clsx';

type MessageListProps = {
  messages: Message[];
};

export default function MessageList({ messages }: MessageListProps) {
  return (
    <>
      {messages.map((msg, idx) => {
        const text = msg.parts
          .filter((part) => part.type === 'text' && typeof part.text === 'string')
          .map((part) => part.text)
          .join('');

        if (!text && msg.role !== 'user') {
          return null;
        }

        return (
          <div
            key={msg.id ?? `${msg.role}-${idx}`}
            className={clsx('flex', msg.role === 'assistant' ? 'justify-start' : 'justify-end')}
          >
            <div
              className={clsx(
                'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm',
                msg.role === 'assistant'
                  ? 'border border-slate-700 bg-slate-800 text-slate-50'
                  : 'bg-indigo-600 text-white',
              )}
            >
              <div className="whitespace-pre-wrap break-words">{text || ' '}</div>
            </div>
          </div>
        );
      })}
    </>
  );
}
