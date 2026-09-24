import { screen } from '@testing-library/react'
import { renderApp } from './test/renderWithRouter'

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('[]', { headers: { 'Content-Type': 'application/json' } })))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

test('renders the home page inside the layout', async () => {
  renderApp('/')
  expect(await screen.findByRole('heading', { level: 1, name: 'Annonces récentes' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'leboncoin, accueil' })).toBeInTheDocument()
})
