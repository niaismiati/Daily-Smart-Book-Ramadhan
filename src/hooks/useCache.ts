import { useState, useEffect, useRef, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const DEFAULT_TTL = 60000; // 1 minute

export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = DEFAULT_TTL
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < ttl) {
      setData(cached.data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const result = await fetcher();
      cache.set(key, { data: result, timestamp: Date.now() });
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Fetch failed');
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, ttl]);

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, ttl);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData]);

  const invalidate = useCallback(() => {
    cache.delete(key);
    fetchData();
  }, [key, fetchData]);

  return { data, loading, error, refetch: fetchData, invalidate };
}

export function clearCache() {
  cache.clear();
}
