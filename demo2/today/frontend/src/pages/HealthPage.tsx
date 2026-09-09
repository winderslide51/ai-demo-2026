import { useHealth } from '../hooks/useHealth';
import { StatusMessage } from '../components/StatusMessage';

/**
 * Renders the API health probe with its three mandatory remote states
 * (frozen French copy — see docs/architecture/0001-project-scaffold.md §7.5).
 */
export function HealthPage() {
  const { state, reload } = useHealth();

  return (
    <main>
      <h1>État de l&apos;API</h1>
      {state.status === 'loading' && (
        <StatusMessage tone="pending" title="Vérification de l'état de l'API…" />
      )}
      {state.status === 'success' && (
        <StatusMessage
          tone="success"
          title="API disponible"
          description={
            <>
              <span>Service : {state.data.service}</span>
              <br />
              <span>Version : {state.data.apiVersion}</span>
            </>
          }
        />
      )}
      {state.status === 'error' && (
        <StatusMessage
          tone="danger"
          title="API indisponible"
          description={state.message}
          action={{ label: 'Réessayer', onClick: reload }}
        />
      )}
    </main>
  );
}
