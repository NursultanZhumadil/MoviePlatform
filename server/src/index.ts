import express from 'express';
import { createServer } from 'http';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import cors from 'cors';
import { config } from './utils/config';
import { connectDB } from './utils/db';
import { typeDefs } from './schema/typeDefs';
import { resolvers } from './resolvers';
import { createContext } from './middleware/auth';

const app = express();
const httpServer = createServer(app);

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// WebSocket Server for Subscriptions
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

const serverCleanup = useServer(
  {
    schema,
    context: async (ctx) => {
      return await createContext({ req: ctx.extra.request as any });
    },
  },
  wsServer
);

// Apollo Server
const server = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

const startServer = async () => {
  await connectDB();
  await server.start();

  app.use(
    '/graphql',
    cors<cors.CorsRequest>({
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
    }),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => createContext({ req }),
    })
  );

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const port = config.port;

  httpServer.listen(port, () => {
    console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
    console.log(`🔌 WebSocket ready at ws://localhost:${port}/graphql`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

