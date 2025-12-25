'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { MovieManagement } from '@/components/admin/MovieManagement';

export default function AdminPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const isAdmin = useAuthStore((state) => state.isAdmin());

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (!isAdmin) {
      router.push('/');
      return;
    }
  }, [isAuthenticated, isAdmin, router]);

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">Admin Panel</h1>
          <button
            onClick={() => router.push('/')}
            className="text-primary-400 hover:underline"
          >
            ← Back to movies
          </button>
        </div>

        <MovieManagement />
      </div>
    </div>
  );
}

