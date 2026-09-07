import { screen, within } from '@testing-library/react'
import { acquitterAlerte, listAlertes } from '../api/alertes'
import { ApiError } from '../api/client'
import { listSites } from '../api/sites'
import { alerteCritique, alerteInfo, siteLille, siteLyon } from '../test/fixtures'
import { renderWithRouter } from '../test/render'
import { AlertesPage } from './AlertesPage'

vi.mock('../api/alertes')
vi.mock('../api/sites')
const listAlertesMock = vi.mocked(listAlertes)
const acquitterMock = vi.mocked(acquitterAlerte)
const listSitesMock = vi.mocked(listSites)

beforeEach(() => {
  vi.resetAllMocks()
  listSitesMock.mockResolvedValue([siteLyon, siteLille])
})

describe('AlertesPage', () => {
  it('lists active alerts for the month with their severity and site link', async () => {
    listAlertesMock.mockResolvedValue([alerteCritique, alerteInfo])
    renderWithRouter(<AlertesPage />, { path: '/alertes', route: '/alertes?mois=2026-08' })

    expect(await screen.findByText('Dépassement de puissance')).toBeInTheDocument()
    const [first] = screen.getAllByRole('article')
    expect(within(first).getByText('Critique')).toBeInTheDocument()
    expect(within(first).getByRole('link', { name: 'Usine de Vénissieux' })).toHaveAttribute('href', '/sites/LYO-01?mois=2026-08')
    expect(listAlertesMock).toHaveBeenCalledWith({ mois: '2026-08', siteId: undefined, acquittee: false })
  })

  it('filters by severity locally and by site through the API', async () => {
    listAlertesMock.mockResolvedValue([alerteCritique, alerteInfo])
    const { user } = renderWithRouter(<AlertesPage />)
    await screen.findByText('Anomalie nocturne')

    await user.selectOptions(screen.getByLabelText('Sévérité'), 'CRITIQUE')
    expect(screen.queryByText('Anomalie nocturne')).not.toBeInTheDocument()
    expect(screen.getByText('Dépassement de puissance')).toBeInTheDocument()

    await user.selectOptions(await screen.findByLabelText('Site'), 'LIL-02')
    expect(listAlertesMock).toHaveBeenLastCalledWith({ mois: undefined, siteId: 'LIL-02', acquittee: false })

    await user.click(screen.getByLabelText('Afficher les acquittées'))
    expect(listAlertesMock).toHaveBeenLastCalledWith({ mois: undefined, siteId: 'LIL-02', acquittee: undefined })
  })

  it('acknowledges an alert and shows a success toast', async () => {
    listAlertesMock.mockResolvedValue([alerteCritique])
    acquitterMock.mockResolvedValue({ ...alerteCritique, acquittee: true })
    const { user } = renderWithRouter(<AlertesPage />)

    await user.click(await screen.findByRole('button', { name: 'Acquitter' }))
    expect(acquitterMock).toHaveBeenCalledWith(alerteCritique.id)
    expect(await screen.findByText('Alerte acquittée.')).toBeInTheDocument()
    expect(listAlertesMock).toHaveBeenCalledTimes(2)
  })

  it('shows the backend 409 message as is', async () => {
    listAlertesMock.mockResolvedValue([alerteCritique])
    acquitterMock.mockRejectedValue(new ApiError(409, 'Cette alerte est déjà acquittée.'))
    const { user } = renderWithRouter(<AlertesPage />)

    await user.click(await screen.findByRole('button', { name: 'Acquitter' }))
    expect(await screen.findByText('Cette alerte est déjà acquittée.')).toBeInTheDocument()
  })

  it('shows the empty state', async () => {
    listAlertesMock.mockResolvedValue([])
    renderWithRouter(<AlertesPage />)
    expect(await screen.findByText('Aucune alerte pour ce mois.')).toBeInTheDocument()
  })

  it('shows the backend error', async () => {
    listAlertesMock.mockRejectedValue(new ApiError(404, 'Site inconnu : ZZZ.'))
    renderWithRouter(<AlertesPage />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Site inconnu : ZZZ.')
  })
})
