import type { Annonce } from '../../api/annonces'

/** Shared test fixture for the listing tests. */
export function annonceFixture(overrides: Partial<Annonce> = {}): Annonce {
  return {
    id: '6f1c2c4e-8a1d-4f0e-9b3a-1d2e3f4a5b6c',
    title: 'Vélo de course',
    category: 'LOISIRS',
    description: 'Vélo de course en très bon état, peu servi.',
    price: 1250,
    city: 'Lyon',
    postalCode: '69003',
    createdAt: '2026-09-22T10:00:00Z',
    ...overrides,
  }
}
