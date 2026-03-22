import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, fetch } from '@nuxt/test-utils/e2e'

describe('ssr', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  })

  it('renders the index page', async () => {
    const response = await fetch('/')
    const html = await response.text()

    expect(html).toContain('<div>basic</div>')
  })

  it('does not emit consent cookies during the initial SSR response', async () => {
    const response = await fetch('/')

    expect(response.headers.get('set-cookie')).toBeNull()
  })
})
