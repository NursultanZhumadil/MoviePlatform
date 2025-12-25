'use client';

import { useQuery } from '@apollo/client';
import { GET_GENRES } from '@/lib/graphql/queries';
import { useState } from 'react';
import { MoviesList } from './MoviesList';

export function GenresList() {
  const { data, loading, error } = useQuery(GET_GENRES);
  const [selectedGenre, setSelectedGenre] = useState<string | undefined>();

  if (loading) return <div className="text-white">Loading genres...</div>;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;

  const genres = data?.genres || [];

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">Browse by Genre</h2>
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedGenre(undefined)}
          className={`px-4 py-2 rounded-lg transition ${
            !selectedGenre
              ? 'bg-primary-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          All Movies
        </button>
        {genres.map((genre: any) => (
          <button
            key={genre.id}
            onClick={() => setSelectedGenre(genre.id)}
            className={`px-4 py-2 rounded-lg transition ${
              selectedGenre === genre.id
                ? 'bg-primary-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {genre.name} ({genre.movies.length})
          </button>
        ))}
      </div>
      <MoviesList genreId={selectedGenre} />
    </div>
  );
}

