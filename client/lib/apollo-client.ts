import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  split,
  from,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

const graphqlUrl =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql';

const httpLink = createHttpLink({
  uri: graphqlUrl,
});

const authLink = setContext((_, { headers }) => {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('token')
      : null;

  return {
    headers: {
      ...headers,
      // ✅ ВОТ ЗДЕСЬ БЫЛА ОШИБКА
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const wsLink =
  typeof window !== 'undefined'
    ? new GraphQLWsLink(
        createClient({
          url:
            process.env.NEXT_PUBLIC_WS_URL ||
            'ws://localhost:4000/graphql',
          connectionParams: () => {
            const token = localStorage.getItem('token');
            return {
              Authorization: token ? `Bearer ${token}` : '',
            };
          },
        })
      )
    : null;

const splitLink =
  typeof window !== 'undefined' && wsLink
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
          );
        },
        wsLink,
        from([authLink, httpLink])
      )
    : from([authLink, httpLink]);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
