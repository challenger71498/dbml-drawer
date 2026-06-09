import { describe, expect, it } from 'vitest'
import { buildApp } from './app.js'

describe('backend app', () => {
  it('responds to health checks', async () => {
    const app = buildApp({ logger: false })

    const response = await app.inject({
      method: 'GET',
      url: '/health',
    })

    await app.close()

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({
      service: 'dbml-drawer-backend',
      status: 'healthy',
    })
  })
})
