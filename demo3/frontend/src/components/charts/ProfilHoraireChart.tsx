import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatHeure, formatKw } from '../../format'
import type { ProfilHoraire } from '../../types/dto'
import { axisStyle, chartColors, tooltipLabelStyle, tooltipStyle } from './chartTheme'

type Props = { profil: ProfilHoraire[]; heuresPleines?: { debut: number; fin: number } }

/** Average hourly load. Bars in peak hours are amber, off-peak hours teal. */
export function ProfilHoraireChart({ profil, heuresPleines = { debut: 6, fin: 22 } }: Props) {
  const hp = chartColors.hp()
  const hc = chartColors.hc()
  return (
    <div style={{ width: '100%', height: 180 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={profil} margin={{ top: 10, right: 8, bottom: 0, left: -8 }} barCategoryGap="20%">
          <XAxis dataKey="heure" tick={axisStyle} axisLine={false} tickLine={false} interval={2} tickFormatter={(h: number) => `${h}h`} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={60} />
          <Tooltip
            cursor={{ fill: 'rgb(11 23 48 / 5%)' }}
            contentStyle={tooltipStyle}
            labelStyle={tooltipLabelStyle}
            formatter={(value: number) => [formatKw(value), 'Puissance moyenne']}
            labelFormatter={(h: number) => formatHeure(h)}
          />
          <Bar dataKey="moyenneKw" radius={[3, 3, 0, 0]}>
            {profil.map((p) => (
              <Cell key={p.heure} fill={p.heure >= heuresPleines.debut && p.heure < heuresPleines.fin ? hp : hc} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
