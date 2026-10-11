/**
 * Chat Page - AI-powered chat interface using the shared App shell layout
 */

import { ChatInterface } from '../components/ChatInterface';

export default function ChatPage() {
  return (
    <div className="chat-page">
      <main className="chat-page__main">
        <ChatInterface />
      </main>
    </div>
  );
}