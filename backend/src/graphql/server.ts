import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { useServer } from 'graphql-ws/lib/use/ws'
import { WebSocketServer } from 'ws'
import { typeDefs } from './schema'
import { resolvers } from './resolvers'
import type { Application } from 'express'
import type { Server } from 'http'
import type { GraphQLContext } from './types/context'

export async function createGraphQLServer(app: Application, httpServer: Server) {
  const schema = makeExecutableSchema({ typeDefs, resolvers })

  // WebSocket server for subscriptions
  const wsServer = new WebSocketServer({ server: httpServer, path: '/graphql' })
  const serverCleanup = useServer({ schema }, wsServer)

  const apolloServer = new ApolloServer<GraphQLContext>({
    schema,
    plugins: [
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose()
            },
          }
        },
      },
    ],
  })

  await apolloServer.start()

  app.use(
    '/graphql',
    expressMiddleware(apolloServer, {
      context: async ({ req }) => ({
        walletAddress: (req as any).user?.walletAddress,
        userId: (req as any).user?.publicKey,
      }),
    })
  )

  return apolloServer
}
