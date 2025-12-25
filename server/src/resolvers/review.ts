import { GraphQLError } from 'graphql';
import mongoose from 'mongoose';
import { Review } from '../models/Review';
import { Movie } from '../models/Movie';
import { AuthContext } from '../types';
import { requireAuth } from '../middleware/auth';
import { z } from 'zod';
import { pubsub } from './movie';

const createReviewSchema = z.object({
  movieId: z.string(),
  rating: z.number().int().min(1).max(10),
  comment: z.string().min(5).max(1000),
});

export const reviewResolvers = {
  Query: {
    reviews: async (_: unknown, { movieId }: { movieId: string }) => {
      // Убеждаемся, что movieId правильно преобразован в ObjectId
      let movieObjectId: mongoose.Types.ObjectId;
      try {
        movieObjectId = new mongoose.Types.ObjectId(movieId);
      } catch (error) {
        throw new GraphQLError('Invalid movie ID', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const reviews = await Review.find({ movieId: movieObjectId })
        .populate('userId', 'name email avatar')
        .sort({ createdAt: -1 })
        .lean();

      const movie = await Movie.findById(movieId).populate('genre').lean();
      if (!movie) {
        throw new GraphQLError('Movie not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const movieGenre = (movie as any).genre;
      return reviews.map((review: any) => {
        // Правильно извлекаем данные пользователя после populate
        const userIdData = review.userId;
        const userData = userIdData && typeof userIdData === 'object' && userIdData._id
          ? {
              id: userIdData._id.toString(),
              name: userIdData.name,
              email: userIdData.email,
              avatar: userIdData.avatar || null,
            }
          : {
              id: userIdData?.toString() || '',
              name: '',
              email: '',
              avatar: null,
            };

        return {
          id: review._id.toString(),
          movieId: review.movieId.toString(),
          movie: {
            id: movie._id.toString(),
            title: movie.title,
            description: movie.description,
            genre: movieGenre && movieGenre._id ? {
              id: movieGenre._id.toString(),
              name: movieGenre.name,
              description: movieGenre.description,
            } : null,
            year: movie.year,
            director: movie.director,
            duration: movie.duration,
            poster: movie.poster,
            rating: movie.rating,
            createdAt: movie.createdAt.toISOString(),
            updatedAt: movie.updatedAt.toISOString(),
          },
          userId: review.userId?._id?.toString() || review.userId?.toString() || '',
          user: userData,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt.toISOString(),
          updatedAt: review.updatedAt.toISOString(),
        };
      });
    },
  },

  Mutation: {
    createReview: async (
      _: unknown,
      { input }: { input: unknown },
      context: AuthContext
    ) => {
      requireAuth(context);
      const validated = createReviewSchema.parse(input);

      const movie = await Movie.findOne({ _id: validated.movieId, isDeleted: false });
      if (!movie) {
        throw new GraphQLError('Movie not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Преобразуем movieId и userId в ObjectId
      const movieObjectId = new mongoose.Types.ObjectId(validated.movieId);
      const userObjectId = new mongoose.Types.ObjectId(context.user!.id);

      const existingReview = await Review.findOne({
        movieId: movieObjectId,
        userId: userObjectId,
      });

      if (existingReview) {
        throw new GraphQLError('You have already reviewed this movie', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const review = new Review({
        movieId: movieObjectId,
        userId: userObjectId,
        rating: validated.rating,
        comment: validated.comment,
      });

      await review.save();
      
      // Проверяем, что комментарий сохранился
      const savedReview = await Review.findById(review._id);
      if (!savedReview) {
        throw new GraphQLError('Failed to save review', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }

      await review.populate('userId', 'name email avatar');
      await review.populate('movieId');

      // Update movie rating
      const allReviews = await Review.find({ movieId: movieObjectId });
      const avgRating =
        allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      movie.rating = avgRating;
      await movie.save();

      // Получаем данные пользователя
      const user = (review.userId as any);
      const userData = user._id ? {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar || null,
      } : {
        id: user.toString(),
        name: context.user!.name,
        email: context.user!.email,
        avatar: context.user!.avatar || null,
      };

      const reviewData = {
        id: review._id.toString(),
        movieId: review.movieId.toString(),
        movie: movie,
        userId: review.userId.toString(),
        user: userData,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
      };

      await pubsub.publish(`REVIEW_ADDED_${validated.movieId}`, {
        reviewAdded: reviewData,
      });

      return reviewData;
    },

    deleteReview: async (
      _: unknown,
      { id }: { id: string },
      context: AuthContext
    ) => {
      requireAuth(context);

      const review = await Review.findById(id);
      if (!review) {
        throw new GraphQLError('Review not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Only admin or review owner can delete
      if (
        context.user!.role !== 'Admin' &&
        review.userId.toString() !== context.user!.id
      ) {
        throw new GraphQLError('Not authorized to delete this review', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const movieId = review.movieId.toString();
      await review.deleteOne();

      // Update movie rating
      const allReviews = await Review.find({ movieId });
      const movie = await Movie.findById(movieId);
      if (movie && allReviews.length > 0) {
        const avgRating =
          allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        movie.rating = avgRating;
        await movie.save();
      } else if (movie) {
        movie.rating = 0;
        await movie.save();
      }

      return true;
    },
  },

  Subscription: {
    reviewAdded: {
      subscribe: (_: unknown, { movieId }: { movieId: string }) => {
        return pubsub.asyncIterator([`REVIEW_ADDED_${movieId}`]);
      },
      resolve: (payload: { reviewAdded: unknown }) => payload.reviewAdded,
    },
  },
};

