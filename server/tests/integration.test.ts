import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../src/models/User';
import { Movie } from '../src/models/Movie';
import { Genre } from '../src/models/Genre';
import { Review } from '../src/models/Review';
import { UserRole } from '../src/types';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Integration Tests', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Movie.deleteMany({});
    await Genre.deleteMany({});
    await Review.deleteMany({});
  });

  it('should create a complete movie review flow', async () => {
    // Create user
    const user = new User({
      email: 'user@test.com',
      password: 'password123',
      name: 'Test User',
      role: UserRole.User,
    });
    await user.save();

    // Create genre
    const genre = new Genre({
      name: 'Action',
      description: 'Action movies',
    });
    await genre.save();

    // Create movie
    const movie = new Movie({
      title: 'Test Movie',
      description: 'This is a test movie',
      genre: genre._id,
      year: 2020,
      director: 'Test Director',
      duration: 120,
      poster: 'https://example.com/poster.jpg',
      rating: 0,
    });
    await movie.save();

    // Create review
    const review = new Review({
      movieId: movie._id,
      userId: user._id,
      rating: 8,
      comment: 'Great movie!',
    });
    await review.save();

    // Update movie rating
    const reviews = await Review.find({ movieId: movie._id });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    movie.rating = avgRating;
    await movie.save();

    // Verify
    const updatedMovie = await Movie.findById(movie._id);
    expect(updatedMovie?.rating).toBe(8);

    const savedReview = await Review.findById(review._id).populate('userId').populate('movieId');
    expect(savedReview?.comment).toBe('Great movie!');
    expect(savedReview?.rating).toBe(8);
  });

  it('should prevent duplicate reviews from same user', async () => {
    const user = new User({
      email: 'user2@test.com',
      password: 'password123',
      name: 'Test User 2',
      role: UserRole.User,
    });
    await user.save();

    const genre = new Genre({
      name: 'Drama',
      description: 'Drama movies',
    });
    await genre.save();

    const movie = new Movie({
      title: 'Test Movie 2',
      description: 'This is another test movie',
      genre: genre._id,
      year: 2021,
      director: 'Test Director 2',
      duration: 110,
      poster: 'https://example.com/poster2.jpg',
      rating: 0,
    });
    await movie.save();

    const review1 = new Review({
      movieId: movie._id,
      userId: user._id,
      rating: 7,
      comment: 'First review',
    });
    await review1.save();

    const review2 = new Review({
      movieId: movie._id,
      userId: user._id,
      rating: 9,
      comment: 'Second review',
    });

    await expect(review2.save()).rejects.toThrow();
  });
});

