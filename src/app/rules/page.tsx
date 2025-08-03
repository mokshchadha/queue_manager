// src/app/rules/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import RulesEngine from '../../components/RulesEngine';
import { User } from '../../lib/types';

export default function Rules() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout user={user || undefined} currentPage="rules">
      <RulesEngine />
    </Layout>
  );
}