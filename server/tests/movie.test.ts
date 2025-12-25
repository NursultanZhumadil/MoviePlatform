import { Movie } from '../src/models/Movie';
import { Genre } from '../src/models/Genre';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

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

describe('Movie Model', () => {
  let genre: any;

  beforeEach(async () => {
    await Movie.deleteMany({});
    await Genre.deleteMany({});

    genre = new Genre({
      name: 'Action',
      description: 'Action movies',
    });
    await genre.save();
  });

  it('should create a new movie', async () => {
    const movieData = {
      title: 'Test Movie',
      description: 'This is a test movie description',
      genre: genre._id,
      year: 2020,
      director: 'Test Director',
      duration: 120,
      poster: 'https://example.com/poster.jpg',
      rating: 0,
    };

    const movie = new Movie(movieData);
    await movie.save();

    expect(movie._id).toBeDefined();
    expect(movie.title).toBe(movieData.title);
    expect(movie.description).toBe(movieData.description);
    expect(movie.year).toBe(movieData.year);
    expect(movie.isDeleted).toBe(false);
  });

  it('should validate required fields', async () => {
    const movie = new Movie({});

    await expect(movie.save()).rejects.toThrow();
  });

  it('should validate year range', async () => {
    const movieData = {
      title: 'Test Movie',
      description: 'This is a test movie description',
      genre: genre._id,
      year: 1800, // Too old
      director: 'Test Director',
      duration: 120,
      poster: 'https://example.com/poster.jpg',
    };

    const movie = new Movie(movieData);
    await expect(movie.save()).rejects.toThrow();
  });

  it('should validate duration range', async () => {
    const movieData = {
      title: 'Test Movie',
      description: 'This is a test movie description',
      genre: genre._id,
      year: 2020,
      director: 'Test Director',
      duration: 0, // Too short
      poster: 'https://example.com/poster.jpg',
    };

    const movie = new Movie(movieData);
    await expect(movie.save()).rejects.toThrow();
  });
});

