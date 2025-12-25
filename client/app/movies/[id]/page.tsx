'use client';

import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { GET_MOVIE, GET_REVIEWS } from '@/lib/graphql/queries';
import { CREATE_REVIEW, DELETE_REVIEW } from '@/lib/graphql/mutations';
import { REVIEW_ADDED_SUBSCRIPTION } from '@/lib/graphql/subscriptions';
import { useAuthStore } from '@/lib/store/auth-store';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const reviewSchema = z.object({
  rating: z.number().min(1).max(10),
  comment: z.string().min(5).max(1000),
});

type ReviewForm = z.infer<typeof reviewSchema>;

export default function MoviePage() {
  const params = useParams();
  const router = useRouter();
  const movieId = params.id as string;

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const isAdmin = useAuthStore((state) => state.isAdmin());
  const currentUserId = useAuthStore((state) => state.user?.id);

  const { data: movieData, loading: movieLoading } = useQuery(GET_MOVIE, {
    variables: { id: movieId },
    fetchPolicy: 'network-only',
  });

  const { data: reviewsData, loading: reviewsLoading } = useQuery(GET_REVIEWS, {
    variables: { movieId },
    fetchPolicy: 'cache-and-network',
  });

  const [createReview, { loading: reviewSubmitting }] = useMutation(
    CREATE_REVIEW,
    {
      // Убираем refetchQueries, так как subscription обновит кеш автоматически
      awaitRefetchQueries: false,
      update: (cache, { data }) => {
        if (data?.createReview) {
          try {
            const existingData = cache.readQuery({
              query: GET_REVIEWS,
              variables: { movieId },
            });

            if (existingData) {
              // Проверяем, что комментарий еще не существует в списке
              const reviewExists = (existingData as any).reviews.some(
                (r: any) => r.id === data.createReview.id
              );

              if (!reviewExists) {
                cache.writeQuery({
                  query: GET_REVIEWS,
                  variables: { movieId },
                  data: {
                    reviews: [data.createReview, ...(existingData as any).reviews],
                  },
                });
              }
            }
          } catch (error) {
            console.error('Error updating cache:', error);
          }
        }
      },
    }
  );

  const [deleteReview] = useMutation(DELETE_REVIEW, {
    refetchQueries: [
      { query: GET_REVIEWS, variables: { movieId } },
      { query: GET_MOVIE, variables: { id: movieId } },
    ],
  });

  const handleDeleteReview = async (reviewId: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      await deleteReview({ variables: { id: reviewId } });
    }
  };

  // Subscription (real-time reviews)
  useSubscription(REVIEW_ADDED_SUBSCRIPTION, {
    variables: { movieId },
    onSubscriptionData: ({ subscriptionData, client }) => {
      if (subscriptionData.data?.reviewAdded) {
        const newReview = subscriptionData.data.reviewAdded;
        
        // Обновляем кеш запроса GET_REVIEWS
        try {
          const existingData = client.readQuery({
            query: GET_REVIEWS,
            variables: { movieId },
          });

          if (existingData) {
            // Проверяем, что комментарий еще не существует в списке
            const reviewExists = existingData.reviews.some(
              (r: any) => r.id === newReview.id
            );

            if (!reviewExists) {
              client.writeQuery({
                query: GET_REVIEWS,
                variables: { movieId },
                data: {
                  reviews: [newReview, ...existingData.reviews],
                },
              });
            }
          }
        } catch (error) {
          console.error('Error updating cache:', error);
          // Если кеш не найден, просто refetch
          client.refetchQueries({
            include: [GET_REVIEWS],
          });
        }
      }
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema),
  });

  const onSubmit = async (data: ReviewForm) => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    await createReview({
      variables: {
        input: {
          movieId,
          rating: data.rating,
          comment: data.comment,
        },
      },
    });

    reset();
  };

  if (movieLoading) {
    return <div className="text-white p-8">Loading...</div>;
  }

  const movie = movieData?.movie;
  const reviews = reviewsData?.reviews || [];

  if (!movie) {
    return (
      <div className="text-white p-8">
        <h1 className="text-2xl mb-4">Movie not found</h1>
        <button
          onClick={() => router.push('/')}
          className="text-primary-400 hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  const getEmbedUrl = (url: string) => {
    // Если уже embed URL, вернуть как есть
    if (url.includes('youtube.com/embed/')) {
      // Извлекаем только embed URL до параметров
      const match = url.match(/youtube\.com\/embed\/([^?&#]+)/);
      if (match) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
      return url;
    }

    // Обработка watch?v= формата
    if (url.includes('watch?v=') || url.includes('youtube.com/v/')) {
      const match = url.match(/[?&]v=([^&?#]+)/);
      if (match) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    }

    // Обработка youtu.be/ формата
    if (url.includes('youtu.be/')) {
      const match = url.match(/youtu\.be\/([^?&#]+)/);
      if (match) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    }

    // Обработка shorts формата
    if (url.includes('youtube.com/shorts/')) {
      const match = url.match(/shorts\/([^?&#]+)/);
      if (match) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    }

    // Обработка мобильного формата
    if (url.includes('m.youtube.com')) {
      const match = url.match(/[?&]v=([^&?#]+)/);
      if (match) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    }

    return null;
  };

const trailerUrl = movie.trailerUrl
  ? getEmbedUrl(movie.trailerUrl)
  : null;


  // 🔥 YouTube watch?v= → embed/
  // const trailerUrl = movie.trailerUrl
  //   ? movie.trailerUrl.replace('watch?v=', 'embed/')
  //   : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/')}
          className="text-primary-400 hover:underline mb-4"
        >
          ← Back to movies
        </button>

        {/* MOVIE INFO */}
        <div className="bg-gray-800 rounded-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-full md:w-64 h-96 object-cover rounded-lg"
            />

            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-4">
                {movie.title}
              </h1>

              <div className="text-gray-300 mb-4">
                <p><b>Year:</b> {movie.year}</p>
                <p><b>Director:</b> {movie.director}</p>
                <p><b>Duration:</b> {movie.duration} min</p>
                <p><b>Genre:</b> {movie.genre.name}</p>
                <p>
                  <b>Rating:</b>{' '}
                  <span className="text-yellow-400">
                    ⭐ {movie.rating.toFixed(1)}
                  </span>
                </p>
              </div>

              <p className="text-gray-300">{movie.description}</p>
            </div>
          </div>
        </div>

        {/* 🎬 TRAILER */}
        {trailerUrl && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Trailer
            </h2>

            <div className="relative w-full aspect-video rounded-lg overflow-hidden">
              <iframe
                src={trailerUrl}
                title={`${movie.title} Trailer`}
                className="absolute top-0 left-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* ADD REVIEW */}
        {isAuthenticated && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Leave a Review
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-gray-300">Rating (1-10)</label>
                <input
                  {...register('rating', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  max="10"
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg"
                />
                {errors.rating && (
                  <p className="text-red-500 text-sm">
                    {errors.rating.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-gray-300">Comment</label>
                <textarea
                  {...register('comment')}
                  rows={4}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg"
                />
                {errors.comment && (
                  <p className="text-red-500 text-sm">
                    {errors.comment.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="bg-primary-600 px-6 py-2 rounded-lg text-white"
              >
                {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        )}

        {/* REVIEWS */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">
            Reviews
          </h2>

          {reviewsLoading ? (
            <p className="text-gray-400">Loading...</p>
          ) : reviews.length === 0 ? (
            <p className="text-gray-400">No reviews yet</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review: any) => (
                <div
                  key={review.id}
                  className="bg-gray-700 p-4 rounded-lg"
                >
                  <div className="flex justify-between mb-2">
                    <span className="text-white font-semibold">
                      {review.user.name}
                    </span>
                    <span className="text-yellow-400">
                      ⭐ {review.rating}/10
                    </span>
                  </div>

                  <p className="text-gray-300">{review.comment}</p>

                  {(isAdmin || review.userId === currentUserId) && (
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="text-red-400 text-sm mt-2"
                    >
                      🗑 Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
