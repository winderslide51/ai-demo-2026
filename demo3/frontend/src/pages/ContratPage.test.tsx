import { screen } from '@testing-library/react'
import { ApiError } from '../api/client'
import { getClient } from '../api/contrat'
import { clientFixture } from '../test/fixtures'
import { renderWithRouter } from '../test/render'
import { ContratPage } from './ContratPage'
import { plain } from '../test/plain'

vi.mock('../api/contrat')
const getClientMock = vi.mocked(getClient)

beforeEach(() => vi.resetAllMocks())

describe('ContratPage', () => {
  it('shows the contract and the tariff grid in French', async () => {
    getClientMock.mockResolvedValue(clientFixture)
    renderWithRouter(<ContratPage />)

    expect(await screen.findByText('Valmont Industries')).toBeInTheDocument()
    expect(screen.getByText('CTR-2025-04871')).toBeInTheDocument()
    expect(screen.getByText('Du 01/01/2025 au 31/12/2027')).toBeInTheDocument()
    expect(plain(screen.getByText('Énergie heures pleines').closest('tr')?.textContent)).toContain('0,1842 €')
    expect(plain(screen.getByText('TVA').closest('tr')?.textContent)).toContain('20 %')
    expect(screen.getByText('Du lundi au vendredi, de 6 h à 22 h.')).toBeInTheDocument()
  })

  it('shows the backend error', async () => {
    getClientMock.mockRejectedValue(new ApiError(500, 'Service indisponible.'))
    renderWithRouter(<ContratPage />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Service indisponible.')
  })
})
