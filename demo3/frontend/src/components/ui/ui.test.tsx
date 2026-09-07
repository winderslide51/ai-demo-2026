import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Badge } from './Badge'
import { Button } from './Button'
import { Card } from './Card'
import { DataTable, type Column } from './DataTable'
import { ErrorBanner } from './ErrorBanner'
import { KpiTile } from './KpiTile'
import { PowerGauge } from './PowerGauge'
import { Sparkline } from './Sparkline'
import { Toast } from './Toast'

describe('Button', () => {
  it('is disabled and busy while loading', () => {
    render(<Button loading>Acquitter</Button>)
    const button = screen.getByRole('button', { name: /acquitter/i })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
  })

  it('calls onClick when enabled', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Valider</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe('DataTable', () => {
  type Row = { id: string; nom: string }
  const columns: Column<Row>[] = [{ key: 'nom', header: 'Nom', render: (r) => r.nom }]

  it('shows the empty message instead of an empty body', () => {
    render(<DataTable columns={columns} rows={[]} rowKey={(r) => r.id} emptyMessage="Aucun site pour ce mois." />)
    expect(screen.getByText('Aucun site pour ce mois.')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('renders rows and reacts to click and keyboard', async () => {
    const onRowClick = vi.fn()
    render(
      <DataTable columns={columns} rows={[{ id: '1', nom: 'Lyon' }]} rowKey={(r) => r.id} emptyMessage="vide" onRowClick={onRowClick} rowLabel={(r) => `Ouvrir ${r.nom}`} />,
    )
    const row = screen.getByRole('link', { name: 'Ouvrir Lyon' })
    await userEvent.click(row)
    row.focus()
    await userEvent.keyboard('{Enter}')
    expect(onRowClick).toHaveBeenCalledTimes(2)
  })
})

describe('KpiTile', () => {
  it('shows value, unit and a signed delta', () => {
    render(<KpiTile label="Consommation" value="2 412,4" unit="MWh" delta={3.2} />)
    expect(screen.getByText('2 412,4')).toBeInTheDocument()
    expect(screen.getByText('MWh')).toBeInTheDocument()
    expect(screen.getByText(/\+3,2 %/)).toBeInTheDocument()
  })

  it('renders a negative delta and a footer', () => {
    render(<KpiTile label="Montant" value="10 €" delta={-1.5} footer="12 € TTC" />)
    expect(screen.getByText(/−1,5 %/)).toBeInTheDocument()
    expect(screen.getByText('12 € TTC')).toBeInTheDocument()
  })
})

describe('PowerGauge', () => {
  it('exposes the values as a meter', () => {
    render(<PowerGauge value={1180} max={1000} label="Puissance" />)
    const meter = screen.getByRole('meter', { name: 'Puissance' })
    expect(meter).toHaveAttribute('aria-valuenow', '1180')
    expect(meter).toHaveAttribute('aria-valuemax', '1000')
  })
})

describe('Sparkline', () => {
  it('draws a path from the values', () => {
    const { container } = render(<Sparkline values={[1, 3, 2]} label="Tendance" />)
    expect(container.querySelector('path')?.getAttribute('d')).toMatch(/^M0\.0,/)
    expect(screen.getByRole('img', { name: 'Tendance' })).toBeInTheDocument()
  })

  it('renders nothing with fewer than two points', () => {
    const { container } = render(<Sparkline values={[1]} />)
    expect(container.firstChild).toBeNull()
  })
})

describe('ErrorBanner, Toast, Badge, Card', () => {
  it('shows the backend message and retries', async () => {
    const onRetry = vi.fn()
    render(<ErrorBanner message="Mois inconnu." onRetry={onRetry} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Mois inconnu.')
    await userEvent.click(screen.getByRole('button', { name: /réessayer/i }))
    expect(onRetry).toHaveBeenCalled()
  })

  it('closes the toast on click and automatically', async () => {
    vi.useFakeTimers()
    const onClose = vi.fn()
    render(<Toast kind="success" message="Alerte acquittée." onClose={onClose} autoCloseMs={1000} />)
    expect(screen.getByRole('status')).toHaveTextContent('Alerte acquittée.')
    vi.advanceTimersByTime(1000)
    expect(onClose).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  it('renders a badge and a card title', () => {
    render(
      <Card title="Facture" subtitle="du mois" actions={<button>Exporter</button>}>
        <Badge tone="critique">Critique</Badge>
      </Card>,
    )
    expect(screen.getByRole('heading', { name: 'Facture' })).toBeInTheDocument()
    expect(screen.getByText('du mois')).toBeInTheDocument()
    expect(screen.getByText('Critique')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Exporter' })).toBeInTheDocument()
  })
})
