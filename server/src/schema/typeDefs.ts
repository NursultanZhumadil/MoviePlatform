import gql from 'graphql-tag';

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String!
    role: UserRole!
    avatar: String
    createdAt: String!
    updatedAt: String!
  }

  type Genre {
    id: ID!
    name: String!
    description: String!
    movies: [Movie!]!
    createdAt: String!
    updatedAt: String!
  }

  type Movie {
    id: ID!
    title: String!
    description: String!
    genre: Genre
    year: Int!
    director: String!
    duration: Int!
    poster: String!
    rating: Float!
    trailerUrl: String
    createdAt: String!
    updatedAt: String!
  }

  type Review {
    id: ID!
    movieId: ID!
    movie: Movie!
    userId: ID!
    user: User!
    rating: Int!
    comment: String!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  enum UserRole {
    Admin
    User
  }

  input RegisterInput {
    email: String!
    password: String!
    name: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input CreateMovieInput {
    title: String!
    description: String!
    genreId: ID!
    year: Int!
    director: String!
    duration: Int!
    poster: String!
    trailerUrl: String
  }

  input UpdateMovieInput {
    title: String
    description: String
    genreId: ID
    year: Int
    director: String
    duration: Int
    poster: String
    trailerUrl: String
  }

  input CreateReviewInput {
    movieId: ID!
    rating: Int!
    comment: String!
  }

  type Query {
    me: User
    movies(genreId: ID, limit: Int, offset: Int): [Movie!]!
    movie(id: ID!): Movie
    reviews(movieId: ID!): [Review!]!
    genres: [Genre!]!
    searchMovies(query: String!): [Movie!]!
    favorites: [Movie!]!
    isFavorite(movieId: ID!): Boolean!
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    createMovie(input: CreateMovieInput!): Movie!
    updateMovie(id: ID!, input: UpdateMovieInput!): Movie!
    deleteMovie(id: ID!): Boolean!
    createReview(input: CreateReviewInput!): Review!
    deleteReview(id: ID!): Boolean!
    addToFavorites(movieId: ID!): Boolean!
    removeFromFavorites(movieId: ID!): Boolean!
  }

  type Subscription {
    movieAdded: Movie!
    movieUpdated: Movie!
    reviewAdded(movieId: ID!): Review!
  }
`;

