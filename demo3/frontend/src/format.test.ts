import { formatDate, formatDateHeure, formatEuros, formatKwh, formatMois, formatMoisCourt, formatMwh, formatPct, formatPrixUnitaire, formatTaux } from './format'
import { plain } from './test/plain'

describe('format', () => {
  it('formats kWh with French grouping and no decimals', () => {
    expect(plain(formatKwh(412380.4))).toBe('412 380 kWh')
  })

  it('formats MWh with one decimal', () => {
    expect(plain(formatMwh(2_412_380))).toBe('2 412,4 MWh')
  })

  it('formats euros as a French currency', () => {
    expect(plain(formatEuros(398120.5))).toBe('398 120,50 €')
  })

  it('keeps four decimals on unit prices', () => {
    expect(plain(formatPrixUnitaire(0.1842))).toBe('0,1842 €')
    expect(plain(formatPrixUnitaire(2.85))).toBe('2,85 €')
  })

  it('formats percentages with an explicit sign', () => {
    expect(formatPct(3.24)).toBe('+3,2 %')
    expect(formatPct(-1.8)).toBe('−1,8 %')
    expect(formatPct(0)).toBe('0,0 %')
  })

  it('formats a rate', () => {
    expect(formatTaux(0.2)).toBe('20 %')
  })

  it('formats a month in French', () => {
    expect(formatMois('2026-08')).toBe('août 2026')
    expect(formatMoisCourt('2026-03')).toBe('mars')
  })

  it('formats dates and date-times', () => {
    expect(formatDate('2026-08-03')).toBe('03/08/2026')
    expect(formatDateHeure('2026-08-03T14:05:00')).toBe('03/08/2026 14:05')
  })
})
