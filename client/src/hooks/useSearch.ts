import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../api/client';

interface Term {
  id: number;
  question: string;
  answer: string;
  category: string | null;
  tags: string;
  created_by: number;
  author_name: string;
}

export function useSearch(debounceMs = 300) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Term[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await api.searchTerms(q);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => search(query), debounceMs);
    return () => clearTimeout(debounceTimer.current);
  }, [query, debounceMs, search]);

  return { query, setQuery, results, loading };
}
