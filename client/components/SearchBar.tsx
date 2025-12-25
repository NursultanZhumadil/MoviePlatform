'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { SEARCH_MOVIES } from '@/lib/graphql/queries';
import { MovieCard } from './MovieCard';

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const { data, loading, error } = useQuery(SEARCH_MOVIES, {
    variables: { query: searchQuery },
    skip: !searchQuery || searchQuery.length < 2,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.length >= 2) {
      setIsSearching(true);
    }
  };

  const movies = data?.searchMovies || [];

  return (
    <div className="mb-8">
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearching(e.target.value.length >= 2);
            }}
            placeholder="Search movies by title, director..."
            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            Search
          </button>
        </div>
      </form>

      {isSearching && (
        <div>
          {loading && <div className="text-white">Searching...</div>}
          {error && <div className="text-red-500">Error: {error.message}</div>}
          {!loading && !error && (
            <>
              {movies.length === 0 ? (
                <div className="text-gray-400">No movies found</div>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-white mb-4">
                    Search Results ({movies.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {movies.map((movie: any) => (
                      <MovieCard key={movie.id} movie={movie} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

