import { useState, useEffect } from 'react';
import { api } from '../api/client';

interface TermFormProps {
  initialData?: {
    question: string;
    answer: string;
    category: string;
    tags: string[];
  };
  onSubmit: (data: { question: string; answer: string; category: string; tags: string[] }) => Promise<void>;
  submitLabel: string;
}

export default function TermForm({ initialData, onSubmit, submitLabel }: TermFormProps) {
  const [question, setQuestion] = useState(initialData?.question || '');
  const [answer, setAnswer] = useState(initialData?.answer || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(', ') || '');
  const [categories, setCategories] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!question.trim() || !answer.trim()) {
      setError('问题和答案不能为空');
      return;
    }
    const tags = tagsInput.split(/[,，]/).map(t => t.trim()).filter(Boolean);
    setLoading(true);
    try {
      await onSubmit({ question, answer, category, tags });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
      {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">问题</label>
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="输入问题标题"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">答案</label>
        <textarea
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="输入详细答案"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">分类（可选）</label>
          <input
            type="text"
            value={category}
            onChange={e => setCategory(e.target.value)}
            list="category-options"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="如：JavaScript、数据库"
          />
          <datalist id="category-options">
            {categories.map(cat => <option key={cat} value={cat} />)}
          </datalist>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">标签（逗号分隔）</label>
          <input
            type="text"
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="如：React, Hook, 前端"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {loading ? '提交中...' : submitLabel}
      </button>
    </form>
  );
}
