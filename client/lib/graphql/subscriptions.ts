import { gql } from '@apollo/client';

export const MOVIE_ADDED_SUBSCRIPTION = gql`
  subscription MovieAdded {
    movieAdded {
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
      createdAt
    }
  }
`;

export const MOVIE_UPDATED_SUBSCRIPTION = gql`
  subscription MovieUpdated {
    movieUpdated {
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
      updatedAt
    }
  }
`;

export const REVIEW_ADDED_SUBSCRIPTION = gql`
  subscription ReviewAdded($movieId: ID!) {
    reviewAdded(movieId: $movieId) {
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

