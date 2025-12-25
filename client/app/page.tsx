'use client';

import { useEffect } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import { GET_MOVIES } from '@/lib/graphql/queries';
import { MOVIE_ADDED_SUBSCRIPTION } from '@/lib/graphql/subscriptions';
import { MoviesList } from '@/components/MoviesList';
import { GenresList } from '@/components/GenresList';
import { SearchBar } from '@/components/SearchBar';
import { useAuthStore } from '@/lib/store/auth-store';

export default function HomePage() {
  const { data, refetch } = useQuery(GET_MOVIES, {
    variables: { limit: 20, offset: 0 },
  });

  // Subscribe to new movies
  useSubscription(MOVIE_ADDED_SUBSCRIPTION, {
    onData: ({ data: subscriptionData }) => {
      if (subscriptionData?.data?.movieAdded) {
        refetch();
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🎬 Movie Platform
          </h1>
          <p className="text-gray-300">
            Discover and watch amazing movies
          </p>
        </header>

        <SearchBar />
        <GenresList />
      </div>
    </div>
  );
}

