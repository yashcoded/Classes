import { useCallback, useEffect, useState } from 'react';
import * as batchApi from '@/services/batchApi';
import type { Batch } from '@/types';
import { useAuth } from '@/hooks/useAuth';

interface UseBatchesResult {
  batches: Batch[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useBatches(): UseBatchesResult {
  const { user } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!user) return;
    setIsLoading(true);
    setError(null);

    const fetchPromise =
      user.role === 'student'
        ? batchApi.getStudentBatches(user.id)
        : batchApi.getMyBatches();

    fetchPromise
      .then((data) => {
        setBatches(data);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load batches');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  return { batches, isLoading, error, refresh: load };
}
