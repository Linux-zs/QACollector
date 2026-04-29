import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

interface Term {
  id: number;
  question: string;
  answer: string;
  category: string | null;
  tags: string;
  created_by: number;
  updated_by: number | null;
  author_name: string;
  updater_name: string | null;
  created_at: string;
  updated_at: string;
}

export default function TermDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [term, setTerm] = useState<Term | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTerm(Number(id))
      .then(setTerm)
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!confirm('确定删除这个词条吗？')) return;
    try {
      await api.deleteTerm(Number(id));
      navigate('/');
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-400">加载中...</div>;
  if (!term) return null;

  const tags: string[] = (() => { try { return JSON.parse(term.tags); } catch { return []; } })();
  const canEdit = user && (isAdmin || term.created_by === user.id);
  const canDelete = isAdmin;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/" className="text-sm text-gray-500 hover:text-indigo-600 mb-6 inline-block">
        &larr; 返回首页
      </Link>

      <article className="bg-white rounded-xl border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{term.question}</h1>

        <div className="flex items-center gap-3 mb-6 text-sm text-gray-500">
          {term.category && (
            <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{term.category}</span>
          )}
          {tags.map(tag => (
            <span key={tag} className="bg-gray-100 px-2 py-0.5 rounded">#{tag}</span>
          ))}
        </div>

        <div className="prose prose-gray max-w-none mb-6">
          <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{term.answer}</p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-400">
            <span>创建者: {term.author_name}</span>
            {term.updater_name && <span className="ml-3">更新者: {term.updater_name}</span>}
            <span className="ml-3">创建于: {new Date(term.created_at).toLocaleDateString('zh-CN')}</span>
          </div>
          <div className="flex gap-2">
            {canEdit && (
              <Link
                to={`/edit/${term.id}`}
                className="px-3 py-1.5 text-sm text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50"
              >
                编辑
              </Link>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
              >
                删除
              </button>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
