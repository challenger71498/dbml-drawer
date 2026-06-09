import Fastify, { type FastifyServerOptions } from 'fastify'

export function buildApp(options: FastifyServerOptions = {}) {
  const app = Fastify({
    logger: true,
    ...options,
  })

  app.get('/health', () => ({
    service: 'dbml-drawer-backend',
    status: 'healthy',
  }))

  return app
}
