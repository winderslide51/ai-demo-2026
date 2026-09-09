import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HealthPage } from './HealthPage';
import { fetchHealth } from '../api/health';
import { ApiError } from '../api/client';

vi.mock('../api/health');

const fetchHealthMock = vi.mocked(fetchHealth);

describe('HealthPage', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("shows the pending message while the request is loading", () => {
    fetchHealthMock.mockReturnValue(new Promise(() => {}));

    render(<HealthPage />);

    expect(screen.getByText("Vérification de l'état de l'API…")).toBeInTheDocument();
  });

  it('shows the service and the version on success', async () => {
    fetchHealthMock.mockResolvedValue({ status: 'ok', service: 'cra-api', apiVersion: '0.1.0' });

    render(<HealthPage />);

    expect(await screen.findByText('API disponible')).toBeInTheDocument();
    expect(screen.getByText('Service : cra-api')).toBeInTheDocument();
    expect(screen.getByText('Version : 0.1.0')).toBeInTheDocument();
  });

  it('shows the French detail and a retry button on error', async () => {
    fetchHealthMock.mockRejectedValue(new ApiError(0, 'Impossible de contacter le serveur.'));

    render(<HealthPage />);

    expect(await screen.findByText('API indisponible')).toBeInTheDocument();
    expect(screen.getByText('Impossible de contacter le serveur.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Réessayer' })).toBeInTheDocument();
  });

  it('refetches and reaches the success state when clicking Réessayer', async () => {
    const user = userEvent.setup();
    fetchHealthMock.mockRejectedValueOnce(new ApiError(0, 'Impossible de contacter le serveur.'));
    fetchHealthMock.mockResolvedValueOnce({ status: 'ok', service: 'cra-api', apiVersion: '0.1.0' });

    render(<HealthPage />);

    const retryButton = await screen.findByRole('button', { name: 'Réessayer' });
    await user.click(retryButton);

    expect(await screen.findByText('API disponible')).toBeInTheDocument();
    expect(fetchHealthMock).toHaveBeenCalledTimes(2);
  });
});
