import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SearchBox from '../components/SearchBox';
import TermCard from '../components/TermCard';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function HomePage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [latestTerms, setLatestTerms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const initialQuery = searchParams.get('q') || '';

  // Clear the q param after consuming it
  useEffect(() => {
    if (initialQuery) {
      const next = new URLSearchParams(searchParams);
      next.delete('q');
      setSearchParams(next, { replace: true });
    }
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const [terms, searches] = await Promise.all([
          api.getLatestTerms(12),
          user ? api.getRecentSearches().catch(() => []) : Promise.resolve([]),
        ]);
        setLatestTerms(terms);
        setRecentSearches(searches);
      } catch {} finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-3">
          <img src="/favicon.ico" alt="通达信" className="w-10 h-10" />
          <h1 className="text-4xl font-bold text-gray-900">通达信知识问答词条库</h1>
        </div>
        <p className="text-gray-500 text-lg">搜索、学习、贡献专业知识</p>
      </div>

      {/* Search */}
      <div className="mb-10">
        <SearchBox initialQuery={initialQuery} />
      </div>

      {/* Recent search queries */}
      {recentSearches.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-medium text-gray-500 mb-3">最近搜索</h2>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((q, i) => (
              <button
                key={i}
                onClick={() => setSearchParams({ q })}
                className="group relative inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
              >
                {q}
                <span
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      await api.deleteRecentSearch(q);
                      setRecentSearches(prev => prev.filter(s => s !== q));
                    } catch {}
                  }}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity ml-0.5 -mr-1"
                  title="删除"
                >
                  ×
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Latest terms */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">最新词条</h2>
        {loading ? (
          <div className="text-center py-12 text-gray-400">加载中...</div>
        ) : latestTerms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {latestTerms.map(term => (
              <TermCard key={term.id} term={term} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            还没有词条，<Link to="/create" className="text-indigo-600 hover:underline">创建第一个</Link>
          </div>
        )}
      </div>
    </div>
  );
}
