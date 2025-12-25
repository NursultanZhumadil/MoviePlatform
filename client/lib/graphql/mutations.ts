import { gql } from '@apollo/client';

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        name
        role
        avatar
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        name
        role
        avatar
      }
    }
  }
`;

export const CREATE_MOVIE = gql`
  mutation CreateMovie($input: CreateMovieInput!) {
    createMovie(input: $input) {
      id
      title
      description
      genre {
        id
        name
      }
      year
      director
      duration
      poster
      rating
    }
  }
`;

export const UPDATE_MOVIE = gql`
  mutation UpdateMovie($id: ID!, $input: UpdateMovieInput!) {
    updateMovie(id: $id, input: $input) {
      id
      title
      description
      genre {
        id
        name
      }
      year
      director
      duration
      poster
      rating
    }
  }
`;

export const DELETE_MOVIE = gql`
  mutation DeleteMovie($id: ID!) {
    deleteMovie(id: $id)
  }
`;

export const CREATE_REVIEW = gql`
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) {
      id
      movieId
      userId
      user {
        id
        name
        email
        avatar
      }
      rating
      comment
      createdAt
    }
  }
`;

export const DELETE_REVIEW = gql`
  mutation DeleteReview($id: ID!) {
    deleteReview(id: $id)
  }
`;

export const ADD_TO_FAVORITES = gql`
  mutation AddToFavorites($movieId: ID!) {
    addToFavorites(movieId: $movieId)
  }
`;

export const REMOVE_FROM_FAVORITES = gql`
  mutation RemoveFromFavorites($movieId: ID!) {
    removeFromFavorites(movieId: $movieId)
  }
`;

