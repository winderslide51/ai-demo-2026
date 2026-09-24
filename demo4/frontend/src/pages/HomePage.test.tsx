import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { annonceFixture } from '../features/annonces/fixtures'
import { renderApp } from '../test/renderWithRouter'
import { EMPTY_MESSAGE, LOAD_ERROR_MESSAGE, LOADING_MESSAGE } from './HomePage'

function jsonResponse(status: number, body: unknown, contentType = 'application/json') {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': contentType } })
}

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

test('lists the annonces returned by the API', async () => {
  fetchMock.mockResolvedValueOnce(
    jsonResponse(200, [
      annonceFixture({ id: '1', title: 'Guitare folk' }),
      annonceFixture({ id: '2', title: 'Tondeuse thermique' }),
    ]),
  )
  renderApp('/')

  expect(await screen.findByRole('heading', { level: 1, name: 'Annonces récentes' })).toBeInTheDocument()
  expect(await screen.findByRole('heading', { level: 3, name: 'Guitare folk' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { level: 3, name: 'Tondeuse thermique' })).toBeInTheDocument()
  expect(fetchMock.mock.calls[0][0]).toBe('/api/annonces')
})

test('shows the loading state while the request is pending', async () => {
  fetchMock.mockReturnValueOnce(new Promise(() => {}))
  renderApp('/')

  expect(await screen.findByRole('status')).toHaveTextContent(LOADING_MESSAGE)
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

test('invites the user to post when there is no annonce', async () => {
  fetchMock.mockResolvedValueOnce(jsonResponse(200, []))
  renderApp('/')

  expect(await screen.findByText(EMPTY_MESSAGE)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Déposer la première annonce' })).toHaveAttribute('href', '/deposer')
  expect(screen.queryAllByRole('listitem')).toHaveLength(0)
})

test('shows an error with a retry that reloads the list', async () => {
  const user = userEvent.setup()
  fetchMock
    .mockResolvedValueOnce(jsonResponse(500, { status: 500, title: 'Erreur' }, 'application/problem+json'))
    .mockResolvedValueOnce(jsonResponse(200, [annonceFixture({ id: '1', title: 'Guitare folk' })]))
  renderApp('/')

  expect(await screen.findByRole('alert')).toHaveTextContent(LOAD_ERROR_MESSAGE)

  await user.click(screen.getByRole('button', { name: 'Réessayer' }))

  expect(await screen.findByRole('heading', { level: 3, name: 'Guitare folk' })).toBeInTheDocument()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(fetchMock).toHaveBeenCalledTimes(2)
})

test('a network failure shows the same error state', async () => {
  fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))
  renderApp('/')

  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(LOAD_ERROR_MESSAGE))
})
