import { useCallback, useEffect, useState } from 'react';
import * as attendanceApi from '@/services/attendanceApi';
import type { AttendanceRecord } from '@/types';

interface UseAttendanceResult {
  records: AttendanceRecord[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useAttendance(): UseAttendanceResult {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setIsLoading(true);
    setError(null);
    attendanceApi
      .getMyAttendance()
      .then((data) => {
        setRecords(data);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : 'Failed to load attendance',
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { records, isLoading, error, refresh: load };
}
