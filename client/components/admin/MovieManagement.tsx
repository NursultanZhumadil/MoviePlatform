'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_MOVIES, GET_GENRES } from '@/lib/graphql/queries';
import { CREATE_MOVIE, UPDATE_MOVIE, DELETE_MOVIE } from '@/lib/graphql/mutations';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const movieSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(10).max(2000),
  genreId: z.string(),
  year: z.number().min(1900).max(new Date().getFullYear() + 5),
  director: z.string().min(2).max(100),
  duration: z.number().min(1).max(600),
  poster: z.string().url(),
  trailerUrl: z.string().url().optional(),
});

type MovieForm = z.infer<typeof movieSchema>;

export function MovieManagement() {
  const [editingMovie, setEditingMovie] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: moviesData, loading: moviesLoading } = useQuery(GET_MOVIES, {
    variables: { limit: 100, offset: 0 },
  });

  const { data: genresData, loading: genresLoading, error: genresError } = useQuery(GET_GENRES);
  
  if (genresError) {
    console.error('Genres error:', genresError);
  }

  const [createMovie] = useMutation(CREATE_MOVIE, {
    refetchQueries: [{ query: GET_MOVIES, variables: { limit: 100, offset: 0 } }],
  });

  const [updateMovie] = useMutation(UPDATE_MOVIE, {
    refetchQueries: [{ query: GET_MOVIES, variables: { limit: 100, offset: 0 } }],
  });

  const [deleteMovie] = useMutation(DELETE_MOVIE, {
    refetchQueries: [{ query: GET_MOVIES, variables: { limit: 100, offset: 0 } }],
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<MovieForm>({
    resolver: zodResolver(movieSchema),
  });

  const onSubmit = async (data: MovieForm) => {
    try {
      if (editingMovie) {
        await updateMovie({
          variables: {
            id: editingMovie,
            input: data,
          },
        });
        setEditingMovie(null);
      } else {
        await createMovie({
          variables: { input: data },
        });
      }
      reset();
      setShowForm(false);
    } catch (err) {
      console.error('Movie error:', err);
    }
  };

  const handleEdit = (movie: any) => {
    setEditingMovie(movie.id);
    setValue('title', movie.title);
    setValue('description', movie.description);
    setValue('genreId', movie.genre.id);
    setValue('year', movie.year);
    setValue('director', movie.director);
    setValue('duration', movie.duration);
    setValue('poster', movie.poster);
    setValue('trailerUrl', movie.trailerUrl || '');
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this movie?')) {
      try {
        await deleteMovie({ variables: { id } });
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  const movies = moviesData?.movies || [];
  const genres = genresData?.genres || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Movies</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingMovie(null);
            reset();
          }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
        >
          {showForm ? 'Cancel' : '+ Add Movie'}
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-white mb-4">
            {editingMovie ? 'Edit Movie' : 'Add New Movie'}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">Title</label>
                <input
                  {...register('title')}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Genre</label>
                {genresLoading ? (
                  <div className="text-gray-400">Loading genres...</div>
                ) : genresError ? (
                  <div className="text-red-500">Error loading genres: {genresError.message}</div>
                ) : (
                  <select
                    {...register('genreId')}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select genre</option>
                    {genres.map((genre: any) => (
                      <option key={genre.id} value={genre.id}>
                        {genre.name}
                      </option>
                    ))}
                  </select>
                )}
                {errors.genreId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.genreId.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Year</label>
                <input
                  {...register('year', { valueAsNumber: true })}
                  type="number"
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.year && (
                  <p className="text-red-500 text-sm mt-1">{errors.year.message}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Director</label>
                <input
                  {...register('director')}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.director && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.director.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Duration (minutes)</label>
                <input
                  {...register('duration', { valueAsNumber: true })}
                  type="number"
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.duration && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.duration.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Poster URL</label>
                <input
                  {...register('poster')}
                  type="url"
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.poster && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.poster.message}
                  </p>
                )}
              </div>
              <div>
  <label className="block text-gray-300 mb-2">Trailer URL (YouTube)</label>
  <input
    {...register('trailerUrl')}
    type="url"
    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
    placeholder="https://www.youtube.com/watch?v=..."
  />
</div>

            </div>

            <div>
              <label className="block text-gray-300 mb-2">Description</label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              {editingMovie ? 'Update Movie' : 'Create Movie'}
            </button>
          </form>
        </div>
      )}

      {moviesLoading ? (
        <div className="text-white">Loading movies...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {movies.map((movie: any) => (
            <div
              key={movie.id}
              className="bg-gray-800 rounded-lg overflow-hidden"
            >
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-white font-semibold mb-2">{movie.title}</h3>
                <p className="text-gray-400 text-sm mb-4">
                  {movie.year} • {movie.genre.name}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(movie)}
                    className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition text-sm" 
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(movie.id)}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

