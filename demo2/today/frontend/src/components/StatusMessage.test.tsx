import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { StatusMessage } from './StatusMessage';

describe('StatusMessage', () => {
  it('renders the title and the description', () => {
    render(<StatusMessage tone="success" title="API disponible" description="Service : cra-api" />);

    expect(screen.getByText('API disponible')).toBeInTheDocument();
    expect(screen.getByText('Service : cra-api')).toBeInTheDocument();
  });

  it('renders the action button only when provided', () => {
    const { rerender } = render(<StatusMessage tone="pending" title="Chargement…" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    const onClick = vi.fn();
    rerender(<StatusMessage tone="danger" title="API indisponible" action={{ label: 'Réessayer', onClick }} />);
    expect(screen.getByRole('button', { name: 'Réessayer' })).toBeInTheDocument();
  });

  it('calls the action handler when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<StatusMessage tone="danger" title="API indisponible" action={{ label: 'Réessayer', onClick }} />);

    await user.click(screen.getByRole('button', { name: 'Réessayer' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('exposes role="alert" for the danger tone', () => {
    render(<StatusMessage tone="danger" title="API indisponible" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('exposes role="status" for the pending and success tones', () => {
    const { rerender } = render(<StatusMessage tone="pending" title="Chargement…" />);
    expect(screen.getByRole('status')).toBeInTheDocument();

    rerender(<StatusMessage tone="success" title="API disponible" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
