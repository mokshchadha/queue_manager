'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { User } from '../../lib/types';

interface LayoutProps {
  children: React.ReactNode;
  user?: User;
}

export default function Layout({ children, user }: LayoutProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
    setIsLoggingOut(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {user && (
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Welcome, <span className="font-medium">{user.username}</span>!
                </span>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            </div>
          </div>
        </header>
      )}
      <main>{children}</main>
    </div>
  );
}