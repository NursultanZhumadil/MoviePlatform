import { GraphQLError } from 'graphql';
import { User } from '../models/User';
import { AuthContext } from '../types';
import { generateToken } from '../utils/auth';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export const userResolvers = {
  Query: {
    me: async (_: unknown, __: unknown, context: AuthContext) => {
      if (!context.user) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const user = await User.findById(context.user.id);
      if (!user) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };
    },
  },

  Mutation: {
    register: async (_: unknown, { input }: { input: unknown }) => {
      const validated = registerSchema.parse(input);

      const existingUser = await User.findOne({ email: validated.email });
      if (existingUser) {
        throw new GraphQLError('User already exists', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const user = new User({
        email: validated.email,
        password: validated.password,
        name: validated.name,
        role: 'User',
      });

      await user.save();

      const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      return {
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
      };
    },

    login: async (_: unknown, { input }: { input: unknown }) => {
      const validated = loginSchema.parse(input);

      const user = await User.findOne({ email: validated.email }).select('+password');
      if (!user) {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const isPasswordValid = await user.comparePassword(validated.password);
      if (!isPasswordValid) {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      return {
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
      };
    },
  },
};

