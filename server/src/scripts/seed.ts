import mongoose from 'mongoose';
import { config } from '../utils/config';
import { User } from '../models/User';
import { Genre } from '../models/Genre';
import { Movie } from '../models/Movie';
import { Review } from '../models/Review';
import { UserRole } from '../types';

const seed = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Genre.deleteMany({});
    await Movie.deleteMany({});
    await Review.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create Admin user
    const admin = new User({
      email: 'admin@test.com',
      password: 'admin123',
      name: 'Admin User',
      role: UserRole.Admin,
    });
    await admin.save();
    console.log('👤 Created admin user');

    // Create regular user
    const user = new User({
      email: 'user@test.com',
      password: 'user123',
      name: 'Regular User',
      role: UserRole.User,
    });
    await user.save();
    console.log('👤 Created regular user');

    // Create genres
    const genres = [
      {
        name: 'Action',
        description: 'High-energy films with thrilling sequences and physical feats',
      },
      {
        name: 'Drama',
        description: 'Serious, plot-driven presentations portraying realistic characters',
      },
      {
        name: 'Comedy',
        description: 'Light-hearted plots designed to amuse and entertain',
      },
      {
        name: 'Horror',
        description: 'Films designed to frighten and invoke fear',
      },
      {
        name: 'Sci-Fi',
        description: 'Science fiction films with futuristic themes',
      },
    ];

    const createdGenres = await Genre.insertMany(genres);
    console.log('🎭 Created genres');

    // Create movies
    const movies = [
      {
        title: 'The Matrix',
        description: 'A computer hacker learns about the true nature of reality',
        genre: createdGenres[4]._id,
        year: 1999,
        director: 'Lana Wachowski, Lilly Wachowski',
        duration: 136,
        poster: 'https://via.placeholder.com/300x450?text=The+Matrix',
        rating: 0,
      },
      {
        title: 'Inception',
        description: 'A thief who steals corporate secrets through dream-sharing technology',
        genre: createdGenres[4]._id,
        year: 2010,
        director: 'Christopher Nolan',
        duration: 148,
        poster: 'https://via.placeholder.com/300x450?text=Inception',
        rating: 0,
      },
      {
        title: 'The Dark Knight',
        description: 'Batman faces the Joker in a battle for Gotham City',
        genre: createdGenres[0]._id,
        year: 2008,
        director: 'Christopher Nolan',
        duration: 152,
        poster: 'https://via.placeholder.com/300x450?text=The+Dark+Knight',
        rating: 0,
      },
      {
        title: 'Pulp Fiction',
        description: 'The lives of two mob hitmen, a boxer, and others intertwine',
        genre: createdGenres[1]._id,
        year: 1994,
        director: 'Quentin Tarantino',
        duration: 154,
        poster: 'https://via.placeholder.com/300x450?text=Pulp+Fiction',
        rating: 0,
      },
      {
        title: 'The Hangover',
        description: 'Three buddies wake up from a bachelor party with no memory',
        genre: createdGenres[2]._id,
        year: 2009,
        director: 'Todd Phillips',
        duration: 100,
        poster: 'https://via.placeholder.com/300x450?text=The+Hangover',
        rating: 0,
      },
    ];

    const createdMovies = await Movie.insertMany(movies);
    console.log('🎬 Created movies');

    // Update genres with movies
    for (let i = 0; i < createdGenres.length; i++) {
      const genreMovies = createdMovies.filter(
        (m) => m.genre.toString() === createdGenres[i]._id.toString()
      );
      await Genre.findByIdAndUpdate(createdGenres[i]._id, {
        movies: genreMovies.map((m) => m._id),
      });
    }

    // Create reviews
    const reviews = [
      {
        movieId: createdMovies[0]._id,
        userId: user._id,
        rating: 9,
        comment: 'Amazing movie! The concept is mind-blowing.',
      },
      {
        movieId: createdMovies[1]._id,
        userId: user._id,
        rating: 10,
        comment: 'One of the best movies I have ever seen. Perfect!',
      },
    ];

    await Review.insertMany(reviews);
    console.log('💬 Created reviews');

    // Update movie ratings
    for (const movie of createdMovies) {
      const movieReviews = await Review.find({ movieId: movie._id });
      if (movieReviews.length > 0) {
        const avgRating =
          movieReviews.reduce((sum, r) => sum + r.rating, 0) / movieReviews.length;
        await Movie.findByIdAndUpdate(movie._id, { rating: avgRating });
      }
    }

    console.log('✅ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();

