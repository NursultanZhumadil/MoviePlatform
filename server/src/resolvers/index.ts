import { userResolvers } from './user';
import { movieResolvers } from './movie';
import { reviewResolvers } from './review';
import { genreResolvers } from './genre';
import { favoriteResolvers } from './favorite';

export const resolvers = [
  userResolvers,
  movieResolvers,
  reviewResolvers,
  genreResolvers,
  favoriteResolvers,
];

