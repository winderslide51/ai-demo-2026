import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchHealth } from '../api/health';
import { ApiError } from '../api/client';
import type { HealthDto } from '../types/health';
import type { RequestState } from '../types/api';

interface UseHealthResult {
  state: RequestState<HealthDto>;
  reload: () => void;
}

/**
 * Isolates the remote state of the health probe so `HealthPage` never calls
 * `fetch` directly (see `.claude/rules/react-dont.md`).
 */
export function useHealth(): UseHealthResult {
  const [state, setState] = useState<RequestState<HealthDto>>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const isMountedRef = useRef(true);

  useEffect(
    () => () => {
      isMountedRef.current = false;
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    fetchHealth()
      .then((data) => {
        if (cancelled || !isMountedRef.current) return;
        setState({ status: 'success', data });
      })
      .catch((error: unknown) => {
        if (cancelled || !isMountedRef.current) return;
        const message = error instanceof ApiError ? error.detail : NETWORK_UNKNOWN_MESSAGE;
        setState({ status: 'error', message });
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const reload = useCallback(() => {
    setAttempt((previous) => previous + 1);
  }, []);

  return { state, reload };
}

const NETWORK_UNKNOWN_MESSAGE = 'Une erreur est survenue.';
