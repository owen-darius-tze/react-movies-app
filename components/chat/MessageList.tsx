import { Message } from '@ai-sdk/react';
import { Fragment } from 'react';
import clsx from 'clsx';

type MessageListProps = {
  messages: Message[];
};

export default function MessageList({ messages }: MessageListProps) {
  return (
    <Fragment>
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={clsx('flex', msg.role === 'assistant' ? 'justify-start' : 'justify-end')}
        >
          <div
            className={clsx(
              'max-w-[80%] rounded-lg p-3 flex-shrink-0',
              msg.role === 'assistant' ? 'bg-gray-700 text-white' : 'bg-indigo-600 text-white',
            )}
          >
            {msg.parts.map((part, i) => (
              <p key={i} className="mb-1 last:mb-0">
                {typeof part.text === 'string' ? part.text : JSON.stringify(part)}
              </p>
            ))}
          </div>
        </div>
      ))}
    </Fragment>
  );
}