'use client';

import { useQuery, useMutation } from '@apollo/client';
import { IS_FAVORITE } from '@/lib/graphql/queries';
import { ADD_TO_FAVORITES, REMOVE_FROM_FAVORITES } from '@/lib/graphql/mutations';
import { GET_MOVIES } from '@/lib/graphql/queries';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth-store';
import { useState } from 'react';

export function MovieCard({ movie }: { movie: any }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const [isFavoriteState, setIsFavoriteState] = useState(false);

  const { data: favoriteData, refetch: refetchFavorite } = useQuery(IS_FAVORITE, {
    variables: { movieId: movie.id },
    skip: !isAuthenticated,
    onCompleted: (data) => {
      setIsFavoriteState(data?.isFavorite || false);
    },
  });

  const [addToFavorites] = useMutation(ADD_TO_FAVORITES, {
    refetchQueries: [
      { query: GET_MOVIES, variables: { limit: 20, offset: 0 } },
      { query: IS_FAVORITE, variables: { movieId: movie.id } },
    ],
    onCompleted: () => {
      setIsFavoriteState(true);
      refetchFavorite();
    },
  });

  const [removeFromFavorites] = useMutation(REMOVE_FROM_FAVORITES, {
    refetchQueries: [
      { query: GET_MOVIES, variables: { limit: 20, offset: 0 } },
      { query: IS_FAVORITE, variables: { movieId: movie.id } },
    ],
    onCompleted: () => {
      setIsFavoriteState(false);
      refetchFavorite();
    },
  });

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      return;
    }

    try {
      if (isFavoriteState) {
        await removeFromFavorites({ variables: { movieId: movie.id } });
      } else {
        await addToFavorites({ variables: { movieId: movie.id } });
      }
    } catch (err) {
      console.error('Favorite error:', err);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-transform relative">
      <Link href={`/movies/${movie.id}`}>
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-64 object-cover"
        />
        <div className="p-4">
          <h3 className="text-white font-semibold text-lg mb-2">
            {movie.title}
          </h3>
          <p className="text-gray-400 text-sm mb-2">
            {movie.year} • {movie.director}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-yellow-400">⭐ {movie.rating.toFixed(1)}</span>
            <span className="text-gray-400 text-sm">{movie.genre.name}</span>
          </div>
        </div>
      </Link>
      {isAuthenticated && (
        <button
          onClick={handleFavoriteToggle}
          className="absolute top-2 right-2 bg-gray-900/80 hover:bg-gray-900 p-2 rounded-full transition"
          title={isFavoriteState ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavoriteState ? (
            <span className="text-yellow-400 text-xl">⭐</span>
          ) : (
            <span className="text-gray-400 text-xl">☆</span>
          )}
        </button>
      )}
    </div>
  );
}

