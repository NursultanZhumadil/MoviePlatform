import { GraphQLError } from 'graphql';
import { Movie } from '../models/Movie';
import { Genre } from '../models/Genre';
import { AuthContext } from '../types';
import { requireAdmin } from '../middleware/auth';
import { z } from 'zod';
import { PubSub } from 'graphql-subscriptions';

export const pubsub = new PubSub();

const createMovieSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(10).max(2000),
  genreId: z.string(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 5),
  director: z.string().min(2).max(100),
  duration: z.number().int().min(1).max(600),
  poster: z.string().url(),
  trailerUrl: z
    .union([z.string().url(), z.literal('')])
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
});

const updateMovieSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(10).max(2000).optional(),
  genreId: z.string().optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 5).optional(),
  director: z.string().min(2).max(100).optional(),
  duration: z.number().int().min(1).max(600).optional(),
  poster: z.string().url().optional(),
  trailerUrl: z
    .union([z.string().url(), z.literal('')])
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
});

export const movieResolvers = {
  Query: {
    movies: async (
      _: unknown,
      { genreId, limit = 20, offset = 0 }: { genreId?: string; limit?: number; offset?: number }
    ) => {
      const query: any = { isDeleted: false };
      if (genreId) {
        query.genre = genreId;
      }

      const movies = await Movie.find(query)
        .populate('genre')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
        .lean();

      return movies.map((movie: any) => {
        const genre = movie.genre;
        return {
          id: movie._id.toString(),
          title: movie.title,
          description: movie.description,
          genre: genre && genre._id ? {
            id: genre._id.toString(),
            name: genre.name,
            description: genre.description,
          } : null,
          year: movie.year,
          director: movie.director,
          duration: movie.duration,
          poster: movie.poster,
          trailerUrl: movie.trailerUrl,
          rating: movie.rating,
          createdAt: movie.createdAt.toISOString(),
          updatedAt: movie.updatedAt.toISOString(),
        };
      });
    },

    movie: async (_: unknown, { id }: { id: string }) => {
      const movie = await Movie.findOne({ _id: id, isDeleted: false })
        .populate('genre')
        .lean();

      if (!movie) {
        throw new GraphQLError('Movie not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const genre = (movie as any).genre;
      return {
        id: movie._id.toString(),
        title: movie.title,
        description: movie.description,
        genre: genre && genre._id ? {
          id: genre._id.toString(),
          name: genre.name,
          description: genre.description,
        } : null,
        year: movie.year,
        director: movie.director,
        duration: movie.duration,
        poster: movie.poster,
        trailerUrl: movie.trailerUrl || null,
        rating: movie.rating,
        createdAt: movie.createdAt.toISOString(),
        updatedAt: movie.updatedAt.toISOString(),
      };
    },

    searchMovies: async (_: unknown, { query }: { query: string }) => {
      const movies = await Movie.find({
        isDeleted: false,
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { director: { $regex: query, $options: 'i' } },
        ],
      })
        .populate('genre')
        .limit(20)
        .lean();

      return movies.map((movie: any) => {
        const genre = movie.genre;
        return {
          id: movie._id.toString(),
          title: movie.title,
          description: movie.description,
          genre: genre && genre._id ? {
            id: genre._id.toString(),
            name: genre.name,
            description: genre.description,
          } : null,
          year: movie.year,
          director: movie.director,
          duration: movie.duration,
          poster: movie.poster,
          trailerUrl: movie.trailerUrl || null,
          rating: movie.rating,
          createdAt: movie.createdAt.toISOString(),
          updatedAt: movie.updatedAt.toISOString(),
        };
      });
    },
  },

  Mutation: {
    createMovie: async (
      _: unknown,
      { input }: { input: unknown },
      context: AuthContext
    ) => {
      requireAdmin(context);
      const validated = createMovieSchema.parse(input);

      const genre = await Genre.findById(validated.genreId);
      if (!genre) {
        throw new GraphQLError('Genre not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const movie = new Movie({
        title: validated.title,
        description: validated.description,
        genre: validated.genreId,
        year: validated.year,
        director: validated.director,
        duration: validated.duration,
        trailerUrl: validated.trailerUrl || null,
        poster: validated.poster,
        rating: 0,
      });

      await movie.save();
      await movie.populate('genre');

      await Genre.findByIdAndUpdate(validated.genreId, {
        $push: { movies: movie._id },
      });

      const genreData = (movie.genre as any);
      const movieData = {
        id: movie._id.toString(),
        title: movie.title,
        description: movie.description,
        genre: genreData && genreData._id ? {
          id: genreData._id.toString(),
          name: genreData.name,
          description: genreData.description,
        } : null,
        year: movie.year,
        director: movie.director,
        duration: movie.duration,
        poster: movie.poster,
        rating: movie.rating,
        trailerUrl: movie.trailerUrl || null,
        createdAt: movie.createdAt.toISOString(),
        updatedAt: movie.updatedAt.toISOString(),
      };

      await pubsub.publish('MOVIE_ADDED', { movieAdded: movieData });

      return movieData;
    },

    updateMovie: async (
      _: unknown,
      { id, input }: { id: string; input: unknown },
      context: AuthContext
    ) => {
      requireAdmin(context);
      const validated = updateMovieSchema.parse(input);

      const movie = await Movie.findOne({ _id: id, isDeleted: false });
      if (!movie) {
        throw new GraphQLError('Movie not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (validated.genreId) {
        const genre = await Genre.findById(validated.genreId);
        if (!genre) {
          throw new GraphQLError('Genre not found', {
            extensions: { code: 'NOT_FOUND' },
          });
        }

        // Remove from old genre
        await Genre.findByIdAndUpdate(movie.genre, {
          $pull: { movies: movie._id },
        });

        // Add to new genre
        await Genre.findByIdAndUpdate(validated.genreId, {
          $push: { movies: movie._id },
        });

        movie.genre = validated.genreId as any;
      }

      Object.assign(movie, validated);
      await movie.save();
      await movie.populate('genre');

      const genreData = (movie.genre as any);
      const movieData = {
        id: movie._id.toString(),
        title: movie.title,
        description: movie.description,
        genre: genreData && genreData._id ? {
          id: genreData._id.toString(),
          name: genreData.name,
          description: genreData.description,
        } : null,
        year: movie.year,
        director: movie.director,
        duration: movie.duration,
        poster: movie.poster,
        trailerUrl: movie.trailerUrl || null,
        rating: movie.rating,
        createdAt: movie.createdAt.toISOString(),
        updatedAt: movie.updatedAt.toISOString(),
      };

      await pubsub.publish('MOVIE_UPDATED', { movieUpdated: movieData });

      return movieData;
    },

    deleteMovie: async (
      _: unknown,
      { id }: { id: string },
      context: AuthContext
    ) => {
      requireAdmin(context);

      const movie = await Movie.findOne({ _id: id, isDeleted: false });
      if (!movie) {
        throw new GraphQLError('Movie not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      movie.isDeleted = true;
      await movie.save();

      await Genre.findByIdAndUpdate(movie.genre, {
        $pull: { movies: movie._id },
      });

      return true;
    },
  },

  Subscription: {
    movieAdded: {
      subscribe: () => pubsub.asyncIterator(['MOVIE_ADDED']),
    },
    movieUpdated: {
      subscribe: () => pubsub.asyncIterator(['MOVIE_UPDATED']),
    },
  },
};

