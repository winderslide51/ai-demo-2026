import { render, screen } from '@testing-library/react'
import { AnnonceTile } from './AnnonceTile'
import { annonceFixture } from './fixtures'

test('shows title, formatted price, category label, location and date', () => {
  render(<AnnonceTile annonce={annonceFixture()} />)

  expect(screen.getByRole('heading', { level: 3, name: 'Vélo de course' })).toBeInTheDocument()
  expect(screen.getByText('1 250 €'.replace(/ | /g, ' '))).toBeInTheDocument()
  expect(screen.getByText('Loisirs')).toBeInTheDocument()
  expect(screen.queryByText('LOISIRS')).not.toBeInTheDocument()
  expect(screen.getByText('Lyon (69003)')).toBeInTheDocument()
})

test('exposes the raw ISO date on a <time> element', () => {
  const { container } = render(<AnnonceTile annonce={annonceFixture()} />)
  expect(container.querySelector('time')).toHaveAttribute('datetime', '2026-09-22T10:00:00Z')
})

test('is not clickable', () => {
  render(<AnnonceTile annonce={annonceFixture()} />)
  expect(screen.queryByRole('link')).not.toBeInTheDocument()
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})
