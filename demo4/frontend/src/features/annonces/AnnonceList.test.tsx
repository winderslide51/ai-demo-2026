import { render, screen } from '@testing-library/react'
import { AnnonceList } from './AnnonceList'
import { annonceFixture } from './fixtures'

test('renders one list item per annonce, in the order received', () => {
  render(
    <AnnonceList
      annonces={[
        annonceFixture({ id: '1', title: 'Guitare folk' }),
        annonceFixture({ id: '2', title: 'Tondeuse thermique' }),
        annonceFixture({ id: '3', title: 'Canapé 3 places' }),
      ]}
    />,
  )

  const items = screen.getAllByRole('listitem')
  expect(items).toHaveLength(3)
  expect(items.map((item) => item.querySelector('h3')?.textContent)).toEqual([
    'Guitare folk',
    'Tondeuse thermique',
    'Canapé 3 places',
  ])
})

test('renders an empty list without crashing', () => {
  render(<AnnonceList annonces={[]} />)
  expect(screen.queryAllByRole('listitem')).toHaveLength(0)
})
