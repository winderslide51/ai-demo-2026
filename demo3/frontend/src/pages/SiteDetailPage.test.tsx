import { screen, within } from '@testing-library/react'
import { acquitterAlerte } from '../api/alertes'
import { ApiError } from '../api/client'
import { getSite } from '../api/sites'
import { alerteCritique, siteDetailLyon } from '../test/fixtures'
import { renderWithRouter } from '../test/render'
import { SiteDetailPage } from './SiteDetailPage'
import { plain } from '../test/plain'

vi.mock('../api/sites')
vi.mock('../api/alertes')
const getSiteMock = vi.mocked(getSite)
const acquitterMock = vi.mocked(acquitterAlerte)

beforeEach(() => vi.resetAllMocks())

describe('SiteDetailPage', () => {
  it('shows the site, its invoice with the penalty line and its alerts', async () => {
    getSiteMock.mockResolvedValue(siteDetailLyon)
    renderWithRouter(<SiteDetailPage />, { path: '/sites/:id', route: '/sites/LYO-01?mois=2026-08' })

    expect(await screen.findByRole('heading', { name: 'Usine de Vénissieux' })).toBeInTheDocument()
    expect(getSiteMock).toHaveBeenCalledWith('LYO-01', '2026-08')
    expect(screen.getByText('Camille Roux')).toBeInTheDocument()

    const facture = screen.getByRole('table', { name: 'Facture du mois' })
    const rows = within(facture).getAllByRole('row')
    expect(rows).toHaveLength(1 + 5 + 3)
    expect(plain(within(facture).getByText('Pénalité de dépassement').closest('tr')?.textContent)).toContain('3 078,00 €')
    expect(plain(within(facture).getByText('Total TTC').closest('tr')?.textContent)).toContain('143 367,84 €')

    expect(screen.getByText('Dépassement de puissance')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Acquitter' })).toBeInTheDocument()
  })

  it('acknowledges an alert from the site page', async () => {
    getSiteMock.mockResolvedValue(siteDetailLyon)
    acquitterMock.mockResolvedValue({ ...alerteCritique, acquittee: true })
    const { user } = renderWithRouter(<SiteDetailPage />, { path: '/sites/:id', route: '/sites/LYO-01' })

    await user.click(await screen.findByRole('button', { name: 'Acquitter' }))
    expect(acquitterMock).toHaveBeenCalledWith(alerteCritique.id)
    expect(await screen.findByText('Alerte acquittée.')).toBeInTheDocument()
    expect(getSiteMock).toHaveBeenCalledTimes(2)
  })

  it('shows an empty alert state', async () => {
    getSiteMock.mockResolvedValue({ ...siteDetailLyon, alertes: [], depassementKwh: 0, nbAlertesActives: 0 })
    renderWithRouter(<SiteDetailPage />, { path: '/sites/:id', route: '/sites/LYO-01' })
    expect(await screen.findByText('Aucune alerte pour ce site ce mois-ci.')).toBeInTheDocument()
  })

  it('shows the 404 message from the backend', async () => {
    getSiteMock.mockRejectedValue(new ApiError(404, 'Site inconnu : XXX-99.'))
    renderWithRouter(<SiteDetailPage />, { path: '/sites/:id', route: '/sites/XXX-99' })
    expect(await screen.findByRole('alert')).toHaveTextContent('Site inconnu : XXX-99.')
  })
})
