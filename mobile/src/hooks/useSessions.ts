import { useCallback, useEffect, useState } from 'react';
import * as sessionApi from '@/services/sessionApi';
import type { ClassSession } from '@/types';

interface UseSessionsResult {
  sessions: ClassSession[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useSessions(): UseSessionsResult {
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setIsLoading(true);
    setError(null);
    sessionApi
      .getMySessions()
      .then((data) => {
        setSessions(data);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : 'Failed to load sessions',
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { sessions, isLoading, error, refresh: load };
}
