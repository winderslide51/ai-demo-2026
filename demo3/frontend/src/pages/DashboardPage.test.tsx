import { screen } from '@testing-library/react'
import { listAlertes } from '../api/alertes'
import { ApiError } from '../api/client'
import { getSynthese } from '../api/synthese'
import { alerteCritique, alerteInfo, syntheseFixture } from '../test/fixtures'
import { renderWithRouter } from '../test/render'
import { DashboardPage } from './DashboardPage'

vi.mock('../api/synthese')
vi.mock('../api/alertes')

const getSyntheseMock = vi.mocked(getSynthese)
const listAlertesMock = vi.mocked(listAlertes)

beforeEach(() => {
  vi.resetAllMocks()
  listAlertesMock.mockResolvedValue([alerteCritique, alerteInfo])
})

describe('DashboardPage', () => {
  it('shows the KPIs, the top sites and the critical alerts', async () => {
    getSyntheseMock.mockResolvedValue(syntheseFixture)
    renderWithRouter(<DashboardPage />, { route: '/?mois=2026-08' })

    expect(await screen.findByText('Consommation du parc')).toBeInTheDocument()
    expect(screen.getByText('2 412,4')).toBeInTheDocument()
    expect(screen.getByText(/\+3,2 %/)).toBeInTheDocument()
    // the site is linked from the top-5 list and from the critical alerts, both keep the month
    const links = screen.getAllByRole('link', { name: 'Usine de Vénissieux' })
    expect(links).toHaveLength(2)
    links.forEach((link) => expect(link).toHaveAttribute('href', '/sites/LYO-01?mois=2026-08'))
    // only the CRITIQUE alert is listed, the INFO one is not
    expect(screen.getByText('Dépassement de puissance')).toBeInTheDocument()
    expect(screen.queryByText('Anomalie nocturne')).not.toBeInTheDocument()
    expect(getSyntheseMock).toHaveBeenCalledWith('2026-08')
  })

  it('shows an empty state when there is no critical alert', async () => {
    getSyntheseMock.mockResolvedValue({ ...syntheseFixture, penalitesHt: 0, nbAlertesActives: 0 })
    listAlertesMock.mockResolvedValue([])
    renderWithRouter(<DashboardPage />)
    expect(await screen.findByText('Aucune alerte critique ce mois-ci.')).toBeInTheDocument()
  })

  it('shows the backend error message', async () => {
    getSyntheseMock.mockRejectedValue(new ApiError(400, 'Mois inconnu : 2027-01.'))
    renderWithRouter(<DashboardPage />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Mois inconnu : 2027-01.')
  })

  it('shows the alerts error inside the card', async () => {
    getSyntheseMock.mockResolvedValue(syntheseFixture)
    listAlertesMock.mockRejectedValue(new ApiError(500, 'Service indisponible.'))
    renderWithRouter(<DashboardPage />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Service indisponible.')
  })
})
