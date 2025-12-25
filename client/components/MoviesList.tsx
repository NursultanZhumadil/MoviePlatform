'use client';

import { useQuery } from '@apollo/client';
import { GET_MOVIES } from '@/lib/graphql/queries';
import { MovieCard } from './MovieCard';

export function MoviesList({ genreId }: { genreId?: string }) {
  const { data, loading, error } = useQuery(GET_MOVIES, {
    variables: { genreId, limit: 20, offset: 0 },
  });

  if (loading) return <div className="text-white">Loading movies...</div>;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;

  const movies = data?.movies || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {movies.map((movie: any) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}

