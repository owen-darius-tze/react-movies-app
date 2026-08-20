import './globals.css';
import Link from 'next/link';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-gray-200">
        <nav className="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700">
          <Link href="/" className="text-xl font-semibold hover:underline">
            Home
          </Link>
          <Link href="/chat" className="text-lg hover:underline">
            Chat
          </Link>
        </nav>
        <main className="container mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}