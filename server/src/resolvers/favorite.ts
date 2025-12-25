import { GraphQLError } from 'graphql';
import { Favorite } from '../models/Favorite';
import { Movie } from '../models/Movie';
import { AuthContext } from '../types';
import { requireAuth } from '../middleware/auth';

export const favoriteResolvers = {
  Query: {
    favorites: async (_: unknown, __: unknown, context: AuthContext) => {
      requireAuth(context);

      const favorites = await Favorite.find({ userId: context.user!.id })
        .populate({
          path: 'movieId',
          populate: { path: 'genre' },
        })
        .sort({ createdAt: -1 })
        .lean();

      return favorites
        .map((fav: any) => fav.movieId)
        .filter((movie: any) => movie && !movie.isDeleted)
        .map((movie: any) => {
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

    isFavorite: async (
      _: unknown,
      { movieId }: { movieId: string },
      context: AuthContext
    ) => {
      if (!context.user) return false;

      const favorite = await Favorite.findOne({
        userId: context.user.id,
        movieId,
      });

      return !!favorite;
    },
  },

  Mutation: {
    addToFavorites: async (
      _: unknown,
      { movieId }: { movieId: string },
      context: AuthContext
    ) => {
      requireAuth(context);

      const movie = await Movie.findOne({ _id: movieId, isDeleted: false });
      if (!movie) {
        throw new GraphQLError('Movie not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const existingFavorite = await Favorite.findOne({
        userId: context.user!.id,
        movieId,
      });

      if (existingFavorite) {
        return true; // Already in favorites
      }

      const favorite = new Favorite({
        userId: context.user!.id,
        movieId,
      });

      await favorite.save();
      return true;
    },

    removeFromFavorites: async (
      _: unknown,
      { movieId }: { movieId: string },
      context: AuthContext
    ) => {
      requireAuth(context);

      const favorite = await Favorite.findOne({
        userId: context.user!.id,
        movieId,
      });

      if (favorite) {
        await favorite.deleteOne();
      }

      return true;
    },
  },
};

