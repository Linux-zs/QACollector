import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

interface Term {
  id: number;
  question: string;
  answer: string;
  category: string | null;
  tags: string;
  author_name: string;
  created_at: string;
}

export default function TermsManagePage() {
  const { user, isAdmin, isContributor } = useAuth();
  const navigate = useNavigate();
  const [terms, setTerms] = useState<Term[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [searchQ, setSearchQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getCategories().catch(() => []),
      api.getTags().catch(() => []),
    ]).then(([cats, tgs]) => {
      setCategories(cats);
      setTags(tgs);
    });
  }, []);

  useEffect(() => {
    loadTerms();
  }, [selectedCategory, selectedTags]);

  function toggleTag(tag: string) {
    setSelectedTags(prev => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag); else next.add(tag);
      return next;
    });
  }

  async function loadTerms() {
    setLoading(true);
    try {
      let data: Term[];
      if (searchQ.trim()) {
        data = await api.searchTerms(searchQ, 100);
      } else if (selectedCategory || selectedTags.size > 0) {
        data = await api.filterTerms({
          category: selectedCategory || undefined,
          tags: selectedTags.size > 0 ? [...selectedTags] : undefined,
          limit: 100,
        });
      } else {
        data = await api.getLatestTerms(100);
      }
      setTerms(data);
    } catch {} finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSelectedCategory('');
    setSelectedTags(new Set());
    loadTerms();
  }

  async function handleDelete(id: number, question: string) {
    if (!confirm(`确定删除词条「${question}」吗？`)) return;
    try {
      await api.deleteTerm(id);
      setTerms(terms.filter(t => t.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  }

  function parseTags(tagsStr: string): string[] {
    try { return JSON.parse(tagsStr); } catch { return []; }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">词条管理</h1>
        {isContributor && (
          <Link to="/create" className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
            + 新建词条
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-6">
        <div className="flex flex-wrap gap-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="搜索词条..."
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-60"
            />
            <button type="submit" className="px-3 py-2 text-sm bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200">
              搜索
            </button>
          </form>
          <select
            value={selectedCategory}
            onChange={e => { setSelectedCategory(e.target.value); setSearchQ(''); }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">全部分类</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {(searchQ || selectedCategory || selectedTags.size > 0) && (
            <button onClick={() => { setSearchQ(''); setSelectedCategory(''); setSelectedTags(new Set()); }} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">
              清除筛选
            </button>
          )}
          <span className="ml-auto text-sm text-gray-400 self-center">共 {terms.length} 条</span>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map(tag => (
              <button
                key={tag}
                onClick={() => { toggleTag(tag); setSearchQ(''); }}
                className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                  selectedTags.has(tag)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Terms table */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">加载中...</div>
      ) : terms.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">问题</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">分类</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">标签</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">创建者</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {terms.map(term => {
                const tags = parseTags(term.tags);
                const canEdit = isAdmin || term.author_name === user?.username;
                return (
                  <tr key={term.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link to={`/term/${term.id}`} className="text-sm font-medium text-gray-900 hover:text-indigo-600 line-clamp-1">
                        {term.question}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      {term.category && (
                        <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{term.category}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">#{tag}</span>
                        ))}
                        {tags.length > 3 && <span className="text-xs text-gray-400">+{tags.length - 3}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{term.author_name}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {canEdit && (
                          <button
                            onClick={() => navigate(`/edit/${term.id}`)}
                            className="text-xs text-indigo-600 hover:text-indigo-700 px-2 py-1 rounded hover:bg-indigo-50"
                          >
                            编辑
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(term.id, term.question)}
                            className="text-xs text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                          >
                            删除
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">没有找到词条</div>
      )}
    </div>
  );
}
