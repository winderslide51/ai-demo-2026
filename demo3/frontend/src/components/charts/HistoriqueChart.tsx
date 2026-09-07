import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatEuros, formatMoisCourt, formatMwh } from '../../format'
import type { Synthese } from '../../types/dto'
import { axisStyle, chartColors, tooltipLabelStyle, tooltipStyle } from './chartTheme'

type Props = { historique: Synthese['historique'] }

export function HistoriqueChart({ historique }: Props) {
  const data = historique.map((h) => ({ ...h, mwh: h.consommationKwh / 1000, label: formatMoisCourt(h.mois) }))
  const ink = chartColors.ink()
  return (
    <div style={{ width: '100%', height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: -12 }}>
          <defs>
            <linearGradient id="historiqueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ink} stopOpacity={0.28} />
              <stop offset="100%" stopColor={ink} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={chartColors.line()} />
          <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={56} tickFormatter={(v: number) => `${v.toFixed(0)}`} />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={tooltipLabelStyle}
            formatter={(value: number, name: string) =>
              name === 'mwh' ? [formatMwh(value * 1000), 'Consommation'] : [formatEuros(value), 'Montant HT']
            }
            labelFormatter={(label: string) => label}
          />
          <Area type="monotone" dataKey="mwh" stroke={ink} strokeWidth={2} fill="url(#historiqueFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
