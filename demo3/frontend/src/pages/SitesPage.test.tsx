import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router'
import { ApiError } from '../api/client'
import { listSites } from '../api/sites'
import { siteLille, siteLyon } from '../test/fixtures'
import { renderWithRouter } from '../test/render'
import { SitesPage } from './SitesPage'

vi.mock('../api/sites')
const listSitesMock = vi.mocked(listSites)

beforeEach(() => vi.resetAllMocks())

describe('SitesPage', () => {
  it('lists the sites with their overage in red and navigates on row click', async () => {
    listSitesMock.mockResolvedValue([siteLyon, siteLille])
    const { user } = renderWithRouter(
      <Routes>
        <Route path="/sites" element={<SitesPage />} />
        <Route path="/sites/:id" element={<p>Détail LYO</p>} />
      </Routes>,
      { path: '/*', route: '/sites?mois=2026-08' },
    )

    expect(await screen.findByText('Usine de Vénissieux')).toBeInTheDocument()
    expect(screen.getByText(/^Entrepôt ·/)).toBeInTheDocument()
    expect(screen.getByText(/3 240 kWh/)).toHaveClass('overage')
    expect(screen.getByRole('meter', { name: /Usine de Vénissieux/ })).toHaveAttribute('aria-valuenow', '1180')

    await user.click(screen.getByRole('link', { name: /Ouvrir la fiche du site Usine de Vénissieux/ }))
    expect(await screen.findByText('Détail LYO')).toBeInTheDocument()
  })

  it('shows the empty message', async () => {
    listSitesMock.mockResolvedValue([])
    renderWithRouter(<SitesPage />)
    expect(await screen.findByText('Aucun site pour ce mois.')).toBeInTheDocument()
  })

  it('shows the backend error', async () => {
    listSitesMock.mockRejectedValue(new ApiError(400, 'Mois invalide.'))
    renderWithRouter(<SitesPage />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Mois invalide.')
  })
})
