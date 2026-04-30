import { useState, useRef, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../hooks/useSearch';

function highlightText(text: string, query: string): ReactNode {
  if (!query) return text;
  const parts: ReactNode[] = [];
  let lastIdx = 0;
  const lower = text.toLowerCase();
  const qLower = query.toLowerCase();
  let idx = lower.indexOf(qLower);
  while (idx !== -1) {
    if (idx > lastIdx) parts.push(text.slice(lastIdx, idx));
    parts.push(<mark key={idx} className="bg-yellow-200 text-gray-900 font-semibold rounded-sm px-0.5">{text.slice(idx, idx + query.length)}</mark>);
    lastIdx = idx + query.length;
    idx = lower.indexOf(qLower, lastIdx);
  }
  if (lastIdx < text.length) parts.push(text.slice(lastIdx));
  return parts.length > 0 ? <>{parts}</> : text;
}

export default function SearchBox({ initialQuery }: { initialQuery?: string } = {}) {
  const { query, setQuery, results, loading } = useSearch();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      setOpen(true);
    }
  }, [initialQuery, setQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(id: number) {
    setOpen(false);
    setQuery('');
    navigate(`/term/${id}`);
  }

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl mx-auto">
      <input
        type="text"
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => { if (query) setOpen(true); }}
        placeholder="搜索专业知识词条..."
        className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
      />
      {loading && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {open && (results.length > 0 || loading) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
          {loading && results.length === 0 && (
            <div className="px-4 py-3 text-center text-gray-400 text-sm">搜索中...</div>
          )}
          {results.map(term => (
            <button
              key={term.id}
              onClick={() => handleSelect(term.id)}
              className="w-full text-left px-4 py-3 hover:bg-indigo-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="font-medium text-gray-900">{term.question}</div>
              {term.matchField === 'answer' && term.matchSnippet && (
                <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                  {highlightText(term.matchSnippet, query)}
                </div>
              )}
              {term.matchField === 'tags' && term.matchedTags && term.matchedTags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 mt-1">
                  <span className="text-xs text-gray-400">匹配标签:</span>
                  {term.matchedTags.map(tag => (
                    <span key={tag} className="text-xs text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                      #{highlightText(tag, query)}
                    </span>
                  ))}
                </div>
              )}
              {term.category && (
                <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mt-1 inline-block">
                  {term.category}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
      {open && query && results.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4 text-center text-gray-500">
          未找到匹配的词条
        </div>
      )}
    </div>
  );
}
