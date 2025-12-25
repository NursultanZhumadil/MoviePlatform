import { gql } from '@apollo/client';

export const GET_ME = gql`
  query Me {
    me {
      id
      email
      name
      role
      avatar
    }
  }
`;

export const GET_MOVIES = gql`
  query Movies($genreId: ID, $limit: Int, $offset: Int) {
    movies(genreId: $genreId, limit: $limit, offset: $offset) {
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

export const GET_MOVIE = gql`
  query Movie($id: ID!) {
    movie(id: $id) {
      id
      title
      description
      genre {
        id
        name
        description
      }
      year
      director
      duration
      trailerUrl
      poster
      rating
      createdAt
    }
  }
`;

export const GET_REVIEWS = gql`
  query Reviews($movieId: ID!) {
    reviews(movieId: $movieId) {
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

export const GET_GENRES = gql`
  query Genres {
    genres {
      id
      name
      description
      movies {
        id
        title
        poster
        rating
      }
    }
  }
`;

export const SEARCH_MOVIES = gql`
  query SearchMovies($query: String!) {
    searchMovies(query: $query) {
      id
      title
      description
      genre {
        id
        name
      }
      year
      director
      poster
      rating
    }
  }
`;

export const GET_FAVORITES = gql`
  query Favorites {
    favorites {
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

export const IS_FAVORITE = gql`
  query IsFavorite($movieId: ID!) {
    isFavorite(movieId: $movieId)
  }
`;

