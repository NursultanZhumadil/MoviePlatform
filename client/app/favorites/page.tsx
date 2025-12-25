'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_FAVORITES } from '@/lib/graphql/queries';
import { useAuthStore } from '@/lib/store/auth-store';
import { MovieCard } from '@/components/MovieCard';

export default function FavoritesPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const { data, loading, error } = useQuery(GET_FAVORITES, {
    skip: !isAuthenticated,
  });

  if (!isAuthenticated) {
    return null;
  }

  if (loading) return <div className="text-white p-8">Loading favorites...</div>;
  if (error) return <div className="text-red-500 p-8">Error: {error.message}</div>;

  const favorites = data?.favorites || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">⭐ My Favorites</h1>
          <button
            onClick={() => router.push('/')}
            className="text-primary-400 hover:underline"
          >
            ← Back to movies
          </button>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-xl mb-4">
              You haven&apos;t added any movies to favorites yet
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              Browse Movies
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((movie: any) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

