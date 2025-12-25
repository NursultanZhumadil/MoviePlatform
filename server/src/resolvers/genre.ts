import { Genre } from '../models/Genre';
import { Movie } from '../models/Movie';

export const genreResolvers = {
  Query: {
    genres: async () => {
      const genres = await Genre.find()
        .sort({ name: 1 })
        .lean();

      // Get all non-deleted movies for each genre
      const genresWithMovies = await Promise.all(
        genres.map(async (genre) => {
          const movies = await Movie.find({
            genre: genre._id,
            isDeleted: false,
          })
            .select('_id title poster rating')
            .lean();

          return {
            id: genre._id.toString(),
            name: genre.name,
            description: genre.description,
            movies: movies.map((movie: any) => ({
              id: movie._id.toString(),
              title: movie.title,
              poster: movie.poster,
              rating: movie.rating,
            })),
            createdAt: genre.createdAt.toISOString(),
            updatedAt: genre.updatedAt.toISOString(),
          };
        })
      );

      return genresWithMovies;
    },
  },
};

