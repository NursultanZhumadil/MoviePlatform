import { User } from '../src/models/User';
import { UserRole } from '../src/types';
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

describe('User Model', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('should create a new user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      role: UserRole.User,
    };

    const user = new User(userData);
    await user.save();

    expect(user._id).toBeDefined();
    expect(user.email).toBe(userData.email);
    expect(user.name).toBe(userData.name);
    expect(user.role).toBe(UserRole.User);
    expect(user.password).not.toBe(userData.password); // Should be hashed
  });

  it('should hash password before saving', async () => {
    const userData = {
      email: 'test2@example.com',
      password: 'password123',
      name: 'Test User 2',
      role: UserRole.User,
    };

    const user = new User(userData);
    await user.save();

    expect(user.password).not.toBe(userData.password);
    expect(user.password.length).toBeGreaterThan(20);
  });

  it('should compare password correctly', async () => {
    const userData = {
      email: 'test3@example.com',
      password: 'password123',
      name: 'Test User 3',
      role: UserRole.User,
    };

    const user = new User(userData);
    await user.save();

    const isMatch = await user.comparePassword('password123');
    expect(isMatch).toBe(true);

    const isNotMatch = await user.comparePassword('wrongpassword');
    expect(isNotMatch).toBe(false);
  });

  it('should not allow duplicate emails', async () => {
    const userData = {
      email: 'duplicate@example.com',
      password: 'password123',
      name: 'Test User',
      role: UserRole.User,
    };

    await new User(userData).save();

    await expect(new User(userData).save()).rejects.toThrow();
  });

  it('should validate email format', async () => {
    const userData = {
      email: 'invalid-email',
      password: 'password123',
      name: 'Test User',
      role: UserRole.User,
    };

    await expect(new User(userData).save()).rejects.toThrow();
  });
});

