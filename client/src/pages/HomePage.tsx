import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchBox from '../components/SearchBox';
import TermCard from '../components/TermCard';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function HomePage() {
  const { user } = useAuth();
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [latestTerms, setLatestTerms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
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
    loadData();
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
        <SearchBox />
      </div>

      {/* Recent search queries */}
      {recentSearches.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-medium text-gray-500 mb-3">最近搜索</h2>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((q, i) => (
              <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-full">
                {q}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Latest terms */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">最新词条</h2>
          {user?.role !== 'viewer' && (
            <Link to="/create" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              + 新建词条
            </Link>
          )}
        </div>
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
