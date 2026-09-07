import { acquitterAlerte, listAlertes } from './alertes'
import * as client from './client'
import { getClient } from './contrat'
import { getMois } from './mois'
import { getConsommation, getFacture, getSite, listSites } from './sites'
import { getSynthese } from './synthese'

describe('api modules build the right paths', () => {
  const spy = vi.spyOn(client, 'apiFetch').mockResolvedValue(undefined)

  beforeEach(() => spy.mockClear())

  it('synthese', async () => {
    await getSynthese('2026-08')
    expect(spy).toHaveBeenCalledWith('/synthese?mois=2026-08')
  })

  it('sites', async () => {
    await listSites()
    await getSite('LYO-01', '2026-07')
    await getConsommation('LYO-01')
    await getFacture('LYO-01', '2026-08')
    expect(spy.mock.calls.map((c) => c[0])).toEqual(['/sites', '/sites/LYO-01?mois=2026-07', '/sites/LYO-01/consommation', '/sites/LYO-01/facture?mois=2026-08'])
  })

  it('alertes', async () => {
    await listAlertes({ mois: '2026-08', acquittee: false })
    await acquitterAlerte('LYO-01-2026-08-DEPASSEMENT_PUISSANCE')
    expect(spy).toHaveBeenNthCalledWith(1, '/alertes?mois=2026-08&acquittee=false')
    expect(spy).toHaveBeenNthCalledWith(2, '/alertes/LYO-01-2026-08-DEPASSEMENT_PUISSANCE/acquitter', { method: 'POST' })
  })

  it('client and mois', async () => {
    await getClient()
    await getMois()
    expect(spy.mock.calls.map((c) => c[0])).toEqual(['/client', '/mois'])
  })
})
