'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth-store';
import { useRouter } from 'next/navigation';

export function Navigation() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const isAdmin = useAuthStore((state) => state.isAdmin());
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.push('/');
  };

  if (!mounted) {
    return (
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold text-white">
              🎬 Movie Platform
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-300 hover:text-white transition"
              >
                Movies
              </Link>
              <Link
                href="/auth/login"
                className="text-gray-300 hover:text-white transition"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-white">
            🎬 Movie Platform
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-gray-300 hover:text-white transition"
            >
              Movies
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  href="/favorites"
                  className="text-gray-300 hover:text-white transition"
                >
                  ⭐ Favorites
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-gray-300 hover:text-white transition"
                  >
                    Admin Panel
                  </Link>
                )}
                <span className="text-gray-300">Hello, {user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-300 hover:text-white transition"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

