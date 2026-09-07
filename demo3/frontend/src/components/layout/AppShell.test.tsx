import { screen } from '@testing-library/react'
import { listAlertes } from '../../api/alertes'
import { getClient } from '../../api/contrat'
import { getMois } from '../../api/mois'
import { listSites } from '../../api/sites'
import { getSynthese } from '../../api/synthese'
import { alerteCritique, clientFixture, moisFixture, siteLyon, syntheseFixture } from '../../test/fixtures'
import { renderApp } from '../../test/render'

vi.mock('../../api/alertes')
vi.mock('../../api/contrat')
vi.mock('../../api/mois')
vi.mock('../../api/sites')
vi.mock('../../api/synthese')

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(listAlertes).mockResolvedValue([alerteCritique])
  vi.mocked(getClient).mockResolvedValue(clientFixture)
  vi.mocked(getMois).mockResolvedValue(moisFixture)
  vi.mocked(listSites).mockResolvedValue([siteLyon])
  vi.mocked(getSynthese).mockResolvedValue(syntheseFixture)
})

describe('AppShell', () => {
  it('shows the brand, the client, the alert count and the page title', async () => {
    renderApp('/')
    expect(await screen.findByText('Valmont Industries')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Tableau de bord' })).toBeInTheDocument()
    expect(await screen.findByRole('status')).toHaveTextContent('1 alerte active')
  })

  it('changes the month in the URL and keeps it while navigating', async () => {
    const { user } = renderApp('/sites')
    const picker = await screen.findByLabelText('Mois')
    expect(picker).toHaveValue('2026-08')

    await user.selectOptions(picker, '2026-06')
    expect(screen.getByTestId('location')).toHaveTextContent('/sites?mois=2026-06')
    expect(vi.mocked(listSites)).toHaveBeenLastCalledWith('2026-06')

    await user.click(screen.getByRole('link', { name: /Alertes/ }))
    expect(screen.getByTestId('location')).toHaveTextContent('/alertes?mois=2026-06')
    expect(screen.getByRole('heading', { level: 1, name: 'Alertes' })).toBeInTheDocument()
  })

  it('renders the not-found page', async () => {
    renderApp('/nulle-part')
    expect(await screen.findByRole('link', { name: "Retour à l'accueil" })).toBeInTheDocument()
  })
})
