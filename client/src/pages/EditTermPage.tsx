import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import TermForm from '../components/TermForm';
import { api } from '../api/client';

export default function EditTermPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [term, setTerm] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTerm(Number(id))
      .then(setTerm)
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-12 text-gray-400">加载中...</div>;
  if (!term) return null;

  let tags: string[] = [];
  try { tags = JSON.parse(term.tags); } catch {}

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to={`/term/${id}`} className="text-sm text-gray-500 hover:text-indigo-600 mb-6 inline-block">
        &larr; 返回词条
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">编辑词条</h1>
      <TermForm
        initialData={{
          question: term.question,
          answer: term.answer,
          category: term.category || '',
          tags,
        }}
        submitLabel="保存修改"
        onSubmit={async (data) => {
          await api.updateTerm(Number(id), data);
          navigate(`/term/${id}`);
        }}
      />
    </div>
  );
}
