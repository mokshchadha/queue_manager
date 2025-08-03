import type { Metadata } from 'next';
import './globals.css';
import SessionProvider from '../components/SessionProvider';

export const metadata: Metadata = {
  title: 'Queue Manager',
  description: 'Next.js Authentication App with Google OAuth',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}